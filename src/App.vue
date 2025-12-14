<template>
  <div class="app-container" :class="{ 'mobile-view': isMobile }">
    <!-- Desktop sidebar -->
    <aside v-if="!isMobile" class="sidebar glass-effect">
      <div class="app-header">
        <h1 class="app-title">{{ appName }}</h1>
      </div>
      <nav class="navigation">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          <i class="nav-icon" :class="tab.icon"></i>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <!-- Dashboard View -->
      <div v-show="activeTab === 'dashboard'" class="view-container">
        <Dashboard 
          :transactions="transactions"
          :investments="investments"
        />
      </div>

      <!-- Transactions View -->
      <div v-show="activeTab === 'transactions' && !showTransactionPage" class="view-container">
        <TransactionsView
          :transactions="transactions"
          :investments="investments"
          @delete-transaction="deleteTransaction"
          @edit-transaction="editTransaction"
          @add-transaction="showAddTransactionPage"
        />
      </div>
      
      <!-- Add/Edit Transaction Page -->
      <div v-show="activeTab === 'transactions' && showTransactionPage" class="view-container full-screen">
        <TransactionPage
          :transaction="currentTransaction"
          :is-editing="isEditing"
          @save="saveTransaction"
          @cancel="cancelTransaction"
        />
      </div>

      <!-- Investments View -->
      <div v-show="activeTab === 'investments' && !showInvestmentPage" class="view-container">
        <InvestmentManagement
          :investments="investments"
          :balance="balance"
          :transactions="transactions"
          @add-investment="showAddInvestmentPage"
          @update-investment="updateInvestment"
          @delete-investment="deleteInvestment"
          @edit-investment="editInvestment"
          @cancel-edit="cancelInvestmentEdit"
        />
      </div>
      
      <!-- Add/Edit Investment Page -->
      <div v-show="activeTab === 'investments' && showInvestmentPage" class="view-container full-screen">
        <InvestmentPage
          :investment="currentInvestment"
          :is-editing="isEditingInvestment"
          @save="saveInvestment"
          @cancel="cancelInvestment"
        />
      </div>
      
      <!-- Type Management View -->
      <div v-show="activeTab === 'type-management'" class="view-container">
        <TypeManagement 
          @export-data="exportData"
          @import-data="importData"
          @clear-data="clearAllData"
        />
      </div>
    </main>

    <!-- Mobile bottom bar -->
    <footer v-if="isMobile" class="bottom-bar glass-effect">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="nav-item"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        <i class="nav-icon" :class="tab.icon"></i>
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </footer>
  </div>
</template>

<script>
import Dashboard from './components/dashboard/Dashboard.vue';
import TransactionsView from './components/transactions/TransactionsView.vue';
import TransactionPage from './components/transactions/TransactionPage.vue';
import InvestmentManagement from './components/investments/InvestmentManagement.vue';
import InvestmentPage from './components/investments/InvestmentPage.vue';
import TypeManagement from './components/TypeManagement.vue';
import TypeManager from './utils/TypeManager.js';

