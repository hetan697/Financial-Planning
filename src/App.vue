<template>
  <div class="finance-app">
    <header>
      <h1>{{ appName }}</h1>
    </header>
    
    <main>
      <!-- 导航标签 -->
      <nav class="tab-navigation">
        <button 
          :class="{ active: activeTab === 'transactions' }" 
          @click="switchTab('transactions')"
        >
          财务记录
        </button>
        <button 
          :class="{ active: activeTab === 'investments' }" 
          @click="switchTab('investments')"
        >
          投资管理
        </button>
        <button 
          :class="{ active: activeTab === 'advice' }" 
          @click="switchTab('advice')"
        >
          投资建议
        </button>
      </nav>

      <!-- 财务记录标签页 -->
      <div v-show="activeTab === 'transactions'">
        <!-- 财务概览 -->
        <SummarySection 
          :total-income="totalIncome" 
          :total-expense="totalExpense" 
          :balance="balance"
        />
        
        <!-- 添加交易 -->
        <TransactionForm 
          :new-transaction="newTransaction" 
          @add-transaction="addTransaction"
          @update-transaction="updateTransaction"
        />
        
        <!-- 交易列表 -->
        <TransactionList 
          :transactions="transactions" 
          @delete-transaction="deleteTransaction"
        />
      </div>

      <!-- 投资管理标签页 -->
      <div v-show="activeTab === 'investments'">
        <!-- 投资概览 -->
        <InvestmentSummary 
          :total-cost="totalInvestmentCost" 
          :total-value="totalInvestmentValue" 
          :total-profit="totalInvestmentProfit"
        />
        
        <!-- 添加投资 -->
        <InvestmentForm 
          :new-investment="newInvestment" 
          @add-investment="addInvestment"
          @update-investment="updateInvestment"
        />
        
        <!-- 投资列表 -->
        <InvestmentList 
          :investments="investments" 
          @delete-investment="deleteInvestment"
        />
      </div>
      
      <!-- 投资建议标签页 -->
      <div v-show="activeTab === 'advice'">
        <SummarySection 
          :total-income="totalIncome" 
          :total-expense="totalExpense" 
          :balance="balance"
          advice-mode
        />
        
        <InvestmentAdvice :balance="balance" />
      </div>
    </main>
    
    <!-- 数据管理 -->
    <footer class="data-management">
      <button @click="clearAllData" class="clear-btn">清除所有数据</button>
    </footer>
  </div>
</template>

<script>
import SummarySection from './components/SummarySection.vue';
import TransactionForm from './components/TransactionForm.vue';
import TransactionList from './components/TransactionList.vue';
import InvestmentSummary from './components/InvestmentSummary.vue';
import InvestmentForm from './components/InvestmentForm.vue';
import InvestmentList from './components/InvestmentList.vue';
import InvestmentAdvice from './components/InvestmentAdvice.vue';

export default {
  name: 'FinanceApp',
  components: {
    SummarySection,
    TransactionForm,
    TransactionList,
    InvestmentSummary,
    InvestmentForm,
    InvestmentList,
    InvestmentAdvice
  },
  data() {
    return {
      appName: '个人财务管理系统',
      activeTab: 'transactions',
      newTransaction: {
        type: 'income',
        description: '',
        amount: 0,
        date: new Date().toISOString().substr(0, 10)
      },
      newInvestment: {
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: 0,
        purchaseDate: new Date().toISOString().substr(0, 10)
      },
      transactions: [],
      investments: []
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
    totalInvestmentCost() {
      return this.investments.reduce((sum, investment) => {
        return sum + (investment.purchasePrice * investment.quantity);
      }, 0);
    },
    totalInvestmentProfit() {
      return this.totalInvestmentValue - this.totalInvestmentCost;
    }
  },
  mounted() {
    // 页面加载时从localStorage恢复数据
    this.loadFromLocalStorage();
  },
  watch: {
    // 监听数据变化，自动保存到localStorage
    transactions: {
      handler: function() {
        this.saveToLocalStorage();
      },
      deep: true
    },
    investments: {
      handler: function() {
        this.saveToLocalStorage();
      },
      deep: true
    }
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab;
    },
    updateTransaction(field, value) {
      this.newTransaction[field] = value;
    },
    addTransaction() {
      if (!this.newTransaction.description.trim() || this.newTransaction.amount <= 0) {
        alert('请填写有效的描述和金额');
        return;
      }

      const transaction = {
        id: Date.now(), // 简单ID生成方式
        type: this.newTransaction.type,
        description: this.newTransaction.description,
        amount: parseFloat(this.newTransaction.amount),
        date: this.newTransaction.date
      };

      this.transactions.push(transaction);
      
      // 重置表单
      this.newTransaction.description = '';
      this.newTransaction.amount = 0;
      this.newTransaction.date = new Date().toISOString().substr(0, 10);
    },
    
    deleteTransaction(id) {
      this.transactions = this.transactions.filter(transaction => transaction.id !== id);
    },
    
    updateInvestment(field, value) {
      this.newInvestment[field] = value;
    },
    addInvestment() {
      if (!this.newInvestment.name.trim() || this.newInvestment.quantity <= 0 || this.newInvestment.purchasePrice <= 0) {
        alert('请填写有效的投资信息');
        return;
      }

      const investment = {
        id: Date.now(),
        type: this.newInvestment.type,
        name: this.newInvestment.name,
        quantity: parseFloat(this.newInvestment.quantity),
        purchasePrice: parseFloat(this.newInvestment.purchasePrice),
        currentPrice: this.newInvestment.currentPrice ? parseFloat(this.newInvestment.currentPrice) : null,
        purchaseDate: this.newInvestment.purchaseDate
      };

      this.investments.push(investment);
      
      // 重置表单
      this.newInvestment.name = '';
      this.newInvestment.quantity = 0;
      this.newInvestment.purchasePrice = 0;
      this.newInvestment.currentPrice = 0;
      this.newInvestment.purchaseDate = new Date().toISOString().substr(0, 10);
    },
    
    deleteInvestment(id) {
      this.investments = this.investments.filter(investment => investment.id !== id);
    },
    
    saveToLocalStorage() {
      localStorage.setItem('financeTransactions', JSON.stringify(this.transactions));
      localStorage.setItem('financeInvestments', JSON.stringify(this.investments));
    },
    
    loadFromLocalStorage() {
      const savedTransactions = localStorage.getItem('financeTransactions');
      const savedInvestments = localStorage.getItem('financeInvestments');
      
      if (savedTransactions) {
        this.transactions = JSON.parse(savedTransactions);
      }
      
      if (savedInvestments) {
        this.investments = JSON.parse(savedInvestments);
      }
    },
    
    clearAllData() {
      if (confirm('确定要清除所有数据吗？此操作不可撤销！')) {
        this.transactions = [];
        this.investments = [];
        localStorage.removeItem('financeTransactions');
        localStorage.removeItem('financeInvestments');
      }
    }
  }
};
</script>

<style scoped>
.finance-app {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 头部 */
header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

header h1 {
  font-size: 2rem;
  font-weight: bold;
}

/* 标签导航 */
.tab-navigation {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tab-navigation button {
  padding: 12px 24px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.tab-navigation button:hover {
  background-color: #d5d5d5;
}

.tab-navigation button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 数据管理 */
.data-management {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.clear-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .finance-app {
    padding: 10px;
  }
  
  .tab-navigation {
    justify-content: center;
  }
}
</style>