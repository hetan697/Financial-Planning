<template>
  <div class="finance-app">
    <el-container>
      <el-main>
        <!-- 导航菜单 -->
        <el-menu 
          :default-active="activeTab" 
          mode="horizontal" 
          @select="handleMenuSelect"
          class="main-navigation"
        >
          <el-menu-item index="0" disabled class="app-title">{{ appName }}</el-menu-item>
          <el-menu-item index="dashboard">数据看板</el-menu-item>
          <el-menu-item index="transactions">财务记录</el-menu-item>
          <el-menu-item index="investments">投资管理</el-menu-item>
        </el-menu>

        <!-- 数据看板视图 -->
        <div v-show="activeTab === 'dashboard'">
          <Dashboard 
            :transactions="transactions"
            :investments="investments"
            @export-data="exportData"
            @import-data="importData"
            @clear-data="clearAllData"
          />
        </div>

        <!-- 财务记录视图 -->
        <div v-show="activeTab === 'transactions' && !showTransactionPage">
          <TransactionsView
            :transactions="transactions"
            :investments="investments"
            @delete-transaction="deleteTransaction"
            @edit-transaction="editTransaction"
            @add-transaction="showAddTransactionPage"
          />
        </div>
        
        <!-- 添加/编辑交易页面 -->
        <div v-show="activeTab === 'transactions' && showTransactionPage">
          <TransactionPage
            :transaction="currentTransaction"
            :is-editing="isEditing"
            @save="saveTransaction"
            @cancel="cancelTransaction"
          />
        </div>

        <!-- 投资管理视图 -->
        <div v-show="activeTab === 'investments' && !showInvestmentPage">
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
        
        <!-- 添加/编辑投资页面 -->
        <div v-show="activeTab === 'investments' && showInvestmentPage">
          <InvestmentPage
            :investment="currentInvestment"
            :is-editing="isEditingInvestment"
            @save="saveInvestment"
            @cancel="cancelInvestment"
          />
        </div>
      </el-main>
    </el-container>
    
    <!-- 全局错误提示 -->
    <el-dialog v-model="errorDialogVisible" title="错误" width="30%">
      <span>{{ errorMessage }}</span>
      <template #footer>
        <el-button @click="errorDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem, ElDialog, ElButton } from 'element-plus';
import SummarySection from './components/SummarySection.vue';
import TransactionList from './components/TransactionList.vue';
import TransactionPage from './components/TransactionPage.vue';
import InvestmentManagement from './components/InvestmentManagement.vue';
import Dashboard from './components/Dashboard.vue';
import InvestmentPage from './components/InvestmentPage.vue';
import TransactionsView from './components/TransactionsView.vue';

