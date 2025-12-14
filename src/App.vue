<template>
  <div class="finance-app">
    <el-container>
      <el-header>
        <h1>{{ appName }}</h1>
      </el-header>
      
      <el-main>
        <!-- 导航菜单 -->
        <el-menu 
          :default-active="activeTab" 
          mode="horizontal" 
          @select="handleMenuSelect"
          class="main-navigation"
        >
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
        <div v-show="activeTab === 'transactions'">
          <!-- 财务概览 -->
          <SummarySection 
            :total-income="totalIncome" 
            :total-expense="totalExpense" 
            :balance="balance"
          />
          
          <!-- 交易列表 -->
          <TransactionList 
            :transactions="sortedTransactions" 
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
        </div>

        <!-- 投资管理视图 -->
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
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem } from 'element-plus';
import SummarySection from './components/SummarySection.vue';
import TransactionList from './components/TransactionList.vue';
import TransactionPage from './components/TransactionPage.vue';
import InvestmentManagement from './components/InvestmentManagement.vue';
import Dashboard from './components/Dashboard.vue';

export default {
  name: 'FinanceApp',
  components: {
    ElContainer,
    ElHeader,
    ElMain,
    ElMenu,
    ElMenuItem,
    SummarySection,
    TransactionList,
    TransactionPage,
    InvestmentManagement,
    Dashboard
  },
  data() {
    return {
      appName: '个人财务管理系统',
      activeTab: 'dashboard',
      isEditing: false,
      showTransactionPage: false, // 控制是否显示交易页面
      editingTransactionId: null,
      isEditingInvestment: false,
      editingInvestmentId: null,
      currentTransaction: {
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
    handleMenuSelect(index) {
      this.activeTab = index;
      // 切换标签页时取消编辑状态
      this.isEditing = false;
      this.isEditingInvestment = false;
      this.showTransactionPage = false;
    },
    showAddTransactionPage() {
      // 重置表单状态
      this.isEditing = false;
      this.editingTransactionId = null;
      this.currentTransaction = {
        type: 'income',
        description: '',
        notes: '',
        amount: 0,
        date: new Date().toISOString().substr(0, 10)
      };
      this.showTransactionPage = true;
    },
    saveTransaction(transaction) {
      if (!transaction.description || transaction.amount <= 0) {
        this.$message({
          message: '请选择有效的明细和金额',
          type: 'warning'
        });
        return;
      }

      if (this.isEditing) {
        // 更新现有交易
        const index = this.transactions.findIndex(t => t.id === this.editingTransactionId);
        if (index !== -1) {
          this.transactions[index] = {
            ...this.transactions[index],
            ...transaction,
            id: this.editingTransactionId // 确保ID不变
          };
        }
        this.cancelTransaction();
      } else {
        // 添加新交易
        const newTransaction = {
          id: Date.now(), // 简单ID生成方式
          ...transaction
        };

        this.transactions.push(newTransaction);
        
        this.$message({
          message: '交易添加成功',
          type: 'success'
        });
        
        // 返回列表页面
        this.showTransactionPage = false;
      }
    },
    
    deleteTransaction(id) {
      this.$confirm('确定要删除这条交易记录吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.$message({
          type: 'success',
          message: '删除成功'
        });
      }).catch(() => {
        // 用户取消删除
      });
    },
    
    editTransaction(transaction) {
      this.isEditing = true;
      this.editingTransactionId = transaction.id;
      this.currentTransaction = { ...transaction };
      this.showTransactionPage = true;
    },
    
    cancelTransaction() {
      this.isEditing = false;
      this.editingTransactionId = null;
      this.showTransactionPage = false;
    },
    
    updateInvestment(field, value) {
      this.newInvestment[field] = value;
    },
    addInvestment() {
      if (!this.newInvestment.name.trim() || this.newInvestment.quantity <= 0 || this.newInvestment.purchasePrice <= 0) {
        this.$message({
          message: '请填写有效的投资信息',
          type: 'warning'
        });
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
        
        this.$message({
          message: '投资添加成功',
          type: 'success'
        });
      }
    },
    
    deleteInvestment(id) {
      this.$confirm('确定要删除这项投资记录吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.investments = this.investments.filter(investment => investment.id !== id);
        this.$message({
          type: 'success',
          message: '删除成功'
        });
      }).catch(() => {
        // 用户取消删除
      });
    },
    
    editInvestment(investment) {
      this.isEditingInvestment = true;
      this.editingInvestmentId = investment.id;
      this.newInvestment = { ...investment };
      // 切换到投资管理视图以显示编辑表单
      this.activeTab = 'investments';
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
      
      this.$message({
        message: '数据导出成功',
        type: 'success'
      });
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
            this.$message({
              message: '数据导入成功！',
              type: 'success'
            });
          } else {
            this.$message({
              message: '数据格式不正确！',
              type: 'error'
            });
          }
        } catch (error) {
          this.$message({
            message: '导入失败：' + error.message,
            type: 'error'
          });
        }
      };
      reader.readAsText(file);
      
      // 重置文件输入框
      event.target.value = '';
    },
    
    clearAllData() {
      this.$confirm(
        '确定要清除所有数据吗？此操作不可撤销！', 
        '确认清除', 
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.transactions = [];
        this.investments = [];
        localStorage.removeItem('financeTransactions');
        localStorage.removeItem('financeInvestments');
        
        this.$message({
          type: 'success',
          message: '数据已清除'
        });
      }).catch(() => {
        // 用户取消操作
      });
    }
  }
};
</script>

<style scoped>
.finance-app {
  margin: 0 auto;
}

.el-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px 0 !important;
}

.el-header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.main-navigation {
  margin-bottom: 20px;
}

:deep(.el-main) {
  padding: 0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .finance-app {
  }
  
  .el-header {
    margin-bottom: 10px;
    padding: 10px 0 !important;
  }
  
  .el-header h1 {
    font-size: 1.3rem;
  }
  
  .main-navigation {
    margin-bottom: 10px;
  }
}
</style>