<template>
  <div class="investment-management">
    <!-- 投资概览 -->
    <InvestmentSummary 
      :total-cost="totalInvestmentCost" 
      :total-value="totalInvestmentValue" 
      :total-profit="totalInvestmentProfit"
    />
    
    <!-- 投资计算器 -->
    <div class="card-section">
      <InvestmentCalculator
        :investable-fund="availableFunds"
        :total-assets="totalAssets"
      />
    </div>
    
    <!-- 投资列表 -->
    <div class="card-section">
      <div class="card-header">
        <span class="card-title">投资项目</span>
        <button 
          class="btn-primary"
          @click="showAddInvestmentForm"
        >
          添加投资
        </button>
      </div>
      
      <InvestmentList 
        :investments="investments"
        @edit-investment="editInvestment"
        @delete-investment="requestDeleteInvestment"
      />
    </div>
    
    <!-- 投资建议 -->
    <InvestmentAdvice 
      :balance="balance"
      :transactions="transactions"
      :investments="investments"
    />
  </div>
</template>

<script>
import InvestmentSummary from './InvestmentSummary.vue';
import InvestmentList from './InvestmentList.vue';
import InvestmentAdvice from './InvestmentAdvice.vue';
import InvestmentCalculator from './InvestmentCalculator.vue';

export default {
  name: 'InvestmentManagement',
  components: {
    InvestmentSummary,
    InvestmentList,
    InvestmentAdvice,
    InvestmentCalculator
  },
  props: {
    investments: {
      type: Array,
      default: () => []
    },
    balance: {
      type: Number,
      default: 0
    },
    transactions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['add-investment', 'update-investment', 'delete-investment', 'edit-investment', 'cancel-edit'],
  computed: {
    totalInvestmentCost() {
      return this.investments.reduce((sum, investment) => 
        sum + (investment.quantity * investment.purchasePrice), 0);
    },
    totalInvestmentValue() {
      return this.investments.reduce((sum, investment) => {
        const currentValue = investment.currentPrice !== null && investment.currentPrice !== undefined ? 
          investment.currentPrice : investment.purchasePrice;
        return sum + (investment.quantity * currentValue);
      }, 0);
    },
    totalInvestmentProfit() {
      return this.totalInvestmentValue - this.totalInvestmentCost;
    },
    // 紧急备用金（基于过去6个月平均月支出 × 3个月）
    emergencyFund() {
      // 计算过去6个月的支出
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
      const recentExpenses = expenseTransactions.filter(t => new Date(t.date) >= sixMonthsAgo);
      
      if (recentExpenses.length === 0) return 0;
      
      const totalExpense = recentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
      const monthsCount = Math.min(6, this.getMonthsCovered(recentExpenses));
      const averageMonthlyExpense = monthsCount > 0 ? totalExpense / monthsCount : 0;
      
      return averageMonthlyExpense * 3; // 3个月的紧急备用金
    },
    // 可投资金额（账户余额 - 紧急备用金）
    availableFunds() {
      if (this.balance <= 0) return 0;
      return Math.max(0, this.balance - this.emergencyFund);
    },
    // 总资产（余额 + 投资总价值）
    totalAssets() {
      const investmentValue = this.investments.reduce((sum, investment) => {
        const price = investment.currentPrice !== null ? 
          investment.currentPrice : investment.purchasePrice;
        return sum + (price * investment.quantity);
      }, 0);
      
      return this.balance + investmentValue;
    }
  },
  methods: {
    showAddInvestmentForm() {
      this.$emit('add-investment');
    },
    editInvestment(investment) {
      this.$emit('edit-investment', investment);
    },
    requestDeleteInvestment(id) {
      if (confirm('此操作将永久删除该投资记录，是否继续？')) {
        this.$emit('delete-investment', id);
        alert('删除成功');
      }
    },
    // 计算覆盖的月份数量
    getMonthsCovered(transactions) {
      if (transactions.length === 0) return 0;
      
      const dates = transactions.map(t => new Date(t.date));
      const minDate = new Date(Math.min.apply(null, dates));
      const maxDate = new Date(Math.max.apply(null, dates));
      
      return (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
             (maxDate.getMonth() - minDate.getMonth()) + 1;
    }
  }
};
</script>

<style scoped>
.investment-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.card-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.btn-primary {
  padding: 10px 20px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #0062cc;
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .investment-management {
    gap: 15px;
  }
  
  .card-section {
    border-radius: 16px;
    padding: 15px;
  }
}
</style>