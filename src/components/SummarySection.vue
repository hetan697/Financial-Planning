<template>
  <section class="summary-section">
    <h2>财务概览</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <h3>总收入</h3>
        <p class="amount income">¥{{ totalIncome.toFixed(2) }}</p>
      </div>
      <div class="summary-item">
        <h3>总支出</h3>
        <p class="amount expense">¥{{ totalExpense.toFixed(2) }}</p>
      </div>
      <div class="summary-item">
        <h3>账户余额</h3>
        <p 
          class="amount" 
          :class="{ expense: balance < 0, income: balance >= 0 }"
        >
          ¥{{ balance.toFixed(2) }}
        </p>
      </div>
      <div class="summary-item">
        <h3>投资总额</h3>
        <p class="amount investment">¥{{ investmentTotal.toFixed(2) }}</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SummarySection',
  props: {
    totalIncome: {
      type: Number,
      default: 0
    },
    totalExpense: {
      type: Number,
      default: 0
    },
    balance: {
      type: Number,
      default: 0
    },
    investmentTotal: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
.summary-section {
  margin-bottom: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  border-radius: 4px;
  background-color: #f5f6f7;
}

.summary-item h3 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #666;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.income {
  color: #f56c6c;
}

.expense {
  color: #67c23a;
}

.investment {
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .summary-item {
    padding: 10px;
  }
  
  .amount {
    font-size: 1.2rem;
  }
}
</style>