export default {
  name: 'FinanceApp',
  components: {
    ElContainer,
    ElHeader,
    ElMain,
    ElMenu,
    ElMenuItem,
    ElDialog,
    ElButton,
    SummarySection,
    TransactionList,
    TransactionPage,
    InvestmentManagement,
    Dashboard,
    InvestmentPage,
    TransactionsView
  },
  data() {
    return {
      appName: '个人财务管理系统',
      activeTab: 'dashboard',
      transactions: [],
      investments: [],
      showTransactionPage: false,
      showInvestmentPage: false,
      currentTransaction: null,
      currentInvestment: null,
      isEditing: false,
      isEditingInvestment: false,
      errorDialogVisible: false,
      errorMessage: ''
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
    },
    totalInvestmentValue() {
      return this.investments.reduce((sum, investment) => {
        const currentValue = investment.currentPrice !== null ? 
          investment.currentPrice : investment.purchasePrice;
        return sum + (investment.quantity * currentValue);
      }, 0);
    }
  },
  methods: {
    handleMenuSelect(index) {
      this.activeTab = index;
    },
    // 显示错误信息
    showError(message) {
      this.errorMessage = message;
      this.errorDialogVisible = true;
    },
    // 数据导入
    importData(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // 验证数据格式
          if (!this.validateImportData(data)) {
            this.showError('导入的数据格式不正确');
            return;
          }
          
          this.transactions = data.transactions || [];
          this.investments = data.investments || [];
          this.saveToLocalStorage();
          this.$message.success('数据导入成功');
        } catch (error) {
          console.error('数据导入失败:', error);
          this.showError('数据导入失败，请检查文件格式');
        }
      };
      reader.readAsText(file);
    },
    // 验证导入数据格式
    validateImportData(data) {
      if (!data || typeof data !== 'object') return false;
      
      // 检查必需的属性
      if (data.transactions && !Array.isArray(data.transactions)) return false;
      if (data.investments && !Array.isArray(data.investments)) return false;
      
      // 验证交易记录格式
      if (data.transactions) {
        for (const transaction of data.transactions) {
          if (!transaction.id || !transaction.type || !transaction.description || 
              typeof transaction.amount !== 'number' || !transaction.date) {
            return false;
          }
        }
      }
      
      // 验证投资记录格式
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
          investments: this.investments
        };
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'financial_data.json';
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error('导出数据失败:', error);
        this.showError('导出数据失败');
      }
    },
    clearAllData() {
      this.$confirm('此操作将永久删除所有数据，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.transactions = [];
        this.investments = [];
        this.saveToLocalStorage();
        this.$message.success('数据已清空');
      }).catch(() => {
        // 用户取消操作
      });
    },
    saveToLocalStorage() {
      try {
        localStorage.setItem('financeTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('financeInvestments', JSON.stringify(this.investments));
      } catch (error) {
        console.error('保存数据到localStorage失败:', error);
        this.showError('保存数据失败');
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
        this.showError('加载数据失败');
      }
    },
    // 交易相关方法
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
        this.showError('请输入有效的明细和金额');
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
      this.$message.success(this.isEditing ? '交易更新成功' : '交易添加成功');
    },
    cancelTransaction() {
      this.showTransactionPage = false;
      this.currentTransaction = null;
      this.isEditing = false;
    },
    deleteTransaction(id) {
      this.$confirm('此操作将永久删除该交易记录，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveToLocalStorage();
        this.$message.success('删除成功');
      }).catch(() => {
        // 用户取消操作
      });
    },
    // 投资相关方法
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
        this.showError('请输入有效的投资名称、数量和买入价');
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
      this.$message.success(this.isEditingInvestment ? '投资更新成功' : '投资添加成功');
    },
    cancelInvestment() {
      this.showInvestmentPage = false;
      this.currentInvestment = null;
      this.isEditingInvestment = false;
    },
    addInvestment(investment) {
      if (!investment.name || investment.quantity <= 0 || investment.purchasePrice <= 0) {
        this.showError('请输入有效的投资名称、数量和买入价');
        return;
      }

      this.investments.push({
        ...investment,
        id: Date.now()
      });
      
      this.saveToLocalStorage();
      this.$message.success('投资添加成功');
    },
    updateInvestment(investment) {
      if (!investment.name || investment.quantity <= 0 || investment.purchasePrice <= 0) {
        this.showError('请输入有效的投资名称、数量和买入价');
        return;
      }

      const index = this.investments.findIndex(i => i.id === investment.id);
      if (index !== -1) {
        this.investments.splice(index, 1, investment);
        this.saveToLocalStorage();
        this.$message.success('投资更新成功');
      }
    },
    deleteInvestment(id) {
      this.$confirm('此操作将永久删除该投资记录，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.investments = this.investments.filter(investment => investment.id !== id);
        this.saveToLocalStorage();
        this.$message.success('删除成功');
      }).catch(() => {
        // 用户取消操作
      });
    },
    cancelInvestmentEdit() {
      this.$emit('cancel-edit');
    }
  },
  mounted() {
    this.loadFromLocalStorage();
  }
};
</script>

<style scoped>
.finance-app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.el-main {
  padding: 0;
}

.app-title {
  font-weight: bold;
  cursor: default;
  opacity: 1.0;
}

</style>