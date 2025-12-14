<template>
  <section class="summary">
    <div class="summary-card">
      <h3>总投资成本</h3>
      <p>¥{{ totalCost.toFixed(2) }}</p>
    </div>
    
    <div class="summary-card">
      <h3>当前总价值</h3>
      <p>¥{{ totalValue.toFixed(2) }}</p>
    </div>
    
    <div class="summary-card" :class="{ profit: totalProfit >= 0, loss: totalProfit < 0 }">
      <h3>总盈亏</h3>
      <p>¥{{ totalProfit.toFixed(2) }}</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'InvestmentSummary',
  props: {
    totalCost: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    totalProfit: {
      type: Number,
      default: 0
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

.summary-card.profit p {
  color: #2196f3;
}

.summary-card.loss p {
  color: #f44336;
}
</style>