export default {
  name: 'FinanceApp',
  components: {
    Dashboard,
    TransactionsView,
    TransactionPage,
    InvestmentManagement,
    InvestmentPage,
    TypeManagement
  },
  data() {
    return {
      appName: '个人财务管理',
      isMobile: window.innerWidth <= 768,
      activeTab: 'dashboard',
      showTransactionPage: false,
      showInvestmentPage: false,
      currentTransaction: null,
      currentInvestment: null,
      isEditing: false,
      isEditingInvestment: false,
      transactions: [],
      investments: [],
      tabs: [
        { id: 'dashboard', label: '看板', icon: 'icon-dashboard' },
        { id: 'transactions', label: '收支', icon: 'icon-transactions' },
        { id: 'investments', label: '投资', icon: 'icon-investments' },
        { id: 'type-management', label: '管理', icon: 'icon-management' }
      ]
    };
  },
  computed: {
    balance() {
      const totalIncome = this.transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const totalExpense = this.transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return totalIncome - totalExpense;
    }
  },
  methods: {
    switchTab(tabId) {
      this.activeTab = tabId;
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    },
    // Navigation methods
    showAddTransactionPage() {
      this.currentTransaction = {
        id: Date.now(),
        type: 'income',
        description: '',
        notes: '',
        amount: 0,
        date: new Date().toISOString().substr(0, 10)
      };
      this.isEditing = false;
      this.showTransactionPage = true;
    },
    editTransaction(transaction) {
      this.currentTransaction = { ...transaction };
      this.isEditing = true;
      this.showTransactionPage = true;
    },
    saveTransaction(transaction) {
      if (!transaction.description || transaction.amount <= 0) {
        alert('请输入有效的明细和金额');
        return;
      }

      if (this.isEditing) {
        const index = this.transactions.findIndex(t => t.id === transaction.id);
        if (index !== -1) {
          this.transactions.splice(index, 1, transaction);
        }
      } else {
        this.transactions.push(transaction);
      }
      
      this.saveToLocalStorage();
      this.cancelTransaction();
      alert(this.isEditing ? '交易更新成功' : '交易添加成功');
    },
    cancelTransaction() {
      this.showTransactionPage = false;
      this.currentTransaction = null;
      this.isEditing = false;
    },
    deleteTransaction(id) {
      if (confirm('此操作将永久删除该交易记录，是否继续？')) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveToLocalStorage();
        alert('删除成功');
      }
    },
    // Investment methods
    showAddInvestmentPage() {
      this.currentInvestment = {
        id: Date.now(),
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: null,
        purchaseDate: new Date().toISOString().substr(0, 10)
      };
      this.isEditingInvestment = false;
      this.showInvestmentPage = true;
    },
    editInvestment(investment) {
      this.currentInvestment = { ...investment };
      this.isEditingInvestment = true;
      this.showInvestmentPage = true;
    },
    saveInvestment(investment) {
      if (!investment.name || investment.quantity <= 0 || investment.purchasePrice <= 0) {
        alert('请输入有效的投资名称、数量和买入价');
        return;
      }

      if (this.isEditingInvestment) {
        const index = this.investments.findIndex(i => i.id === investment.id);
        if (index !== -1) {
          this.investments.splice(index, 1, investment);
        }
      } else {
        this.investments.push({
          ...investment,
          id: Date.now()
        });
      }
      
      this.saveToLocalStorage();
      this.cancelInvestment();
      alert(this.isEditingInvestment ? '投资更新成功' : '投资添加成功');
    },
    cancelInvestment() {
      this.showInvestmentPage = false;
      this.currentInvestment = null;
      this.isEditingInvestment = false;
    },
    addInvestment(investment) {
      if (!investment.name || investment.quantity <= 0 || investment.purchasePrice <= 0) {
        alert('请输入有效的投资名称、数量和买入价');
        return;
      }

      this.investments.push({
        ...investment,
        id: Date.now()
      });
      
      this.saveToLocalStorage();
      alert('投资添加成功');
    },
    updateInvestment(investment) {
      if (!investment.name || investment.quantity <= 0 || investment.purchasePrice <= 0) {
        alert('请输入有效的投资名称、数量和买入价');
        return;
      }

      const index = this.investments.findIndex(i => i.id === investment.id);
      if (index !== -1) {
        this.investments.splice(index, 1, investment);
        this.saveToLocalStorage();
        alert('投资更新成功');
      }
    },
    deleteInvestment(id) {
      if (confirm('此操作将永久删除该投资记录，是否继续？')) {
        this.investments = this.investments.filter(investment => investment.id !== id);
        this.saveToLocalStorage();
        alert('删除成功');
      }
    },
    cancelInvestmentEdit() {
      this.$emit('cancel-edit');
    },
    // Data management methods
    saveToLocalStorage() {
      try {
        localStorage.setItem('financeTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('financeInvestments', JSON.stringify(this.investments));
      } catch (error) {
        console.error('保存数据到localStorage失败:', error);
        alert('保存数据失败');
      }
    },
    loadFromLocalStorage() {
      try {
        const transactions = localStorage.getItem('financeTransactions');
        const investments = localStorage.getItem('financeInvestments');
        
        if (transactions) {
          this.transactions = JSON.parse(transactions);
        }
        
        if (investments) {
          this.investments = JSON.parse(investments);
        }
      } catch (error) {
        console.error('从localStorage加载数据失败:', error);
        alert('加载数据失败');
      }
    },
    importData(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validate data format
          if (!this.validateImportData(data)) {
            alert('导入的数据格式不正确');
            return;
          }
          
          this.transactions = data.transactions || [];
          this.investments = data.investments || [];
          
          // Import type data if exists
          if (data.investmentTypes) {
            TypeManager.setInvestmentTypes(data.investmentTypes);
          }
          
          if (data.transactionTypes) {
            TypeManager.setTransactionTypes(data.transactionTypes);
          }
          
          this.saveToLocalStorage();
          alert('数据导入成功');
        } catch (error) {
          console.error('数据导入失败:', error);
          alert('数据导入失败，请检查文件格式');
        }
      };
      reader.readAsText(file);
    },
    validateImportData(data) {
      if (!data || typeof data !== 'object') return false;
      
      // Check required properties
      if (data.transactions && !Array.isArray(data.transactions)) return false;
      if (data.investments && !Array.isArray(data.investments)) return false;
      
      // Validate transaction format
      if (data.transactions) {
        for (const transaction of data.transactions) {
          if (!transaction.id || !transaction.type || !transaction.description || 
              typeof transaction.amount !== 'number' || !transaction.date) {
            return false;
          }
        }
      }
      
      // Validate investment format
      if (data.investments) {
        for (const investment of data.investments) {
          if (!investment.id || !investment.type || !investment.name || 
              typeof investment.quantity !== 'number' || 
              typeof investment.purchasePrice !== 'number') {
            return false;
          }
        }
      }
      
      return true;
    },
    exportData() {
      try {
        const data = {
          transactions: this.transactions,
          investments: this.investments,
          investmentTypes: TypeManager.getInvestmentTypes(),
          transactionTypes: TypeManager.getTransactionTypes()
        };
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'financial_data.json';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error('导出数据失败:', error);
        alert('导出数据失败');
      }
    },
    clearAllData() {
      if (confirm('此操作将永久删除所有数据，是否继续？')) {
        this.transactions = [];
        this.investments = [];
        // Reset to default types
        TypeManager.setInvestmentTypes(TypeManager.defaultInvestmentTypes);
        TypeManager.setTransactionTypes(TypeManager.defaultTransactionTypes);
        this.saveToLocalStorage();
        alert('数据已清空');
      }
    }
  },
  mounted() {
    // Initialize type manager
    TypeManager.initialize();
    this.loadFromLocalStorage();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Glass effect styles */
.glass-effect {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.sidebar {
  width: 280px;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.app-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
}

.app-title {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.navigation {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin: 5px 15px;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.4);
  color: white;
  font-weight: 600;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-icon::before {
  content: "";
  display: block;
  width: 20px;
  height: 20px;
  background-color: currentColor;
  mask-size: cover;
  -webkit-mask-size: cover;
}

.icon-dashboard::before {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M3 3v18h18'%3E%3C/path%3E%3Cpath d='M18 17V9'%3E%3C/path%3E%3Cpath d='M13 17V5'%3E%3C/path%3E%3Cpath d='M8 17v-3'%3E%3C/path%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M3 3v18h18'%3E%3C/path%3E%3Cpath d='M18 17V9'%3E%3C/path%3E%3Cpath d='M13 17V5'%3E%3C/path%3E%3Cpath d='M8 17v-3'%3E%3C/path%3E%3C/svg%3E");
}

.icon-transactions::before {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cpath d='M12 18h.01'%3E%3C/path%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cpath d='M12 18h.01'%3E%3C/path%3E%3C/svg%3E");
}

.icon-investments::before {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpath d='M12 16v-4'%3E%3C/path%3E%3Cpath d='M12 8h.01'%3E%3C/path%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpath d='M12 16v-4'%3E%3C/path%3E%3Cpath d='M12 8h.01'%3E%3C/path%3E%3C/svg%3E");
}

.icon-management::before {
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M12 20h9'%3E%3C/path%3E%3Cpath d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'%3E%3C/path%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M12 20h9'%3E%3C/path%3E%3Cpath d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'%3E%3C/path%3E%3C/svg%3E");
}

.main-content {
  flex: 1;
  overflow-y: auto;
  height: 100%;
}

/* Desktop view */
.app-container:not(.mobile-view) .main-content {
  padding: 20px;
}

.app-container:not(.mobile-view) .view-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  height: calc(100% - 40px);
  overflow: hidden;
}

.app-container:not(.mobile-view) .view-container.full-screen {
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  height: 100%;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: white;
}

/* Mobile view */
.app-container.mobile-view {
  flex-direction: column;
  padding: 0;
}

.app-container.mobile-view .sidebar {
  display: none;
}

.app-container.mobile-view .main-content {
  padding: 0;
  height: calc(100% - 70px); /* 减去底部导航栏的高度 */
}

.app-container.mobile-view .view-container {
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  height: 100%;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: white;
  overflow-y: auto;
}

.bottom-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 0;
  height: 70px;
  z-index: 100;
}

.bottom-bar .nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  margin: 0 5px;
  border-radius: 12px;
  background: transparent;
}

.bottom-bar .nav-label {
  font-size: 12px;
  margin-top: 4px;
}

/* Responsive adjustments */
@media (min-width: 769px) {
  .bottom-bar {
    display: none;
  }
}
</style>