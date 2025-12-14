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
import SummarySection from '../../components/SummarySection.vue';
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
      required: true
    },
    investments: {
      type: Array,
      required: true
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
    investmentTotal() {
      return this.investments.reduce((sum, investment) => {
        const currentValue = investment.currentPrice !== null ? 
          investment.currentPrice : investment.purchasePrice;
        return sum + (investment.quantity * currentValue);
      }, 0);
    },
    sortedTransactions() {
      // 按日期降序排列交易记录
      return [...this.transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
    }
  }
};
</script>

<style scoped>
/* 统一的组件间距 */
.summary-section,
.transaction-list {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .summary-section,
  .transaction-list {
    padding: 15px;
    margin-bottom: 20px;
  }
}
</style>