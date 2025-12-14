<template>
  <div class="dashboard">
    <h2>数据看板</h2>
    
    <!-- 财务概览 -->
    <div class="summary-cards">
      <div class="card">
        <h3>总收入</h3>
        <p class="amount income">¥{{ totalIncome.toFixed(2) }}</p>
      </div>
      <div class="card">
        <h3>总支出</h3>
        <p class="amount expense">¥{{ totalExpense.toFixed(2) }}</p>
      </div>
      <div class="card">
        <h3>账户余额</h3>
        <p class="amount" :class="{ expense: balance < 0, income: balance >= 0 }">
          ¥{{ balance.toFixed(2) }}
        </p>
      </div>
      <div class="card">
        <h3>投资总额</h3>
        <p class="amount">¥{{ totalInvestmentValue.toFixed(2) }}</p>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts">
      <!-- 收支趋势图 -->
      <div class="chart-container">
        <h3>收支趋势</h3>
        <div class="chart-wrapper">
          <canvas ref="incomeExpenseChart" v-show="hasTransactions"></canvas>
          <div v-if="!hasTransactions" class="chart-placeholder">
            <p>暂无交易数据</p>
          </div>
        </div>
      </div>
      
      <!-- 支出分类饼图 -->
      <div class="chart-container">
        <h3>支出分类</h3>
        <div class="chart-wrapper">
          <canvas ref="expenseCategoryChart" v-show="hasExpenseTransactions"></canvas>
          <div v-if="!hasExpenseTransactions" class="chart-placeholder">
            <p>暂无支出数据</p>
          </div>
        </div>
      </div>
      
      <!-- 投资收益趋势图 -->
      <div class="chart-container">
        <h3>投资收益趋势</h3>
        <div class="chart-wrapper">
          <canvas ref="investmentReturnChart" v-show="hasInvestments"></canvas>
          <div v-if="!hasInvestments" class="chart-placeholder">
            <p>暂无投资数据</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据管理 -->
    <div class="data-management">
      <h3>数据管理</h3>
      <div class="button-group">
        <button @click="exportData" class="export-btn">导出数据</button>
        <label class="import-label">
          导入数据
          <input type="file" @change="importData" accept=".json" class="import-input">
        </label>
        <button @click="clearAllData" class="clear-btn">清除所有数据</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

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
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: '支出',
              data: expenseData,
              borderColor: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
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
              position: 'right',
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
      
      // 设置颜色（正收益为绿色，负收益为红色）
      const backgroundColors = profitData.map(profit => 
        profit >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'
      );
      
      const borderColors = profitData.map(profit => 
        profit >= 0 ? 'rgb(76, 175, 80)' : 'rgb(244, 67, 54)'
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
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.dashboard h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 1rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.income {
  color: #4caf50;
}

.expense {
  color: #f44336;
}

.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.chart-container h3 {
  margin-top: 0;
  color: #333;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 4px;
  border: 1px dashed #ccc;
}

.chart-placeholder p {
  color: #999;
  font-style: italic;
}

.data-management {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.data-management h3 {
  margin-top: 0;
  color: #333;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.export-btn,
.import-label,
.clear-btn {
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.export-btn {
  background-color: #28a745;
  color: white;
  border: none;
}

.export-btn:hover {
  background-color: #218838;
}

.import-label {
  background-color: #17a2b8;
  color: white;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.import-label:hover {
  background-color: #138496;
}

.import-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.clear-btn {
  background-color: #f44336;
  color: white;
  border: none;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr 1fr;
  }
  
  .charts {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>