<template>
  <el-card class="investment-summary">
    <template #header>
      <div class="card-header">
        <span>投资概览</span>
      </div>
    </template>
    
    <el-row :gutter="15">
      <el-col :span="8" :xs="24">
        <div class="summary-item">
          <h4>总投资成本</h4>
          <p class="amount">¥{{ totalCost.toFixed(2) }}</p>
        </div>
      </el-col>
      
      <el-col :span="8" :xs="24">
        <div class="summary-item">
          <h4>当前总价值</h4>
          <p class="amount" :class="{ positive: totalValue >= totalCost, negative: totalValue < totalCost }">
            ¥{{ totalValue.toFixed(2) }}
          </p>
        </div>
      </el-col>
      
      <el-col :span="8" :xs="24">
        <div class="summary-item">
          <h4>总收益</h4>
          <p class="amount" :class="{ positive: totalProfit >= 0, negative: totalProfit < 0 }">
            ¥{{ totalProfit.toFixed(2) }}
          </p>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { ElCard, ElRow, ElCol } from 'element-plus';

export default {
  name: 'InvestmentSummary',
  components: {
    ElCard,
    ElRow,
    ElCol
  },
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
.card-header {
  font-weight: bold;
}

.summary-item {
  text-align: center;
  padding: 10px 0;
}

.summary-item h4 {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
  color: #666;
}

.amount {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.positive {
  color: #f56c6c;
}

.negative {
  color: #67c23a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .summary-item {
    margin-bottom: 10px;
  }
}
</style>