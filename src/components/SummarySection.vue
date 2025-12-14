<template>
  <el-card class="summary-section" :class="{ 'advice-mode': adviceMode }">
    <template #header>
      <div class="card-header">
        <span>财务概览</span>
      </div>
    </template>
    
    <el-row :gutter="20">
      <el-col :span="adviceMode ? 8 : 6" :xs="12">
        <div class="summary-item">
          <h4>总收入</h4>
          <p class="amount income">¥{{ totalIncome.toFixed(2) }}</p>
        </div>
      </el-col>
      
      <el-col :span="adviceMode ? 8 : 6" :xs="12">
        <div class="summary-item">
          <h4>总支出</h4>
          <p class="amount expense">¥{{ totalExpense.toFixed(2) }}</p>
        </div>
      </el-col>
      
      <el-col :span="adviceMode ? 8 : 6" :xs="12">
        <div class="summary-item">
          <h4>账户余额</h4>
          <p 
            class="amount" 
            :class="{ expense: balance < 0, income: balance >= 0 }"
          >
            ¥{{ balance.toFixed(2) }}
          </p>
        </div>
      </el-col>
      
      <el-col v-if="!adviceMode" :span="6" :xs="12">
        <div class="summary-item">
          <h4>投资总额</h4>
          <p class="amount">¥{{ investmentTotal.toFixed(2) }}</p>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { ElCard, ElRow, ElCol } from 'element-plus';

export default {
  name: 'SummarySection',
  components: {
    ElCard,
    ElRow,
    ElCol
  },
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
    },
    adviceMode: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.summary-section {
  margin-bottom: 30px;
}

.summary-section.advice-mode {
  background-color: #e3f2fd;
  border-color: #2196f3;
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
  font-size: 1rem;
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
</style>