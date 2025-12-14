<template>
  <el-card class="investment-summary">
    <template #header>
      <div class="card-header">
        <span>投资概览</span>
      </div>
    </template>
    
    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <div class="summary-item">
          <h4>总投资成本</h4>
          <p class="amount">¥{{ totalCost.toFixed(2) }}</p>
        </div>
      </el-col>
      
      <el-col :span="8" :xs="24">
        <div class="summary-item">
          <h4>当前总价值</h4>
          <p class="amount">¥{{ totalValue.toFixed(2) }}</p>
        </div>
      </el-col>
      
      <el-col :span="8" :xs="24">
        <div class="summary-item">
          <h4>总收益</h4>
          <p 
            class="amount" 
            :class="{ profit: totalProfit >= 0, loss: totalProfit < 0 }"
          >
            {{ totalProfit >= 0 ? '+' : '' }}¥{{ totalProfit.toFixed(2) }}
            <span class="percentage">
              ({{ totalProfitPercent.toFixed(2) }}%)
            </span>
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
  },
  computed: {
    totalProfitPercent() {
      if (this.totalCost === 0) return 0;
      return (this.totalProfit / this.totalCost) * 100;
    }
  }
};
</script>

<style scoped>
.investment-summary {
  margin-bottom: 30px;
}

.card-header {
  font-weight: bold;
  font-size: 1.1rem;
}

.summary-item {
  text-align: center;
  padding: 20px 0;
}

.summary-item h4 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 1rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.profit {
  color: #4caf50;
}

.loss {
  color: #f44336;
}

.percentage {
  font-size: 1rem;
  font-weight: normal;
}
</style>