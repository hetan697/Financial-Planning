<template>
  <div class="investment-advice">
    <h3>投资建议</h3>
    
    <div v-if="hasValidData" class="advice-content">
      <!-- 投资计算器 -->
      <InvestmentCalculator
        :investable-fund="availableFunds"
        :total-assets="totalAssets"
        @update:investment-options="updateInvestmentOptions"
      />
    </div>
    
    <div v-else class="advice-placeholder">
      <p>暂无足够的财务数据以提供建议，请先添加交易记录。</p>
    </div>
  </div>
</template>

<script>
import InvestmentCalculator from './InvestmentCalculator.vue';

export default {
  name: 'InvestmentAdvice',
  components: {
    InvestmentCalculator
  },
  props: {
    balance: {
      type: Number,
      required: true
    },
    transactions: {
      type: Array,
      required: true
    },
    investments: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      investmentOptions: [],
      emergencyFundMonths: 3
    };
  },
  computed: {
    // 检查是否有足够的数据来提供建议
    hasValidData() {
      return this.transactions.length > 0;
    },
    
    // 支出交易记录
    expenseTransactions() {
      return this.transactions.filter(t => t.type === 'expense');
    },
    
    // 过去6个月的支出记录
    recentExpenses() {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return this.expenseTransactions.filter(t => new Date(t.date) >= sixMonthsAgo);
    },
    
    // 计算月均支出
    averageMonthlyExpense() {
      if (this.recentExpenses.length === 0) return 0;
      
      const totalExpense = this.recentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
      const monthsCount = Math.min(6, this.getMonthsCovered(this.recentExpenses));
      return monthsCount > 0 ? totalExpense / monthsCount : 0;
    },
    
    // 紧急备用金
    emergencyFund() {
      return this.averageMonthlyExpense * this.emergencyFundMonths;
    },
    
    // 可投资金额（扣除紧急备用金后的资金）
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
    updateInvestmentOptions(options) {
      this.investmentOptions = options;
    },
    
    // 计算支出记录覆盖的月份数量
    getMonthsCovered(transactions) {
      if (transactions.length === 0) return 0;
      
      // 获取最早的和最晚的交易日期
      const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      
      // 计算月份差
      const yearDiff = lastDate.getFullYear() - firstDate.getFullYear();
      const monthDiff = lastDate.getMonth() - firstDate.getMonth();
      return yearDiff * 12 + monthDiff + 1; // +1表示包含起始和结束月份
    }
  }
};
</script>

<style scoped>
.investment-advice {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.investment-advice h3 {
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.advice-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .investment-advice {
    padding: 15px;
    margin-bottom: 20px;
  }
}
</style>