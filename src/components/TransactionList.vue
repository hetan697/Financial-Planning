<template>
  <section class="transactions">
    <h2>交易记录</h2>
    <div v-if="transactions.length === 0" class="no-transactions">
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>暂无交易记录</h3>
        <p>您还没有添加任何收入或支出记录</p>
        <p class="help-text">点击上方"添加交易"区域录入您的第一条交易记录</p>
      </div>
    </div>
    <div v-else class="transaction-list">
      <div 
        class="transaction-item" 
        :class="transaction.type"
        v-for="transaction in transactions" 
        :key="transaction.id"
      >
        <div class="transaction-info">
          <h4>{{ transaction.description }}</h4>
          <p>{{ formatDate(transaction.date) }}</p>
          <p v-if="transaction.notes" class="notes">{{ transaction.notes }}</p>
        </div>
        <div class="transaction-amount">
          ¥{{ transaction.amount.toFixed(2) }}
        </div>
        <div class="transaction-actions">
          <button @click="editTransaction(transaction)" class="edit-btn">编辑</button>
          <button @click="deleteTransaction(transaction.id)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TransactionList',
  props: {
    transactions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['delete-transaction', 'edit-transaction'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    deleteTransaction(id) {
      this.$emit('delete-transaction', id);
    },
    editTransaction(transaction) {
      this.$emit('edit-transaction', transaction);
    }
  }
};
</script>

<style scoped>
/* 交易记录 */
.transactions {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.transactions h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.no-transactions {
  text-align: center;
  padding: 40px 20px;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #666;
}

.empty-state p {
  color: #999;
  margin-bottom: 5px;
}

.help-text {
  font-style: italic;
  margin-top: 15px;
  color: #667eea;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #fafafa;
  transition: box-shadow 0.2s;
}

.transaction-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.transaction-item.income {
  border-left: 4px solid #4caf50;
}

.transaction-item.expense {
  border-left: 4px solid #f44336;
}

.transaction-info {
  flex: 1;
}

.transaction-info h4 {
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.transaction-info p {
  color: #777;
  font-size: 0.9rem;
}

.transaction-info .notes {
  color: #555;
  font-style: italic;
  margin-top: 3px;
}

.transaction-amount {
  font-weight: bold;
  margin-right: 15px;
  font-size: 1.1rem;
}

.transaction-item.income .transaction-amount {
  color: #4caf50;
}

.transaction-item.expense .transaction-amount {
  color: #f44336;
}

.transaction-actions {
  display: flex;
  gap: 10px;
}

.edit-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit-btn:hover {
  background-color: #138496;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .transaction-amount {
    margin: 10px 0;
  }
  
  .transaction-actions {
    align-self: flex-end;
  }
}
</style>