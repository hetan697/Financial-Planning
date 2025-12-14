<template>
  <div class="dashboard">
    <!-- 财务概览 -->
    <el-card class="summary-cards">
      <template #header>
        <div class="card-header">
          <span>财务概览</span>
        </div>
      </template>
      
      <el-row :gutter="15">
        <el-col :span="6" :xs="12">
          <div class="summary-item">
            <h4>总收入</h4>
            <p class="amount income">¥{{ totalIncome.toFixed(2) }}</p>
          </div>
        </el-col>
        
        <el-col :span="6" :xs="12">
          <div class="summary-item">
            <h4>总支出</h4>
            <p class="amount expense">¥{{ totalExpense.toFixed(2) }}</p>
          </div>
        </el-col>
        
        <el-col :span="6" :xs="12">
          <div class="summary-item">
            <h4>账户余额</h4>
            <p 
              class="amount" 
              :class="{ expense: balance < 0, income: balance >= 0 }"
            >
              ¥{{ balance.toFixed(2) }}
            </p>
          </div>
        </el-col>
        
        <el-col :span="6" :xs="12">
          <div class="summary-item">
            <h4>投资总额</h4>
            <p class="amount investment">¥{{ totalInvestmentValue.toFixed(2) }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 图表区域 -->
    <el-row :gutter="15" class="charts-row">
      <el-col :span="24" v-if="hasTransactions || hasInvestments">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据可视化</span>
            </div>
          </template>
          
          <div class="chart-container">
            <canvas ref="trendChart"></canvas>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12" :xs="24" v-if="hasExpenseTransactions">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>支出分类</span>
            </div>
          </template>
          
          <div class="chart-container">
            <canvas ref="expenseChart"></canvas>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12" :xs="24" v-if="hasInvestments">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>投资收益</span>
            </div>
          </template>
          
          <div class="chart-container">
            <canvas ref="investmentChart"></canvas>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="24" v-if="!hasTransactions && !hasInvestments">
        <el-card>
          <div class="empty-state">
            <p>暂无数据，请先添加交易记录或投资项目</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  ElCard,
  ElRow,
  ElCol
} from 'element-plus';
import {
  Chart,
  LineController,
  BarController,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Legend,
  Tooltip,
  Title,
  Colors
} from 'chart.js';

// 注册Chart.js组件
Chart.register(
  LineController,
  BarController,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Legend,
  Tooltip,
  Title,
  Colors
);

export default {
  name: 'Dashboard',
  components: {
    ElCard,
    ElRow,
    ElCol
  },
  props: {
    transactions: {
      type: Array,
      default: () => []
    },
    investments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['export-data', 'import-data', 'clear-data'],
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.summary-cards {
  margin-bottom: 30px;
}

.card-header {
  font-weight: bold;
  font-size: 1.1rem;
}

.summary-item {
  text-align: center;
  padding: 20px 0;
}

.summary-item h4 {
  margin: 0 0 10px 0;
  font-size: 1rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.income {
  color: #f56c6c;
}

.expense {
  color: #67c23a;
}

.charts {
  margin-bottom: 30px;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-wrapper {
  position: relative;
  height: 300px;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
}

.data-management {
  margin-bottom: 30px;
}

.button-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .summary-item {
    padding: 10px 0;
  }
  
  .amount {
    font-size: 1.2rem;
  }
}
</style>