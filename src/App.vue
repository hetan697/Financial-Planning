<template>
  <div id="app">
    <!-- 桌面端侧边栏导航 -->
    <el-aside v-if="!isMobile" width="220px" class="desktop-sidebar">
      <div class="app-logo">
        <h2>{{ appName }}</h2>
      </div>
      <el-menu
        :default-active="activeTab"
        class="sidebar-menu"
        @select="handleMenuSelect"
        mode="vertical"
      >
        <el-menu-item index="dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>看板</span>
        </el-menu-item>
        <el-menu-item index="transactions">
          <el-icon><TrendCharts /></el-icon>
          <span>收支</span>
        </el-menu-item>
        <el-menu-item index="investments">
          <el-icon><Coin /></el-icon>
          <span>投资</span>
        </el-menu-item>
        <el-menu-item index="type-management">
          <el-icon><Setting /></el-icon>
          <span>管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 移动端顶部标题 -->
      <el-header v-if="isMobile" class="mobile-header">
        <h2>{{ appName }}</h2>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content-area">
        <!-- 数据看板视图 -->
        <Dashboard 
          v-if="activeTab === 'dashboard'"
          :transactions="transactions"
          :investments="investments"
        />

        <!-- 财务记录视图 -->
        <TransactionsView
          v-if="activeTab === 'transactions' && !showTransactionPage"
          :transactions="transactions"
          :investments="investments"
          @delete-transaction="deleteTransaction"
          @edit-transaction="editTransaction"
          @add-transaction="showAddTransactionPage"
        />

        <!-- 添加/编辑交易页面 -->
        <TransactionPage
          v-if="activeTab === 'transactions' && showTransactionPage"
          :transaction="currentTransaction"
          :is-editing="isEditing"
          @save="saveTransaction"
          @cancel="cancelTransaction"
        />

        <!-- 投资管理视图 -->
        <InvestmentManagement
          v-if="activeTab === 'investments' && !showInvestmentPage"
          :investments="investments"
          :balance="balance"
          :transactions="transactions"
          @add-investment="showAddInvestmentPage"
          @update-investment="updateInvestment"
          @delete-investment="deleteInvestment"
          @edit-investment="editInvestment"
        />

        <!-- 添加/编辑投资页面 -->
        <InvestmentPage
          v-if="activeTab === 'investments' && showInvestmentPage"
          :investment="currentInvestment"
          :is-editing="isEditingInvestment"
          @save="saveInvestment"
          @cancel="cancelInvestment"
        />

        <!-- 类型管理视图 -->
        <TypeManagement 
          v-if="activeTab === 'type-management'"
          @export-data="exportData"
          @import-data="importData"
          @clear-data="clearAllData"
        />
      </el-main>

      <!-- 移动端底部导航栏 -->
      <el-footer v-if="isMobile" class="mobile-navbar">
        <el-menu
          :default-active="activeTab"
          class="mobile-menu"
          mode="horizontal"
          @select="handleMenuSelect"
        >
          <el-menu-item index="dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>看板</span>
          </el-menu-item>
          <el-menu-item index="transactions">
            <el-icon><TrendCharts /></el-icon>
            <span>收支</span>
          </el-menu-item>
          <el-menu-item index="investments">
            <el-icon><Coin /></el-icon>
            <span>投资</span>
          </el-menu-item>
          <el-menu-item index="type-management">
            <el-icon><Setting /></el-icon>
            <span>管理</span>
          </el-menu-item>
        </el-menu>
      </el-footer>
    </el-container>

    <!-- 错误对话框 -->
    <el-dialog v-model="errorDialogVisible" title="错误" width="30%">
      <span>{{ errorMessage }}</span>
      <template #footer>
        <el-button @click="errorDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElContainer, ElAside, ElHeader, ElMain, ElFooter, ElMenu, ElMenuItem, ElIcon, ElDialog, ElButton } from 'element-plus'
import { DataAnalysis, TrendCharts, Coin, Setting } from '@element-plus/icons-vue'
import Dashboard from './components/dashboard/Dashboard.vue'
import TransactionsView from './components/transactions/TransactionsView.vue'
import TransactionPage from './components/transactions/TransactionPage.vue'
import InvestmentManagement from './components/investments/InvestmentManagement.vue'
import InvestmentPage from './components/investments/InvestmentPage.vue'
import TypeManagement from './components/TypeManagement.vue'
import TypeManager from './utils/TypeManager.js'

