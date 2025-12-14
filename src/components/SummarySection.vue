<template>
  <el-card class="summary-section" :class="{ 'advice-mode': adviceMode }">
    <el-row :gutter="20">
      <el-col :span="adviceMode ? 8 : 6" :xs="12">
        <div class="summary-item">
          <h3>总收入</h3>
          <p class="amount income">¥{{ totalIncome.toFixed(2) }}</p>
        </div>
      </el-col>
      
      <el-col :span="adviceMode ? 8 : 6" :xs="12">
        <div class="summary-item">
          <h3>总支出</h3>
          <p class="amount expense">¥{{ totalExpense.toFixed(2) }}</p>
        </div>
      </el-col>
      
      <el-col :span="adviceMode ? 8 : 6" :xs="12">
        <div class="summary-item">
          <h3>账户余额</h3>
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
          <h3>投资总额</h3>
          <p class="amount">¥0.00</p>
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

.summary-item {
  text-align: center;
  padding: 20px 0;
}

.summary-item h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 1rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.income {
  color: #4caf50;
}

.expense {
  color: #f44336;
}
</style>