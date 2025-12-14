const { createApp } = Vue;

// 交易记录组件
const TransactionItem = {
  props: ['transaction'],
  template: `
    <div class="transaction-item" :class="transaction.type">
      <div class="transaction-info">
        <h4>{{ transaction.description }}</h4>
        <p>{{ formatDate(transaction.date) }}</p>
      </div>
      <div class="transaction-amount">
        ¥{{ transaction.amount.toFixed(2) }}
      </div>
      <button @click="$emit('delete-transaction', transaction.id)" class="delete-btn">删除</button>
    </div>
  `,
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    }
  }
};

// 投资项目组件
const InvestmentItem = {
  props: ['investment'],
  template: `
    <div class="investment-item">
      <div class="investment-info">
        <h4>{{ investment.name }}</h4>
        <p>类型: {{ investment.type }} | 买入日期: {{ formatDate(investment.purchaseDate) }}</p>
      </div>
      <div class="investment-details">
        <span>数量: {{ investment.quantity }}</span>
        <span>买入价: ¥{{ investment.purchasePrice.toFixed(2) }}</span>
        <span v-if="investment.currentPrice">当前价: ¥{{ investment.currentPrice.toFixed(2) }}</span>
      </div>
      <div class="investment-value">
        <div>总价值: ¥{{ currentValue.toFixed(2) }}</div>
        <div :class="profitClass">盈亏: ¥{{ profit.toFixed(2) }} ({{ profitPercent.toFixed(2) }}%)</div>
      </div>
      <button @click="$emit('delete-investment', investment.id)" class="delete-btn">删除</button>
    </div>
  `,
  computed: {
    currentValue() {
      const price = this.investment.currentPrice || this.investment.purchasePrice;
      return price * this.investment.quantity;
    },
    profit() {
      return (this.investment.currentPrice - this.investment.purchasePrice) * this.investment.quantity || 0;
    },
    profitClass() {
      return {
        'profit': this.profit >= 0,
        'loss': this.profit < 0
      };
    },
    profitPercent() {
      if (!this.investment.currentPrice) return 0;
      return ((this.investment.currentPrice - this.investment.purchasePrice) / this.investment.purchasePrice) * 100;
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    }
  }
};

