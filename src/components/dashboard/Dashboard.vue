<template>
  <div class="dashboard">
    <!-- 财务概览 -->
    <div class="card-section">
      <div class="card-header">
        <span class="card-title">财务概览</span>
      </div>
      
      <div class="summary-grid">
        <div class="summary-item">
          <h4>总收入</h4>
          <p class="amount income">¥{{ totalIncome.toFixed(2) }}</p>
        </div>
        
        <div class="summary-item">
          <h4>总支出</h4>
          <p class="amount expense">¥{{ totalExpense.toFixed(2) }}</p>
        </div>
        
        <div class="summary-item">
          <h4>账户余额</h4>
          <p 
            class="amount" 
            :class="{ expense: balance < 0, income: balance >= 0 }"
          >
            ¥{{ balance.toFixed(2) }}
          </p>
        </div>
        
        <div class="summary-item">
          <h4>投资总额</h4>
          <p class="amount investment">¥{{ totalInvestmentValue.toFixed(2) }}</p>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-container">
      <div class="card-section" v-if="hasTransactions || hasInvestments">
        <div class="card-header">
          <span class="card-title">数据可视化</span>
        </div>
        
        <div class="chart-container">
          <canvas ref="trendChart"></canvas>
        </div>
      </div>
      
      <div class="charts-row">
        <div class="card-section" v-if="hasExpenseData">
          <div class="card-header">
            <span class="card-title">支出分类</span>
          </div>
          
          <div class="chart-container">
            <canvas ref="expenseChart"></canvas>
          </div>
        </div>
        
        <div class="card-section" v-if="hasInvestments">
          <div class="card-header">
            <span class="card-title">投资收益</span>
          </div>
          
          <div class="chart-container">
            <canvas ref="investmentChart"></canvas>
          </div>
        </div>
      </div>
      
      <div class="card-section" v-if="!hasTransactions && !hasInvestments">
        <div class="empty-state">
          <p>暂无数据，请先添加交易记录或投资项目</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  Filler
} from 'chart.js';

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
  Filler
);

export default {
  name: 'Dashboard',
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
        .reduce((sum, t) => sum + t.amount, 0);
    },
    totalExpense() {
      return this.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    },
    balance() {
      return this.totalIncome - this.totalExpense;
    },
    totalInvestmentValue() {
      return this.investments.reduce((sum, investment) => {
        const currentValue = investment.currentPrice !== null ? 
          investment.currentPrice : investment.purchasePrice;
        return sum + (investment.quantity * currentValue);
      }, 0);
    },
    hasTransactions() {
      return this.transactions.length > 0;
    },
    hasInvestments() {
      return this.investments.length > 0;
    },
    hasExpenseData() {
      return this.transactions.some(t => t.type === 'expense');
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}-${date.getDate()}`;
    },
    getMonthName(monthIndex) {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', 
                     '7月', '8月', '9月', '10月', '11月', '12月'];
      return months[monthIndex];
    },
    getLastSixMonths() {
      const months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          year: date.getFullYear(),
          month: date.getMonth(),
          label: this.getMonthName(date.getMonth())
        });
      }
      
      return months;
    },
    getMonthlyData(months) {
      const incomeData = [];
      const expenseData = [];
      
      months.forEach(({ year, month }) => {
        const monthlyTransactions = this.transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === year && tDate.getMonth() === month;
        });
        
        const income = monthlyTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expense = monthlyTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
          
        incomeData.push(income);
        expenseData.push(expense);
      });
      
      return { incomeData, expenseData };
    },
    initTrendChart() {
      if (this.trendChart) {
        this.trendChart.destroy();
      }
      
      const ctx = this.$refs.trendChart.getContext('2d');
      const months = this.getLastSixMonths();
      const labels = months.map(m => m.label);
      const { incomeData, expenseData } = this.getMonthlyData(months);
      
      this.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: '收入',
              data: incomeData,
              borderColor: '#34C759',
              backgroundColor: 'rgba(52, 199, 89, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: '支出',
              data: expenseData,
              borderColor: '#FF3B30',
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    },
    initExpenseChart() {
      if (this.expenseChart) {
        this.expenseChart.destroy();
      }
      
      const ctx = this.$refs.expenseChart.getContext('2d');
      
      // 计算支出分类数据
      const expenseByType = {};
      this.transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          // 使用description字段代替不存在的category字段
          const type = t.description || '未分类';
          if (!expenseByType[type]) {
            expenseByType[type] = 0;
          }
          expenseByType[type] += t.amount;
        });
      
      const labels = Object.keys(expenseByType);
      const data = Object.values(expenseByType);
      
      // 只有当有数据时才渲染图表
      if (labels.length === 0) {
        return;
      }
      
      // iOS风格的颜色
      const colors = [
        '#007AFF', '#34C759', '#FF3B30', '#FF9500', 
        '#AF52DE', '#5AC8FA', '#FFCC00', '#FF2D55'
      ];
      
      this.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors.slice(0, labels.length).concat(colors),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 15
              }
            }
          }
        }
      });
    },
    initInvestmentChart() {
      if (this.investmentChart) {
        this.investmentChart.destroy();
      }
      
      const ctx = this.$refs.investmentChart.getContext('2d');
      
      // 计算投资数据
      const investmentLabels = this.investments.map(inv => inv.name);
      const investmentValues = this.investments.map(inv => {
        const currentValue = inv.currentPrice !== null ? 
          inv.currentPrice : inv.purchasePrice;
        return inv.quantity * currentValue;
      });
      
      const profitLoss = this.investments.map(inv => {
        const currentValue = inv.currentPrice !== null ? 
          inv.currentPrice : inv.purchasePrice;
        return (currentValue - inv.purchasePrice) * inv.quantity;
      });
      
      this.investmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: investmentLabels,
          datasets: [
            {
              label: '投资价值',
              data: investmentValues,
              backgroundColor: '#34C759',
              borderWidth: 0
            },
            {
              label: '盈亏',
              data: profitLoss,
              backgroundColor: profitLoss.map(p => p >= 0 ? '#34C759' : '#FF3B30'),
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    },
    initCharts() {
      if (this.hasTransactions || this.hasInvestments) {
        this.$nextTick(() => {
          if (this.hasTransactions) {
            this.initTrendChart();
            if (this.hasExpenseTransactions) {
              this.initExpenseChart();
            }
          }
          if (this.hasInvestments) {
            this.initInvestmentChart();
          }
        });
      }
    }
  },
  mounted() {
    this.initCharts();
  },
  beforeUnmount() {
    if (this.trendChart) {
      this.trendChart.destroy();
    }
    if (this.expenseChart) {
      this.expenseChart.destroy();
    }
    if (this.investmentChart) {
      this.investmentChart.destroy();
    }
  },
  watch: {
    transactions: {
      handler() {
        this.initCharts();
      },
      deep: true
    },
    investments: {
      handler() {
        this.initCharts();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
}

.card-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 10px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  border-radius: 12px;
  background: #F2F2F7;
}

.summary-item h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.amount {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.amount.income {
  color: #34C759;
}

.amount.expense {
  color: #FF3B30;
}

.amount.investment {
  color: #007AFF;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>