<template>
  <div class="transactions-view">
    <!-- 财务概览 -->
    <SummarySection 
      :total-income="totalIncome" 
      :total-expense="totalExpense" 
      :balance="balance"
      :investment-total="investmentTotal"
    />
    
    <!-- 交易列表 -->
    <el-card class="transaction-list-card">
      <template #header>
        <div class="card-header">
          <span>交易记录</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="$emit('add-transaction')"
          >
            添加交易
          </el-button>
        </div>
      </template>
      
      <TransactionList 
        :transactions="sortedTransactions" 
        @delete-transaction="$emit('delete-transaction', $event)"
        @edit-transaction="$emit('edit-transaction', $event)"
      />
    </el-card>
  </div>
</template>

<script>
import { ElCard, ElButton } from 'element-plus';
import SummarySection from '../../components/SummarySection.vue';
import TransactionList from './TransactionList.vue';

export default {
  name: 'TransactionsView',
  components: {
    ElCard,
    ElButton,
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
.transactions-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .transactions-view {
    padding: 15px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>