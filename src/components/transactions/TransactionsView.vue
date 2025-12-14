<template>
  <div class="transactions-view">
    <!-- 交易列表 -->
    <div class="card-section">
      <div class="card-header">
        <span class="card-title">交易记录</span>
        <button 
          class="btn-primary"
          @click="$emit('add-transaction')"
        >
          添加交易
        </button>
      </div>
      
      <div class="filters">
        <select v-model="filterType" class="filter-select">
          <option value="">全部类型</option>
          <option value="income">收入</option>
          <option value="expense">支出</option>
        </select>
        
        <select v-model="filterMonth" class="filter-select">
          <option value="">全部月份</option>
          <option 
            v-for="month in availableMonths" 
            :key="month.value" 
            :value="month.value"
          >
            {{ month.label }}
          </option>
        </select>
      </div>
      
      <div class="transaction-list">
        <div 
          v-for="transaction in filteredTransactions" 
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <div class="transaction-main">
              <span class="transaction-description">{{ transaction.description }}</span>
              <span 
                class="transaction-amount" 
                :class="transaction.type"
              >
                {{ transaction.type === 'expense' ? '-' : '+' }}¥{{ transaction.amount.toFixed(2) }}
              </span>
            </div>
            <div class="transaction-meta">
              <span class="transaction-date">{{ formatDate(transaction.date) }}</span>
              <span 
                v-if="transaction.notes" 
                class="transaction-notes"
              >
                {{ transaction.notes }}
              </span>
            </div>
          </div>
          
          <div class="transaction-actions">
            <button 
              class="action-button edit-button"
              @click="$emit('edit-transaction', transaction)"
            >
              编辑
            </button>
            <button 
              class="action-button delete-button"
              @click="$emit('delete-transaction', transaction.id)"
            >
              删除
            </button>
          </div>
        </div>
        
        <div v-if="filteredTransactions.length === 0" class="empty-state">
          <p>暂无交易记录</p>
        </div>
      </div>
    </div>
    
    <div class="summary-section card-section">
      <h3>统计摘要</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">总收入</span>
          <span class="summary-value income">¥{{ totalIncome.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">总支出</span>
          <span class="summary-value expense">¥{{ totalExpense.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">净收入</span>
          <span 
            class="summary-value" 
            :class="{ expense: netIncome < 0, income: netIncome >= 0 }"
          >
            ¥{{ netIncome.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransactionsView',
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
  emits: ['add-transaction', 'edit-transaction', 'delete-transaction'],
  data() {
    return {
      filterType: '',
      filterMonth: ''
    };
  },
  computed: {
    availableMonths() {
      const months = new Set();
      this.transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        months.add({ value: monthKey, label: monthLabel });
      });
      
      return Array.from(months).sort((a, b) => b.value.localeCompare(a.value));
    },
    filteredTransactions() {
      return this.transactions.filter(transaction => {
        // 类型过滤
        if (this.filterType && transaction.type !== this.filterType) {
          return false;
        }
        
        // 月份过滤
        if (this.filterMonth) {
          const date = new Date(transaction.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (monthKey !== this.filterMonth) {
            return false;
          }
        }
        
        return true;
      }).sort((a, b) => new Date(b.date) - new Date(a.date)); // 按日期排序
    },
    totalIncome() {
      return this.filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    },
    totalExpense() {
      return this.filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    },
    netIncome() {
      return this.totalIncome - this.totalExpense;
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.transactions-view {
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

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
  background: white;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 16px;
  background: #F2F2F7;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: #E5E5EA;
  transform: translateY(-2px);
}

.transaction-info {
  flex: 1;
}

.transaction-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.transaction-description {
  font-weight: 500;
  color: #333;
}

.transaction-amount {
  font-weight: 600;
  font-size: 16px;
}

.transaction-amount.income {
  color: #34C759;
}

.transaction-amount.expense {
  color: #FF3B30;
}

.transaction-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.transaction-notes {
  font-style: italic;
}

.transaction-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button {
  background: #007AFF;
  color: white;
}

.edit-button:hover {
  background: #0062cc;
  transform: scale(1.05);
}

.delete-button {
  background: #FF3B30;
  color: white;
}

.delete-button:hover {
  background: #d73329;
  transform: scale(1.05);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.summary-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

.summary-value {
  font-size: 20px;
  font-weight: 600;
}

.summary-value.income {
  color: #34C759;
}

.summary-value.expense {
  color: #FF3B30;
}

@media (max-width: 768px) {
  .transactions-view {
    gap: 15px;
  }
  
  .card-section {
    border-radius: 16px;
    padding: 15px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .transaction-main {
    width: 100%;
  }
  
  .transaction-actions {
    align-self: flex-end;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>