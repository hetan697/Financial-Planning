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
      <div class="chart-container">
        <h3>收支趋势</h3>
        <div class="chart-placeholder">
          <p>收支趋势图（待实现）</p>
        </div>
      </div>
      
      <div class="chart-container">
        <h3>支出分类</h3>
        <div class="chart-placeholder">
          <p>支出分类饼图（待实现）</p>
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
    }
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

.chart-placeholder {
  height: 200px;
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