export default {
  name: 'App',
  components: {
    ElContainer,
    ElAside,
    ElHeader,
    ElMain,
    ElFooter,
    ElMenu,
    ElMenuItem,
    ElIcon,
    ElDialog,
    ElButton,
    DataAnalysis,
    TrendCharts,
    Coin,
    Setting,
    Dashboard,
    TransactionsView,
    TransactionPage,
    InvestmentManagement,
    InvestmentPage,
    TypeManagement
  },
  data() {
    return {
      appName: '财务管理',
      activeTab: 'dashboard',
      isEditing: false,
      isEditingInvestment: false,
      showTransactionPage: false,
      showInvestmentPage: false,
      currentTransaction: null,
      currentInvestment: null,
      transactions: [],
      investments: [],
      errorDialogVisible: false,
      errorMessage: '',
      isMobile: false
    }
  },
  computed: {
    balance() {
      const totalIncome = this.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0)
      
      const totalExpense = this.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0)
      
      return totalIncome - totalExpense
    }
  },
  methods: {
    handleMenuSelect(index) {
      this.activeTab = index
      // 当切换页面时，确保返回列表视图而不是表单视图
      this.showTransactionPage = false
      this.showInvestmentPage = false
    },
    
    // 显示错误信息
    showError(message) {
      this.errorMessage = message
      this.errorDialogVisible = true
    },
    
    // 数据导入
    importData(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          // 验证数据格式
          if (!this.validateImportData(data)) {
            this.showError('导入的数据格式不正确')
            return
          }
          
          this.transactions = data.transactions || []
          this.investments = data.investments || []
          
          // 如果有类型数据，则导入类型数据
          if (data.investmentTypes) {
            TypeManager.setInvestmentTypes(data.investmentTypes)
          }
          
          if (data.transactionTypes) {
            TypeManager.setTransactionTypes(data.transactionTypes)
          }
          
          this.saveToLocalStorage()
          this.$message.success('数据导入成功')
        } catch (error) {
          console.error('数据导入失败:', error)
          this.showError('数据导入失败，请检查文件格式')
        }
      }
      reader.readAsText(file)
    },
    
    // 验证导入数据格式
    validateImportData(data) {
      if (!data || typeof data !== 'object') return false
      
      // 检查必需的属性
      if (data.transactions && !Array.isArray(data.transactions)) return false
      if (data.investments && !Array.isArray(data.investments)) return false
      
      // 验证交易记录格式
      if (data.transactions) {
        for (const transaction of data.transactions) {
          if (!transaction.id || !transaction.type || !transaction.description || 
              typeof transaction.amount !== 'number' || !transaction.date) {
            return false
          }
        }
      }
      
      // 验证投资记录格式
      if (data.investments) {
        for (const investment of data.investments) {
          if (!investment.id || !investment.type || !investment.name || 
              typeof investment.quantity !== 'number' || 
              typeof investment.purchasePrice !== 'number') {
            return false
          }
        }
      }
      
      return true
    },
    
    exportData() {
      try {
        const data = {
          transactions: this.transactions,
          investments: this.investments,
          investmentTypes: TypeManager.getInvestmentTypes(),
          transactionTypes: TypeManager.getTransactionTypes()
        }
        const jsonData = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = 'financial_data.json'
        document.body.appendChild(a)
        a.click()
        
        // 清理
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)
      } catch (error) {
        console.error('导出数据失败:', error)
        this.showError('导出数据失败')
      }
    },
    
    // 数据清除
    clearAllData() {
      this.$confirm('此操作将永久删除所有数据，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.transactions = []
        this.investments = []
        this.saveToLocalStorage()
        this.$message.success('数据已清除')
      }).catch(() => {
        // 用户取消操作
      })
    },
    
    // 保存到本地存储
    saveToLocalStorage() {
      try {
        localStorage.setItem('financeTransactions', JSON.stringify(this.transactions))
        localStorage.setItem('financeInvestments', JSON.stringify(this.investments))
      } catch (error) {
        console.error('保存数据到localStorage失败:', error)
        this.showError('保存数据失败')
      }
    },
    
    // 从本地存储加载
    loadFromLocalStorage() {
      try {
        const transactions = localStorage.getItem('financeTransactions')
        const investments = localStorage.getItem('financeInvestments')
        
        if (transactions) {
          this.transactions = JSON.parse(transactions)
        }
        
        if (investments) {
          this.investments = JSON.parse(investments)
        }
      } catch (error) {
        console.error('从localStorage加载数据失败:', error)
        this.showError('加载数据失败')
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
      }
      this.isEditing = false
      this.showTransactionPage = true
    },
    
    editTransaction(transaction) {
      this.currentTransaction = { ...transaction }
      this.isEditing = true
      this.showTransactionPage = true
    },
    
    saveTransaction(transaction) {
      if (!transaction.description || transaction.amount <= 0) {
        this.showError('请输入有效的明细和金额')
        return
      }

      if (this.isEditing) {
        const index = this.transactions.findIndex(t => t.id === transaction.id)
        if (index !== -1) {
          this.transactions.splice(index, 1, transaction)
        }
      } else {
        this.transactions.push(transaction)
      }
      
      this.saveToLocalStorage()
      this.cancelTransaction()
      this.$message.success(this.isEditing ? '交易更新成功' : '交易添加成功')
    },
    
    cancelTransaction() {
      this.showTransactionPage = false
      this.currentTransaction = null
      this.isEditing = false
    },
    
    deleteTransaction(id) {
      this.$confirm('此操作将永久删除该交易记录，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id)
        this.saveToLocalStorage()
        this.$message.success('删除成功')
      }).catch(() => {
        // 用户取消操作
      })
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
      }
      this.isEditingInvestment = false
      this.showInvestmentPage = true
    },
    
    editInvestment(investment) {
      this.currentInvestment = { ...investment }
      this.isEditingInvestment = true
      this.showInvestmentPage = true
    },
    
    saveInvestment(investment) {
      if (this.isEditingInvestment) {
        // 编辑现有投资
        const index = this.investments.findIndex(i => i.id === investment.id)
        if (index !== -1) {
          this.investments.splice(index, 1, investment)
        }
      } else {
        // 添加新投资
        this.investments.push(investment)
      }
      
      this.saveToLocalStorage()
      this.cancelInvestment()
      this.$message.success(this.isEditingInvestment ? '投资更新成功' : '投资添加成功')
    },
    
    cancelInvestment() {
      this.showInvestmentPage = false
      this.currentInvestment = null
      this.isEditingInvestment = false
    },
    
    deleteInvestment(id) {
      this.$confirm('此操作将永久删除该投资记录，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.investments = this.investments.filter(investment => investment.id !== id)
        this.saveToLocalStorage()
        this.$message.success('投资记录已删除')
      }).catch(() => {
        // 用户取消操作
      })
    },
    
    // 更新投资（用于实时价格更新）
    updateInvestment(investment) {
      const index = this.investments.findIndex(i => i.id === investment.id)
      if (index !== -1) {
        this.investments.splice(index, 1, investment)
        this.saveToLocalStorage()
      }
    },
    
    // 检测是否为移动设备
    checkIsMobile() {
      this.isMobile = window.innerWidth <= 768
    }
  },
  mounted() {
    // 初始化类型管理器
    TypeManager.initialize()
    this.loadFromLocalStorage()
    
    // 检测是否为移动设备
    this.checkIsMobile()
    window.addEventListener('resize', this.checkIsMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIsMobile)
  }
}
</script>

