<template>
  <div class="finance-app">
    <header>
      <h1>{{ appName }}</h1>
    </header>
    
    <main>
      <!-- 导航标签 -->
      <nav class="tab-navigation">
        <button 
          :class="{ active: activeTab === 'dashboard' }" 
          @click="switchTab('dashboard')"
        >
          数据看板
        </button>
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
      </nav>

      <!-- 数据看板标签页 -->
      <div v-show="activeTab === 'dashboard'">
        <Dashboard 
          :transactions="transactions"
          :investments="investments"
          @export-data="exportData"
          @import-data="importData"
          @clear-data="clearAllData"
        />
      </div>

      <!-- 财务记录标签页 -->
      <div v-show="activeTab === 'transactions'">
        <!-- 财务概览 -->
        <SummarySection 
          :total-income="totalIncome" 
          :total-expense="totalExpense" 
          :balance="balance"
        />
        
        <!-- 添加/编辑交易 -->
        <TransactionForm 
          :new-transaction="newTransaction" 
          :is-editing="isEditing"
          @add-transaction="addTransaction"
          @update-transaction="updateTransaction"
          @cancel-edit="cancelEdit"
        />
        
        <!-- 交易列表 -->
        <TransactionList 
          :transactions="sortedTransactions" 
          @delete-transaction="deleteTransaction"
          @edit-transaction="editTransaction"
        />
      </div>

      <!-- 投资管理标签页 -->
      <div v-show="activeTab === 'investments'">
        <InvestmentManagement
          :investments="investments"
          :balance="balance"
          :transactions="transactions"
          @add-investment="addInvestment"
          @update-investment="updateInvestment"
          @delete-investment="deleteInvestment"
          @edit-investment="editInvestment"
          @cancel-edit="cancelInvestmentEdit"
        />
      </div>
    </main>
  </div>
</template>

<script>
import SummarySection from './components/SummarySection.vue';
import TransactionForm from './components/TransactionForm.vue';
import TransactionList from './components/TransactionList.vue';
import InvestmentManagement from './components/InvestmentManagement.vue';
import Dashboard from './components/Dashboard.vue';

export default {
  name: 'FinanceApp',
  components: {
    SummarySection,
    TransactionForm,
    TransactionList,
    InvestmentManagement,
    Dashboard
  },
  data() {
    return {
      appName: '个人财务管理系统',
      activeTab: 'dashboard',
      isEditing: false,
      editingTransactionId: null,
      isEditingInvestment: false,
      editingInvestmentId: null,
      newTransaction: {
        type: 'income',
        description: '',
        notes: '',
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
    // 按时间倒序排列的交易记录（最新的在前面）
    sortedTransactions() {
      return [...this.transactions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
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
      // 切换标签页时取消编辑状态
      this.isEditing = false;
      this.isEditingInvestment = false;
    },
    updateTransaction(field, value) {
      this.newTransaction[field] = value;
    },
    addTransaction() {
      if (!this.newTransaction.description || this.newTransaction.amount <= 0) {
        alert('请选择有效的明细和金额');
        return;
      }

      if (this.isEditing) {
        // 更新现有交易
        const index = this.transactions.findIndex(t => t.id === this.editingTransactionId);
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactions[index],
            ...this.newTransaction
          };
        }
        this.cancelEdit();
      } else {
        // 添加新交易
        const transaction = {
          id: Date.now(), // 简单ID生成方式
          type: this.newTransaction.type,
          description: this.newTransaction.description,
          notes: this.newTransaction.notes,
          amount: parseFloat(this.newTransaction.amount),
          date: this.newTransaction.date
        };

        this.transactions.push(transaction);
        
        // 重置表单
        this.newTransaction.description = '';
        this.newTransaction.notes = '';
        this.newTransaction.amount = 0;
        this.newTransaction.date = new Date().toISOString().substr(0, 10);
      }
    },
    
    deleteTransaction(id) {
      this.transactions = this.transactions.filter(transaction => transaction.id !== id);
    },
    
    editTransaction(transaction) {
      this.isEditing = true;
      this.editingTransactionId = transaction.id;
      this.newTransaction = { ...transaction };
      // 切换到财务记录标签页以显示编辑表单
      this.activeTab = 'transactions';
    },
    
    cancelEdit() {
      this.isEditing = false;
      this.editingTransactionId = null;
      // 重置表单
      this.newTransaction = {
        type: 'income',
        description: '',
        notes: '',
        amount: 0,
        date: new Date().toISOString().substr(0, 10)
      };
    },
    
    updateInvestment(field, value) {
      this.newInvestment[field] = value;
    },
    addInvestment() {
      if (!this.newInvestment.name.trim() || this.newInvestment.quantity <= 0 || this.newInvestment.purchasePrice <= 0) {
        alert('请填写有效的投资信息');
        return;
      }

      if (this.isEditingInvestment) {
        // 更新现有投资
        const index = this.investments.findIndex(i => i.id === this.editingInvestmentId);
        if (index !== -1) {
          this.investments[index] = {
            ...this.investments[index],
            ...this.newInvestment
          };
        }
        this.cancelInvestmentEdit();
      } else {
        // 添加新投资
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
      }
    },
    
    deleteInvestment(id) {
      this.investments = this.investments.filter(investment => investment.id !== id);
    },
    
    editInvestment(investment) {
      this.isEditingInvestment = true;
      this.editingInvestmentId = investment.id;
      this.newInvestment = { ...investment };
    },
    
    cancelInvestmentEdit() {
      this.isEditingInvestment = false;
      this.editingInvestmentId = null;
      // 重置表单
      this.newInvestment = {
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: 0,
        purchaseDate: new Date().toISOString().substr(0, 10)
      };
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
    
    exportData() {
      const data = {
        transactions: this.transactions,
        investments: this.investments
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.transactions && data.investments) {
            this.transactions = data.transactions;
            this.investments = data.investments;
            alert('数据导入成功！');
          } else {
            alert('数据格式不正确！');
          }
        } catch (error) {
          alert('导入失败：' + error.message);
        }
      };
      reader.readAsText(file);
      
      // 重置文件输入框
      event.target.value = '';
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
.data-actions {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
}

.data-actions h3 {
  margin-top: 0;
  margin-bottom: 15px;
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
  .finance-app {
    padding: 10px;
  }
  
  .tab-navigation {
    justify-content: center;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>