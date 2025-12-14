<template>
  <section class="summary">
    <div class="summary-card income">
      <h3>总收入</h3>
      <p>¥{{ totalIncome.toFixed(2) }}</p>
    </div>
    
    <div class="summary-card expense">
      <h3>总支出</h3>
      <p>¥{{ totalExpense.toFixed(2) }}</p>
    </div>
    
    <div class="summary-card balance" :class="{ negative: balance < 0 }">
      <h3>{{ adviceMode ? '可用资金' : '余额' }}</h3>
      <p>¥{{ balance.toFixed(2) }}</p>
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
    adviceMode: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
/* 概览卡片 */
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-card h3 {
  font-size: 1rem;
  margin-bottom: 10px;
  color: #666;
}

.summary-card p {
  font-size: 1.5rem;
  font-weight: bold;
}

.summary-card.income p {
  color: #4caf50;
}

.summary-card.expense p {
  color: #f44336;
}

.summary-card.balance p,
.summary-card.profit p {
  color: #2196f3;
}

.summary-card.balance.negative p,
.summary-card.loss p {
  color: #f44336;
}
</style>