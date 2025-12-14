<template>
  <div class="investment-management">
    <!-- 投资概览 -->
    <div class="summary-section">
      <h2 class="section-title">投资概览</h2>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon cost">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="summary-content">
            <h3>总投资成本</h3>
            <p class="amount">¥{{ totalInvestmentCost.toFixed(2) }}</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon value">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="summary-content">
            <h3>当前总价值</h3>
            <p class="amount" :class="{ positive: totalInvestmentValue >= totalInvestmentCost, negative: totalInvestmentValue < totalInvestmentCost }">
              ¥{{ totalInvestmentValue.toFixed(2) }}
            </p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon profit">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="summary-content">
            <h3>总收益</h3>
            <p class="amount" :class="{ positive: totalInvestmentProfit >= 0, negative: totalInvestmentProfit < 0 }">
              ¥{{ totalInvestmentProfit.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 投资列表 -->
    <div class="investments-section">
      <div class="section-header">
        <h2 class="section-title">投资项目</h2>
        <el-button 
          type="primary" 
          @click="showAddInvestmentForm"
          round
        >
          添加投资
        </el-button>
      </div>
      
      <div class="investments-content">
        <InvestmentList 
          :investments="investments"
          @edit-investment="editInvestment"
          @delete-investment="requestDeleteInvestment"
        />
      </div>
    </div>
    
    <!-- 投资建议 -->
    <div class="advice-section">
      <InvestmentAdvice 
        :balance="balance"
        :transactions="transactions"
        :investments="investments"
      />
    </div>
  </div>
</template>

<script>
import { ElButton, ElIcon } from 'element-plus';
import { Wallet, Coin, TrendCharts } from '@element-plus/icons-vue';
import InvestmentList from './InvestmentList.vue';
import InvestmentAdvice from './InvestmentAdvice.vue';
import InvestmentSummary from './InvestmentSummary.vue';

export default {
  name: 'InvestmentManagement',
  components: {
    ElButton,
    ElIcon,
    Wallet,
    Coin,
    TrendCharts,
    InvestmentList,
    InvestmentAdvice,
    InvestmentSummary
  },
  props: {
    investments: {
      type: Array,
      required: true
    },
    balance: {
      type: Number,
      required: true
    },
    transactions: {
      type: Array,
      required: true
    }
  },
  emits: ['add-investment', 'update-investment', 'delete-investment', 'edit-investment', 'cancel-edit'],
  data() {
    return {
      isEditing: false,
      currentInvestment: null
    };
  },
  computed: {
    totalInvestmentCost() {
      return this.investments.reduce((sum, investment) => {
        return sum + (investment.quantity * investment.purchasePrice);
      }, 0);
    },
    totalInvestmentValue() {
      return this.investments.reduce((sum, investment) => {
        const currentValue = investment.currentPrice !== null ? 
          investment.currentPrice : investment.purchasePrice;
        return sum + (investment.quantity * currentValue);
      }, 0);
    },
    totalInvestmentProfit() {
      return this.totalInvestmentValue - this.totalInvestmentCost;
    }
  },
  methods: {
    showAddInvestmentForm() {
      this.$emit('add-investment');
    },
    editInvestment(investment) {
      this.$emit('edit-investment', investment);
    },
    requestDeleteInvestment(id) {
      this.$emit('delete-investment', id);
    }
  }
};
</script>

<style scoped>
.investment-management {
  padding: 20px 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
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

.summary-icon.cost {
  background: rgba(102, 184, 255, 0.1);
  color: #409eff;
}

.summary-icon.value {
  background: rgba(142, 84, 228, 0.1);
  color: #8e54e4;
}

.summary-icon.profit {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
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

.amount.positive {
  color: #f56c6c;
}

.amount.negative {
  color: #67c23a;
}

.investments-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.advice-section {
  /* 投资建议内容 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .investment-management {
    padding: 15px 0;
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
  
  .investments-section {
    padding: 15px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>