<template>
  <div class="investment-management">
    <!-- 投资概览 -->
    <InvestmentSummary 
      :total-cost="totalInvestmentCost" 
      :total-value="totalInvestmentValue" 
      :total-profit="totalInvestmentProfit"
    />
    
    <!-- 投资列表 -->
    <el-card class="investment-list-card">
      <template #header>
        <div class="card-header">
          <span>投资项目</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="showAddInvestmentForm"
          >
            添加投资
          </el-button>
        </div>
      </template>
      
      <InvestmentList 
        :investments="investments"
        @edit-investment="editInvestment"
        @delete-investment="requestDeleteInvestment"
      />
    </el-card>
    
    <!-- 投资建议 -->
    <InvestmentAdvice 
      :balance="balance"
      :transactions="transactions"
      :investments="investments"
    />
  </div>
</template>

<script>
import { ElMessageBox, ElMessage } from 'element-plus';
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
    editInvestment(investment) {
      this.$emit('edit-investment', investment);
    },
    requestDeleteInvestment(id) {
      ElMessageBox.confirm('此操作将永久删除该投资记录，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete-investment', id);
        ElMessage.success('删除成功');
      }).catch(() => {
        // 用户取消操作
        ElMessage.info('已取消删除');
      });
    },
    showAddInvestmentForm() {
      this.$emit('add-investment');
    }
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.investment-list-card {
  margin-bottom: 20px;
}

.investment-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .investment-management {
    padding: 10px;
  }
}
</style>