// 投资建议组件
const InvestmentAdvice = {
  props: ['balance'],
  data() {
    return {
      emergencyFundMonths: 3, // 建议的应急资金月数
      investmentOptions: [
        { name: '紧急备用金', proportion: 0, description: '建议保留3-6个月生活费作为紧急备用金' },
        { name: '稳健型理财', proportion: 0, description: '如银行定期、国债等，风险低，收益稳定' },
        { name: '基金投资', proportion: 0, description: '混合型基金或指数基金，中等风险中等收益' },
        { name: '股票投资', proportion: 0, description: '高风险高收益，适合长期投资' },
        { name: '保险配置', proportion: 0, description: '意外险、重疾险等保障型保险' }
      ]
    };
  },
  computed: {
    advice() {
      if (this.balance <= 0) {
        return [
          { name: '财务状况分析', message: '您的当前余额为负，请优先考虑增加收入或减少支出。' }
        ];
      }

      // 根据余额给出不同的分配建议
      let advice = [];
      
      // 计算紧急备用金（假设月支出为总收入的60%）
      const monthlyExpense = this.balance * 0.6;
      const emergencyFund = monthlyExpense * this.emergencyFundMonths;
      
      if (this.balance > emergencyFund) {
        // 如果资金充足，提供详细的投资分配建议
        const availableFund = this.balance - emergencyFund;
        advice = [
          { 
            name: '紧急备用金', 
            amount: emergencyFund,
            proportion: (emergencyFund / this.balance * 100).toFixed(1),
            message: `建议保留¥${emergencyFund.toFixed(2)}作为紧急备用金（${this.emergencyFundMonths}个月生活费）`
          },
          { 
            name: '稳健型理财', 
            amount: availableFund * 0.3,
            proportion: (availableFund * 0.3 / this.balance * 100).toFixed(1),
            message: `建议投入¥${(availableFund * 0.3).toFixed(2)}于稳健型理财产品`
          },
          { 
            name: '基金投资', 
            amount: availableFund * 0.4,
            proportion: (availableFund * 0.4 / this.balance * 100).toFixed(1),
            message: `建议投入¥${(availableFund * 0.4).toFixed(2)}于基金投资`
          },
          { 
            name: '股票投资', 
            amount: availableFund * 0.2,
            proportion: (availableFund * 0.2 / this.balance * 100).toFixed(1),
            message: `建议投入¥${(availableFund * 0.2).toFixed(2)}于股票投资`
          },
          { 
            name: '保险配置', 
            amount: availableFund * 0.1,
            proportion: (availableFund * 0.1 / this.balance * 100).toFixed(1),
            message: `建议投入¥${(availableFund * 0.1).toFixed(2)}于保险配置`
          }
        ];
      } else {
        // 资金不足时，建议先建立紧急备用金
        advice = [
          { 
            name: '紧急备用金建设', 
            amount: this.balance,
            proportion: '100',
            message: `您的资金尚不足以建立充足的紧急备用金，建议将全部¥${this.balance.toFixed(2)}用于此目的`
          }
        ];
      }
      
      return advice;
    }
  },
  template: `
    <div class="investment-advice">
      <h3>投资建议</h3>
      <p>根据您当前的财务状况，我们为您提供以下投资建议：</p>
      <div class="advice-list">
        <div v-for="(item, index) in advice" :key="index" class="advice-item">
          <div class="advice-header">
            <h4>{{ item.name }}</h4>
            <span v-if="item.proportion" class="proportion">{{ item.proportion }}%</span>
          </div>
          <p>{{ item.message }}</p>
          <div v-if="item.amount" class="amount-bar">
            <div class="amount-fill" :style="{ width: item.proportion + '%' }"></div>
          </div>
        </div>
      </div>
      <div class="disclaimer">
        <p><strong>免责声明：</strong>以上仅为一般性投资建议，不构成具体投资意见。投资有风险，请谨慎决策。</p>
      </div>
    </div>
  `
};

