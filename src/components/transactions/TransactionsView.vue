<template>
  <div class="transactions-view">
    <!-- 财务概览 -->
    <div class="summary-section">
      <div class="summary-header">
        <h2 class="section-title">财务概览</h2>
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
      
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon income">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="summary-content">
            <h3>总收入</h3>
            <p class="amount income">¥{{ filteredTotalIncome.toFixed(2) }}</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon expense">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="summary-content">
            <h3>总支出</h3>
            <p class="amount expense">¥{{ filteredTotalExpense.toFixed(2) }}</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon balance">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="summary-content">
            <h3>账户余额</h3>
            <p 
              class="amount" 
              :class="{ expense: filteredBalance < 0, income: filteredBalance >= 0 }"
            >
              ¥{{ filteredBalance.toFixed(2) }}
            </p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon investment">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="summary-content">
            <h3>投资总额</h3>
            <p class="amount investment">¥{{ investmentTotal.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 交易列表 -->
    <div class="transactions-section">
      <div class="section-header">
        <h2 class="section-title">交易记录</h2>
        <el-button 
          type="primary" 
          @click="$emit('add-transaction')"
          round
        >
          添加交易
        </el-button>
      </div>
      
      <div class="transactions-content">
        <TransactionList 
          :transactions="filteredSortedTransactions" 
          @delete-transaction="$emit('delete-transaction', $event)"
          @edit-transaction="$emit('edit-transaction', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ElButton, ElSelect, ElOption, ElCheckbox, ElIcon } from 'element-plus';
import { TrendCharts, Coin, Wallet } from '@element-plus/icons-vue';
import TransactionList from './TransactionList.vue';

export default {
  name: 'TransactionsView',
  components: {
    ElButton,
    ElSelect,
    ElOption,
    ElCheckbox,
    ElIcon,
    TrendCharts,
    Coin,
    Wallet,
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
.transactions-view {
  padding: 20px 0;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-section {
  margin-bottom: 30px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.summary-icon.income {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.summary-icon.expense {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.summary-icon.balance {
  background: rgba(102, 184, 255, 0.1);
  color: #409eff;
}

.summary-icon.investment {
  background: rgba(142, 84, 228, 0.1);
  color: #8e54e4;
}

.summary-content h3 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.amount {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.amount.income {
  color: #f56c6c;
}

.amount.expense {
  color: #67c23a;
}

.amount.investment {
  color: #8e54e4;
}

.transactions-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.transactions-content {
  /* 交易列表内容 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .transactions-view {
    padding: 15px 0;
  }
  
  .summary-header,
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .date-filter {
    width: 100%;
    justify-content: space-between;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .summary-cards {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .summary-card {
    padding: 15px;
  }
  
  .summary-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin-right: 10px;
  }
  
  .amount {
    font-size: 1.2rem;
  }
  
  .transactions-section {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .date-filter {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>