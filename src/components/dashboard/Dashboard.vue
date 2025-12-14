<template>
  <div class="dashboard">
    <!-- 财务概览 -->
    <el-card class="summary-cards">
      <template #header>
        <div class="card-header">
          <span>财务概览</span>
        </div>
      </template>
      
      <el-row :gutter="20">
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
            <p class="amount">¥{{ totalInvestmentValue.toFixed(2) }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 图表区域 -->
    <el-row :gutter="10" class="charts">
      <!-- 收支趋势图 -->
      <el-col :span="24" :xs="24">
        <el-card class="chart-container">
          <template #header>
            <div class="card-header">
              <span>收支趋势</span>
            </div>
          </template>
          <div class="chart-wrapper">
            <canvas ref="incomeExpenseChart" v-show="hasTransactions"></canvas>
            <div v-if="!hasTransactions" class="chart-placeholder">
              <p>暂无交易数据</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 支出分类饼图 -->
      <el-col :span="24" :xs="24">
        <el-card class="chart-container">
          <template #header>
            <div class="card-header">
              <span>支出分类</span>
            </div>
          </template>
          <div class="chart-wrapper">
            <canvas ref="expenseCategoryChart" v-show="hasExpenseTransactions"></canvas>
            <div v-if="!hasExpenseTransactions" class="chart-placeholder">
              <p>暂无支出数据</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 投资收益趋势图 -->
      <el-col :span="24" :xs="24">
        <el-card class="chart-container">
          <template #header>
            <div class="card-header">
              <span>投资收益趋势</span>
            </div>
          </template>
          <div class="chart-wrapper">
            <canvas ref="investmentReturnChart" v-show="hasInvestments"></canvas>
            <div v-if="!hasInvestments" class="chart-placeholder">
              <p>暂无投资数据</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 数据管理 -->
    <el-card class="data-management">
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
        </div>
      </template>
      <div class="button-group">
        <el-button type="success" @click="exportData">导出数据</el-button>
        <el-button type="primary" @click="triggerImport">导入数据</el-button>
        <input ref="fileInput" type="file" @change="importData" accept=".json" style="display: none;">
        <el-button type="danger" @click="clearAllData">清除所有数据</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { ElRow, ElCol, ElCard, ElButton } from 'element-plus';
Chart.register(...registerables);

export default {
  name: 'Dashboard',
  components: {
    ElRow,
    ElCol,
    ElCard,
    ElButton
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
      incomeExpenseChart: null,
      expenseCategoryChart: null,
      investmentReturnChart: null
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
    exportData() {
      this.$emit('export-data');
    },
    triggerImport() {
      this.$refs.fileInput.click();
    },
    importData(event) {
      this.$emit('import-data', event);
    },
    clearAllData() {
      this.$emit('clear-data');
    },
    renderCharts() {
      this.renderIncomeExpenseChart();
      this.renderExpenseCategoryChart();
      this.renderInvestmentReturnChart();
    },
    destroyCharts() {
      if (this.incomeExpenseChart) {
        this.incomeExpenseChart.destroy();
      }
      if (this.expenseCategoryChart) {
        this.expenseCategoryChart.destroy();
      }
      if (this.investmentReturnChart) {
        this.investmentReturnChart.destroy();
      }
    },
    // 收支趋势图
    renderIncomeExpenseChart() {
      if (!this.hasTransactions) return;
      
      const ctx = this.$refs.incomeExpenseChart.getContext('2d');
      
      // 按月份分组数据
      const monthlyData = this.groupTransactionsByMonth();
      
      // 准备图表数据
      const labels = Object.keys(monthlyData).sort();
      const incomeData = labels.map(month => monthlyData[month].income);
      const expenseData = labels.map(month => monthlyData[month].expense);
      
      this.incomeExpenseChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: '收入',
              data: incomeData,
              borderColor: '#f56c6c',
              backgroundColor: 'rgba(245, 108, 108, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: '支出',
              data: expenseData,
              borderColor: '#67c23a',
              backgroundColor: 'rgba(103, 194, 58, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '¥' + value;
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ¥' + context.parsed.y;
                }
              }
            }
          }
        }
      });
    },
    // 支出分类饼图
    renderExpenseCategoryChart() {
      if (!this.hasExpenseTransactions) return;
      
      const ctx = this.$refs.expenseCategoryChart.getContext('2d');
      
      // 按描述分组支出数据
      const expenseCategories = this.groupExpensesByCategory();
      
      // 准备图表数据
      const labels = Object.keys(expenseCategories);
      const data = labels.map(label => expenseCategories[label]);
      const backgroundColors = this.generateColors(labels.length);
      
      this.expenseCategoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ¥${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    // 投资收益趋势图
    renderInvestmentReturnChart() {
      if (!this.hasInvestments) return;
      
      const ctx = this.$refs.investmentReturnChart.getContext('2d');
      
      // 准备投资数据
      const investmentLabels = this.investments.map(inv => inv.name);
      const profitData = this.investments.map(inv => {
        const currentValue = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
        const cost = inv.purchasePrice * inv.quantity;
        return currentValue - cost;
      });
      
      // 设置颜色（正收益为红色，负收益为绿色）
      const backgroundColors = profitData.map(profit => 
        profit >= 0 ? 'rgba(245, 108, 108, 0.6)' : 'rgba(103, 194, 58, 0.6)'
      );
      
      const borderColors = profitData.map(profit => 
        profit >= 0 ? 'rgb(245, 108, 108)' : 'rgb(103, 194, 58)'
      );
      
      this.investmentReturnChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: investmentLabels,
          datasets: [{
            label: '投资收益',
            data: profitData,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '¥' + value;
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return '收益: ¥' + context.parsed.y;
                }
              }
            }
          }
        }
      });
    },
    // 按月份分组交易数据
    groupTransactionsByMonth() {
      const grouped = {};
      
      this.transactions.forEach(transaction => {
        // 提取年月作为键
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!grouped[monthKey]) {
          grouped[monthKey] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
          grouped[monthKey].income += transaction.amount;
        } else {
          grouped[monthKey].expense += transaction.amount;
        }
      });
      
      return grouped;
    },
    // 按类别分组支出数据
    groupExpensesByCategory() {
      const grouped = {};
      
      const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
      
      expenseTransactions.forEach(transaction => {
        const category = transaction.description;
        if (!grouped[category]) {
          grouped[category] = 0;
        }
        grouped[category] += transaction.amount;
      });
      
      return grouped;
    },
    // 生成随机颜色
    generateColors(count) {
      const colors = [];
      const hueStep = 360 / count;
      
      for (let i = 0; i < count; i++) {
        const hue = i * hueStep;
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
      
      return colors;
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