// 财务管理主应用组件
const FinanceApp = {
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
  components: {
    TransactionItem,
    InvestmentItem,
    InvestmentAdvice
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
  },
  template: `
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
          <section class="summary">
            <div class="summary-card income">
              <h3>总收入</h3>
              <p>¥{{ totalIncome.toFixed(2) }}</p>
            </div>
            
            <div class="summary-card expense">
              <h3>总支出</h3>
              <p>¥{{ totalExpense.toFixed(2) }}</p>
            </div>
            
            <div class="summary-card balance" :class="{ negative: balance < 0 }">
              <h3>余额</h3>
              <p>¥{{ balance.toFixed(2) }}</p>
            </div>
          </section>
          
          <!-- 添加交易 -->
          <section class="add-transaction">
            <h2>添加交易</h2>
            <form @submit.prevent="addTransaction">
              <div class="form-group">
                <label>类型:</label>
                <select v-model="newTransaction.type">
                  <option value="income">收入</option>
                  <option value="expense">支出</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>描述:</label>
                <input type="text" v-model="newTransaction.description" placeholder="例如：工资、房租、餐饮等" required>
              </div>
              
              <div class="form-group">
                <label>金额:</label>
                <input type="number" v-model.number="newTransaction.amount" min="0" step="0.01" placeholder="0.00" required>
              </div>
              
              <div class="form-group">
                <label>日期:</label>
                <input type="date" v-model="newTransaction.date" required>
              </div>
              
              <button type="submit" class="add-btn">添加</button>
            </form>
          </section>
          
          <!-- 交易列表 -->
          <section class="transactions">
            <h2>交易记录</h2>
            <div v-if="transactions.length === 0" class="no-transactions">
              暂无交易记录
            </div>
            <div v-else class="transaction-list">
              <transaction-item 
                v-for="transaction in transactions" 
                :key="transaction.id"
                :transaction="transaction"
                @delete-transaction="deleteTransaction"
              ></transaction-item>
            </div>
          </section>
        </div>

        <!-- 投资管理标签页 -->
        <div v-show="activeTab === 'investments'">
          <!-- 投资概览 -->
          <section class="summary">
            <div class="summary-card">
              <h3>总投资成本</h3>
              <p>¥{{ totalInvestmentCost.toFixed(2) }}</p>
            </div>
            
            <div class="summary-card">
              <h3>当前总价值</h3>
              <p>¥{{ totalInvestmentValue.toFixed(2) }}</p>
            </div>
            
            <div class="summary-card" :class="{ profit: totalInvestmentProfit >= 0, loss: totalInvestmentProfit < 0 }">
              <h3>总盈亏</h3>
              <p>¥{{ totalInvestmentProfit.toFixed(2) }}</p>
            </div>
          </section>
          
          <!-- 添加投资 -->
          <section class="add-investment">
            <h2>添加投资项目</h2>
            <form @submit.prevent="addInvestment">
              <div class="form-row">
                <div class="form-group">
                  <label>投资类型:</label>
                  <select v-model="newInvestment.type">
                    <option value="股票">股票</option>
                    <option value="基金">基金</option>
                    <option value="债券">债券</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>名称:</label>
                  <input type="text" v-model="newInvestment.name" placeholder="例如：阿里巴巴、沪深300等" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>数量:</label>
                  <input type="number" v-model.number="newInvestment.quantity" min="0" step="0.01" placeholder="0" required>
                </div>
                
                <div class="form-group">
                  <label>买入价格:</label>
                  <input type="number" v-model.number="newInvestment.purchasePrice" min="0" step="0.01" placeholder="0.00" required>
                </div>
                
                <div class="form-group">
                  <label>当前价格:</label>
                  <input type="number" v-model.number="newInvestment.currentPrice" min="0" step="0.01" placeholder="0.00 (可选)">
                </div>
              </div>
              
              <div class="form-group">
                <label>买入日期:</label>
                <input type="date" v-model="newInvestment.purchaseDate" required>
              </div>
              
              <button type="submit" class="add-btn">添加投资</button>
            </form>
          </section>
          
          <!-- 投资列表 -->
          <section class="investments">
            <h2>投资组合</h2>
            <div v-if="investments.length === 0" class="no-investments">
              暂无投资记录
            </div>
            <div v-else class="investment-list">
              <investment-item 
                v-for="investment in investments" 
                :key="investment.id"
                :investment="investment"
                @delete-investment="deleteInvestment"
              ></investment-item>
            </div>
          </section>
        </div>
        
        <!-- 投资建议标签页 -->
        <div v-show="activeTab === 'advice'">
          <section class="summary">
            <div class="summary-card income">
              <h3>总收入</h3>
              <p>¥{{ totalIncome.toFixed(2) }}</p>
            </div>
            
            <div class="summary-card expense">
              <h3>总支出</h3>
              <p>¥{{ totalExpense.toFixed(2) }}</p>
            </div>
            
            <div class="summary-card balance" :class="{ negative: balance < 0 }">
              <h3>可用资金</h3>
              <p>¥{{ balance.toFixed(2) }}</p>
            </div>
          </section>
          
          <investment-advice :balance="balance"></investment-advice>
        </div>
      </main>
      
      <!-- 数据管理 -->
      <footer class="data-management">
        <button @click="clearAllData" class="clear-btn">清除所有数据</button>
      </footer>
    </div>
  `
};

// 创建Vue应用
const app = createApp({
  components: {
    FinanceApp
  }
});

app.mount('#app');