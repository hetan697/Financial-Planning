<template>
  <div class="transactions-view">
    <!-- 财务概览 -->
    <div class="card-section">
      <div class="card-header">
        <span class="card-title">财务概览</span>
        <div class="date-filter">
          <select v-model="selectedYear" @change="updateDateFilter">
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
          <select v-model="selectedMonth" @change="updateDateFilter" :disabled="isYearSummary">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
          <label class="checkbox-container">
            <input type="checkbox" v-model="isYearSummary" @change="toggleYearSummary">
            <span class="checkmark">按年统计</span>
          </label>
        </div>
      </div>
      
      <SummarySection 
        :total-income="filteredTotalIncome" 
        :total-expense="filteredTotalExpense" 
        :balance="filteredBalance"
        :investment-total="investmentTotal"
      />
    </div>
    
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
      
      <TransactionList 
        :transactions="filteredSortedTransactions" 
        @delete-transaction="$emit('delete-transaction', $event)"
        @edit-transaction="$emit('edit-transaction', $event)"
      />
    </div>
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
  emits: ['add-transaction', 'edit-transaction', 'delete-transaction'],
  data() {
    const now = new Date();
    return {
      selectedYear: now.getFullYear(),
      selectedMonth: now.getMonth() + 1,
      isYearSummary: false,
      months: [
        { label: '1月', value: 1 },
        { label: '2月', value: 2 },
        { label: '3月', value: 3 },
        { label: '4月', value: 4 },
        { label: '5月', value: 5 },
        { label: '6月', value: 6 },
        { label: '7月', value: 7 },
        { label: '8月', value: 8 },
        { label: '9月', value: 9 },
        { label: '10月', value: 10 },
        { label: '11月', value: 11 },
        { label: '12月', value: 12 }
      ]
    };
  },
  computed: {
    availableYears() {
      const years = this.transactions.map(t => new Date(t.date).getFullYear());
      const uniqueYears = [...new Set(years)];
      return uniqueYears.length > 0 ? uniqueYears.sort((a, b) => b - a) : [new Date().getFullYear()];
    },
    filteredTransactions() {
      return this.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionYear = transactionDate.getFullYear();
        const transactionMonth = transactionDate.getMonth() + 1;
        
        if (this.isYearSummary) {
          return transactionYear === this.selectedYear;
        } else {
          return transactionYear === this.selectedYear && transactionMonth === this.selectedMonth;
        }
      });
    },
    filteredSortedTransactions() {
      return [...this.filteredTransactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
    },
    filteredTotalIncome() {
      return this.filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    filteredTotalExpense() {
      return this.filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    filteredBalance() {
      return this.filteredTotalIncome - this.filteredTotalExpense;
    },
    investmentTotal() {
      return this.investments.reduce((sum, investment) => {
        const currentValue = investment.currentPrice !== null ? 
          investment.currentPrice : investment.purchasePrice;
        return sum + (investment.quantity * currentValue);
      }, 0);
    }
  },
  methods: {
    updateDateFilter() {
      // Filter updated automatically via computed properties
    },
    toggleYearSummary() {
      // Year summary toggled automatically via v-model
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
  overflow-y: auto;
}

.card-section {
  background: white;
  border-radius: 16px;
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
  flex-wrap: wrap;
  gap: 10px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.date-filter {
  display: flex;
  gap: 10px;
  align-items: center;
}

.date-filter select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  font-size: 14px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

.checkbox-container input {
  margin-right: 8px;
}

.btn-primary {
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #0062cc;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-filter {
    justify-content: space-between;
  }
  
  .card-title {
    text-align: center;
  }
}
</style>