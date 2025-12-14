<template>
  <div class="dashboard">
    <!-- 财务概览 -->
    <div class="summary-section">
      <h2 class="section-title">财务概览</h2>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon income">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="summary-content">
            <h3>总收入</h3>
            <p class="amount income">¥{{ totalIncome.toFixed(2) }}</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon expense">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="summary-content">
            <h3>总支出</h3>
            <p class="amount expense">¥{{ totalExpense.toFixed(2) }}</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon balance">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="summary-content">
            <h3>账户余额</h3>
            <p 
              class="amount" 
              :class="{ expense: balance < 0, income: balance >= 0 }"
            >
              ¥{{ balance.toFixed(2) }}
            </p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon investment">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="summary-content">
            <h3>投资总额</h3>
            <p class="amount investment">¥{{ totalInvestmentValue.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-section">
      <h2 class="section-title">数据分析</h2>
      
      <div class="charts-grid" v-if="hasTransactions || hasInvestments">
        <div class="chart-card">
          <div class="chart-header">
            <h3>收支趋势</h3>
          </div>
          <div class="chart-container">
            <canvas ref="trendChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card" v-if="hasExpenseTransactions">
          <div class="chart-header">
            <h3>支出分类</h3>
          </div>
          <div class="chart-container">
            <canvas ref="expenseChart"></canvas>
          </div>
        </div>
        
        <div class="chart-card" v-if="hasInvestments">
          <div class="chart-header">
            <h3>投资收益</h3>
          </div>
          <div class="chart-container">
            <canvas ref="investmentChart"></canvas>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <div class="empty-icon">
          <el-icon><DataAnalysis /></el-icon>
        </div>
        <p>暂无数据，请先添加交易记录或投资项目</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ElIcon } from 'element-plus';
import { TrendCharts, Coin, Wallet, DataAnalysis } from '@element-plus/icons-vue';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// 注册Chart.js组件
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: 'Dashboard',
  components: {
    ElIcon,
    TrendCharts,
    Coin,
    Wallet,
    DataAnalysis
  },
  props: {
    transactions: {
      type: Array,
      required: true
    },
    investments: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      trendChart: null,
      expenseChart: null,
      investmentChart: null
    };
  },
  computed: {
    totalIncome() {
      return this.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    totalExpense() {
      return this.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    balance() {
      return this.totalIncome - this.totalExpense;
    },
    totalInvestmentValue() {
      return this.investments.reduce((sum, investment) => {
        const price = investment.currentPrice || investment.purchasePrice;
        return sum + (price * investment.quantity);
      }, 0);
    },
    hasTransactions() {
      return this.transactions.length > 0;
    },
    hasExpenseTransactions() {
      return this.transactions.filter(t => t.type === 'expense').length > 0;
    },
    hasInvestments() {
      return this.investments.length > 0;
    }
  },
  mounted() {
    this.renderCharts();
  },
  watch: {
    transactions: {
      handler() {
        this.destroyCharts();
        this.renderCharts();
      },
      deep: true
    },
    investments: {
      handler() {
        this.destroyCharts();
        this.renderCharts();
      },
      deep: true
    }
  },
  methods: {
    renderCharts() {
      this.$nextTick(() => {
        if (this.hasTransactions || this.hasInvestments) {
          this.renderTrendChart();
        }
        
        if (this.hasExpenseTransactions) {
          this.renderExpenseChart();
        }
        
        if (this.hasInvestments) {
          this.renderInvestmentChart();
        }
      });
    },
    destroyCharts() {
      if (this.trendChart) {
        this.trendChart.destroy();
        this.trendChart = null;
      }
      
      if (this.expenseChart) {
        this.expenseChart.destroy();
        this.expenseChart = null;
      }
      
      if (this.investmentChart) {
        this.investmentChart.destroy();
        this.investmentChart = null;
      }
    },
    renderTrendChart() {
      const ctx = this.$refs.trendChart?.getContext('2d');
      if (!ctx) return;
      
      // 按月份分组数据
      const monthlyData = {};
      
      this.transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      });
      
      // 转换为图表数据
      const months = Object.keys(monthlyData).sort();
      const incomeData = months.map(month => monthlyData[month].income);
      const expenseData = months.map(month => monthlyData[month].expense);
      
      this.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: '收入',
              data: incomeData,
              borderColor: '#f56c6c',
              backgroundColor: 'rgba(245, 108, 108, 0.1)',
              tension: 0.1,
              fill: true
            },
            {
              label: '支出',
              data: expenseData,
              borderColor: '#67c23a',
              backgroundColor: 'rgba(103, 194, 58, 0.1)',
              tension: 0.1,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: '收支趋势'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    renderExpenseChart() {
      const ctx = this.$refs.expenseChart?.getContext('2d');
      if (!ctx) return;
      
      // 按描述分组支出数据
      const expenseData = {};
      
      this.transactions
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
          if (!expenseData[transaction.description]) {
            expenseData[transaction.description] = 0;
          }
          expenseData[transaction.description] += transaction.amount;
        });
      
      // 转换为图表数据
      const labels = Object.keys(expenseData);
      const data = Object.values(expenseData);
      
      this.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                '#f56c6c',
                '#67c23a',
                '#409eff',
                '#e6a23c',
                '#722ed1',
                '#f56c6c',
                '#67c23a',
                '#409eff',
                '#e6a23c',
                '#722ed1'
              ]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: '支出分类'
            }
          }
        }
      });
    },
    renderInvestmentChart() {
      const ctx = this.$refs.investmentChart?.getContext('2d');
      if (!ctx) return;
      
      // 计算每个投资的收益
      const investmentLabels = [];
      const investmentProfits = [];
      const backgroundColors = [];
      
      this.investments.forEach((investment, index) => {
        const cost = investment.purchasePrice * investment.quantity;
        const currentValue = (investment.currentPrice || investment.purchasePrice) * investment.quantity;
        const profit = currentValue - cost;
        
        investmentLabels.push(investment.name);
        investmentProfits.push(profit);
        
        // 根据盈亏设置颜色
        if (profit >= 0) {
          backgroundColors.push('#f56c6c'); // 盈利用红色
        } else {
          backgroundColors.push('#67c23a'); // 亏损用绿色
        }
      });
      
      this.investmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: investmentLabels,
          datasets: [
            {
              label: '收益',
              data: investmentProfits,
              backgroundColor: backgroundColors
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: '投资收益'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  },
  beforeUnmount() {
    this.destroyCharts();
  }
};
</script>

<style scoped>
.dashboard {
  padding: 20px 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.summary-section {
  margin-bottom: 30px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.summary-icon.income {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.summary-icon.expense {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.summary-icon.balance {
  background: rgba(102, 184, 255, 0.1);
  color: #409eff;
}

.summary-icon.investment {
  background: rgba(142, 84, 228, 0.1);
  color: #8e54e4;
}

.summary-content h3 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.amount {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.amount.income {
  color: #f56c6c;
}

.amount.expense {
  color: #67c23a;
}

.amount.investment {
  color: #8e54e4;
}

.charts-section {
  margin-bottom: 30px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.chart-header h3 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 500;
}

.chart-container {
  position: relative;
  height: 300px;
}

.empty-state {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.empty-state p {
  margin: 0;
  color: #909399;
  font-size: 1.1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 15px 0;
  }
  
  .section-title {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .summary-cards {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .summary-card {
    padding: 15px;
  }
  
  .summary-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin-right: 10px;
  }
  
  .amount {
    font-size: 1.2rem;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .chart-card {
    padding: 15px;
  }
  
  .chart-container {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>