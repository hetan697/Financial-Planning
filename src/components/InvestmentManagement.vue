<template>
  <div class="investment-management">
    <h2>投资管理与建议</h2>
    
    <!-- 投资概览 -->
    <InvestmentSummary 
      :total-cost="totalInvestmentCost" 
      :total-value="totalInvestmentValue" 
      :total-profit="totalInvestmentProfit"
    />
    
    <!-- 添加/编辑投资 -->
    <InvestmentForm 
      :new-investment="newInvestment" 
      :is-editing="isEditingInvestment"
      @add-investment="addInvestment"
      @update-investment="updateInvestment"
      @cancel-edit="cancelInvestmentEdit"
    />
    
    <!-- 投资列表 -->
    <InvestmentList 
      :investments="investments" 
      @delete-investment="deleteInvestment"
      @edit-investment="editInvestment"
    />
    
    <!-- 投资建议 -->
    <div class="investment-advice-section">
      <h3>投资建议</h3>
      <InvestmentAdvice 
        :balance="balance" 
        :transactions="transactions"
        @allocation-change="handleAllocationChange"
      />
      
      <!-- 自定义投资分配 -->
      <div class="custom-allocation" v-if="Object.keys(customAllocation).length > 0">
        <h4>自定义投资计划</h4>
        <div class="allocation-controls">
          <div 
            v-for="(allocation, key) in customAllocation" 
            :key="key"
            class="allocation-control"
          >
            <label>{{ allocation.name }} ({{ allocation.percentage }}%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              :value="allocation.percentage"
              @input="updateCustomAllocation(key, $event.target.value)"
            >
          </div>
        </div>
        
        <div class="allocation-summary">
          <h4>投资分配对比</h4>
          <div class="comparison-table">
            <div class="table-header">
              <div>投资类型</div>
              <div>建议分配</div>
              <div>当前分配</div>
              <div>建议金额</div>
              <div>当前金额</div>
            </div>
            <div 
              v-for="(item, key) in allocationComparison" 
              :key="key"
              class="table-row"
            >
              <div>{{ item.name }}</div>
              <div>{{ item.suggestedPercentage }}%</div>
              <div>{{ item.currentPercentage }}%</div>
              <div>¥{{ item.suggestedAmount.toFixed(2) }}</div>
              <div>¥{{ item.currentAmount.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InvestmentSummary from './InvestmentSummary.vue';
import InvestmentForm from './InvestmentForm.vue';
import InvestmentList from './InvestmentList.vue';
import InvestmentAdvice from './InvestmentAdvice.vue';

export default {
  name: 'InvestmentManagement',
  components: {
    InvestmentSummary,
    InvestmentForm,
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
  data() {
    return {
      isEditingInvestment: false,
      editingInvestmentId: null,
      newInvestment: {
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: 0,
        purchaseDate: new Date().toISOString().substr(0, 10)
      },
      customAllocation: {},
      currentAllocation: {}
    };
  },
  computed: {
    totalInvestmentValue() {
      return this.investments.reduce((sum, investment) => {
        const price = investment.currentPrice || investment.purchasePrice;
        return sum + (price * investment.quantity);
      }, 0);
    },
    totalInvestmentCost() {
      return this.investments.reduce((sum, investment) => {
        return sum + (investment.purchasePrice * investment.quantity);
      }, 0);
    },
    totalInvestmentProfit() {
      return this.totalInvestmentValue - this.totalInvestmentCost;
    },
    allocationComparison() {
      const comparison = {};
      
      // 获取建议分配比例
      const suggestedAllocations = this.customAllocation;
      
      // 计算当前分配比例
      const totalCurrentValue = this.totalInvestmentValue;
      if (totalCurrentValue > 0) {
        this.investments.forEach(investment => {
          const currentValue = (investment.currentPrice || investment.purchasePrice) * investment.quantity;
          const currentPercentage = (currentValue / totalCurrentValue) * 100;
          
          // 简化匹配逻辑 - 根据投资类型匹配建议类型
          let key;
          if (investment.type.includes('股票')) {
            key = 'aggressive';
          } else if (investment.type.includes('基金')) {
            key = 'moderate';
          } else {
            key = 'conservative';
          }
          
          if (!comparison[key]) {
            comparison[key] = {
              name: investment.type,
              suggestedPercentage: suggestedAllocations[key] ? suggestedAllocations[key].percentage : 0,
              currentPercentage: currentPercentage,
              suggestedAmount: suggestedAllocations[key] ? suggestedAllocations[key].amount : 0,
              currentAmount: currentValue
            };
          } else {
            // 如果已经有同类型的，累加
            comparison[key].currentPercentage += currentPercentage;
            comparison[key].currentAmount += currentValue;
          }
        });
      }
      
      // 补全缺失的建议项
      Object.keys(suggestedAllocations).forEach(key => {
        if (!comparison[key]) {
          comparison[key] = {
            name: suggestedAllocations[key].name,
            suggestedPercentage: suggestedAllocations[key].percentage,
            currentPercentage: 0,
            suggestedAmount: suggestedAllocations[key].amount,
            currentAmount: 0
          };
        }
      });
      
      return comparison;
    }
  },
  methods: {
    addInvestment() {
      this.$emit('add-investment');
    },
    updateInvestment(field, value) {
      this.newInvestment[field] = value;
    },
    deleteInvestment(id) {
      this.$emit('delete-investment', id);
    },
    editInvestment(investment) {
      this.isEditingInvestment = true;
      this.editingInvestmentId = investment.id;
      this.newInvestment = { ...investment };
      this.$emit('edit-investment', investment);
    },
    cancelInvestmentEdit() {
      this.isEditingInvestment = false;
      this.editingInvestmentId = null;
      this.newInvestment = {
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: 0,
        purchaseDate: new Date().toISOString().substr(0, 10)
      };
      this.$emit('cancel-edit');
    },
    handleAllocationChange(allocation) {
      this.customAllocation = allocation;
    },
    updateCustomAllocation(key, percentage) {
      this.customAllocation[key].percentage = parseInt(percentage);
      // 重新计算金额
      const totalInvestable = this.calculateInvestableFund();
      this.customAllocation[key].amount = totalInvestable * (parseInt(percentage) / 100);
    },
    calculateInvestableFund() {
      // 简化计算 - 实际应该根据紧急备用金计算
      return this.balance > 0 ? this.balance * 0.5 : 0;
    }
  }
};
</script>

<style scoped>
.investment-management {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.investment-management h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.investment-advice-section {
  margin-top: 30px;
}

.investment-advice-section h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.custom-allocation {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.custom-allocation h4 {
  margin-top: 0;
  color: #333;
}

.allocation-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.allocation-control {
  display: flex;
  flex-direction: column;
}

.allocation-control label {
  margin-bottom: 10px;
  font-weight: bold;
}

.allocation-control input[type="range"] {
  width: 100%;
}

.allocation-summary h4 {
  margin-top: 0;
  color: #333;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  font-weight: bold;
  background: #e9ecef;
  padding: 10px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 10px;
  border-bottom: 1px solid #dee2e6;
}

.table-row:last-child {
  border-bottom: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .table-header > div:nth-child(n+3),
  .table-row > div:nth-child(n+3) {
    display: none;
  }
}
</style>