<template>
  <div class="investment-management">
    <!-- 投资概览 -->
    <InvestmentSummary 
      :total-cost="totalInvestmentCost" 
      :total-value="totalInvestmentValue" 
      :total-profit="totalInvestmentProfit"
    />
    
    <!-- 投资列表 -->
    <div class="card-section">
      <div class="card-header">
        <span class="card-title">投资项目</span>
        <button 
          class="btn-primary"
          @click="showAddInvestmentForm"
        >
          添加投资
        </button>
      </div>
      
      <InvestmentList 
        :investments="investments"
        @edit-investment="editInvestment"
        @delete-investment="requestDeleteInvestment"
      />
    </div>
    
    <!-- 投资建议 -->
    <InvestmentAdvice 
      :balance="balance"
      :transactions="transactions"
      :investments="investments"
    />
  </div>
</template>

<script>
import InvestmentSummary from './InvestmentSummary.vue';
import InvestmentList from './InvestmentList.vue';
import InvestmentAdvice from './InvestmentAdvice.vue';

export default {
  name: 'InvestmentManagement',
  components: {
    InvestmentSummary,
    InvestmentList,
    InvestmentAdvice
  },
  props: {
    investments: {
      type: Array,
      default: () => []
    },
    balance: {
      type: Number,
      default: 0
    },
    transactions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['add-investment', 'update-investment', 'delete-investment', 'edit-investment', 'cancel-edit'],
  computed: {
    totalInvestmentCost() {
      return this.investments.reduce((sum, investment) => 
        sum + (investment.quantity * investment.purchasePrice), 0);
    },
    totalInvestmentValue() {
      return this.investments.reduce((sum, investment) => {
        const currentValue = investment.currentPrice !== null && investment.currentPrice !== undefined ? 
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
      if (confirm('此操作将永久删除该投资记录，是否继续？')) {
        this.$emit('delete-investment', id);
        alert('删除成功');
      }
    }
  }
};
</script>

<style scoped>
.investment-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.card-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.btn-primary {
  padding: 10px 20px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #0062cc;
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .investment-management {
    gap: 15px;
  }
  
  .card-section {
    border-radius: 16px;
    padding: 15px;
  }
}
</style>