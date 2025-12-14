<template>
  <div>
    <!-- 财务概览 -->
    <SummarySection 
      :total-income="totalIncome" 
      :total-expense="totalExpense" 
      :balance="balance"
      :investment-total="investmentTotal"
    />
    
    <!-- 交易列表 -->
    <TransactionList 
      :transactions="sortedTransactions" 
      @delete-transaction="$emit('delete-transaction', $event)"
      @edit-transaction="$emit('edit-transaction', $event)"
      @add-transaction="$emit('add-transaction')"
    />
  </div>
</template>

<script>
import SummarySection from './SummarySection.vue';
import TransactionList from './TransactionList.vue';

export default {
  name: 'TransactionsView',
  components: {
    SummarySection,
    TransactionList
  },
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
  emits: ['delete-transaction', 'edit-transaction', 'add-transaction'],
  computed: {
    totalIncome() {
      return this.transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    totalExpense() {
      return this.transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    balance() {
      return this.totalIncome - this.totalExpense;
    },
    sortedTransactions() {
      // 按日期降序排列
      return [...this.transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
    },
    investmentTotal() {
      return this.investments.reduce((sum, investment) => {
        const currentValue = investment.currentPrice !== null ? 
          investment.currentPrice : investment.purchasePrice;
        return sum + (investment.quantity * currentValue);
      }, 0);
    }
  }
};
</script>

<style scoped>
/* 组件样式可以在这里添加 */
.transactions-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .transactions-view {
    padding: 10px;
  }
}
</style>