<style scoped>
#app {
  display: flex;
  height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.desktop-sidebar {
  background: linear-gradient(135deg, #409eff, #64b5f6);
  color: white;
  height: 100%;
  position: fixed;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.app-logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-logo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.sidebar-menu {
  border: none !important;
  background: transparent !important;
  margin-top: 20px;
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 1rem;
  height: 50px;
  margin: 5px 10px;
  border-radius: 8px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.main-container {
  flex: 1;
  margin-left: 220px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-header {
  background: linear-gradient(135deg, #409eff, #64b5f6);
  color: white;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 999;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f6f7;
}

.mobile-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 60px;
}

.mobile-menu {
  border: none !important;
  height: 100%;
  display: flex;
  justify-content: space-around;
}

.mobile-menu :deep(.el-menu-item) {
  height: 60px;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  flex: 1;
}

.mobile-menu :deep(.el-menu-item .el-icon) {
  margin: 0 0 4px 0;
  font-size: 1.2rem;
}

.mobile-menu :deep(.el-menu-item.is-active) {
  color: #409eff !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .desktop-sidebar {
    display: none;
  }
  
  .main-container {
    margin-left: 0;
    margin-bottom: 60px;
  }
  
  .content-area {
    padding: 15px;
  }
}

@media (min-width: 769px) {
  .mobile-header,
  .mobile-navbar {
    display: none;
  }
}
</style>