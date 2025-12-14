<template>
  <div class="transactions-view">
    <!-- 财务概览 -->
    <el-card class="summary-card">
      <template #header>
        <div class="card-header">
          <span>财务概览</span>
          <div class="date-filter">
            <el-select 
              v-model="selectedYear" 
              placeholder="选择年份" 
              size="small"
              @change="updateDateFilter"
            >
              <el-option
                v-for="year in availableYears"
                :key="year"
                :label="year"
                :value="year"
              />
            </el-select>
            <el-select 
              v-model="selectedMonth" 
              placeholder="选择月份" 
              size="small"
              @change="updateDateFilter"
            >
              <el-option
                v-for="month in months"
                :key="month.value"
                :label="month.label"
                :value="month.value"
              />
            </el-select>
            <el-checkbox 
              v-model="isYearSummary" 
              @change="toggleYearSummary"
              size="small"
            >
              按年统计
            </el-checkbox>
          </div>
        </div>
      </template>
      
      <SummarySection 
        :total-income="filteredTotalIncome" 
        :total-expense="filteredTotalExpense" 
        :balance="filteredBalance"
        :investment-total="investmentTotal"
      />
    </el-card>
    
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
        :transactions="filteredSortedTransactions" 
        @delete-transaction="$emit('delete-transaction', $event)"
        @edit-transaction="$emit('edit-transaction', $event)"
      />
    </el-card>
  </div>
</template>

<script>
import { ElCard, ElButton, ElSelect, ElOption, ElCheckbox } from 'element-plus';
import SummarySection from '../../components/SummarySection.vue';
import TransactionList from './TransactionList.vue';

export default {
  name: 'TransactionsView',
  components: {
    ElCard,
    ElButton,
    ElSelect,
    ElOption,
    ElCheckbox,
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
  data() {
    return {
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      isYearSummary: false,
      months: [
        { value: 1, label: '1月' },
        { value: 2, label: '2月' },
        { value: 3, label: '3月' },
        { value: 4, label: '4月' },
        { value: 5, label: '5月' },
        { value: 6, label: '6月' },
        { value: 7, label: '7月' },
        { value: 8, label: '8月' },
        { value: 9, label: '9月' },
        { value: 10, label: '10月' },
        { value: 11, label: '11月' },
        { value: 12, label: '12月' }
      ]
    };
  },
  computed: {
    availableYears() {
      const years = new Set();
      this.transactions.forEach(transaction => {
        const year = new Date(transaction.date).getFullYear();
        years.add(year);
      });
      // 添加当前年份以防没有交易记录
      years.add(new Date().getFullYear());
      return Array.from(years).sort((a, b) => b - a);
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
      // 按日期降序排列交易记录
      return [...this.filteredTransactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
    },
    filteredTotalIncome() {
      return this.filteredTransactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    },
    filteredTotalExpense() {
      return this.filteredTransactions
        .filter(transaction => transaction.type === 'expense')
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
      // 更新日期筛选条件
    },
    toggleYearSummary() {
      // 切换年统计模式
    }
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-card {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .date-filter {
    width: 100%;
    justify-content: space-between;
  }
}
</style>