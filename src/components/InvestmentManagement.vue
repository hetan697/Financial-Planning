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
    <el-card class="add-investment">
      <template #header>
        <div class="card-header">
          <span>{{ isEditingInvestment ? '编辑投资' : '添加投资' }}</span>
        </div>
      </template>
      
      <el-form 
        :model="newInvestment" 
        label-position="top"
        @submit.prevent="addInvestment"
      >
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="投资类型:">
              <el-select 
                v-model="newInvestment.type" 
                placeholder="请选择投资类型"
                style="width: 100%"
              >
                <el-option label="股票" value="股票"></el-option>
                <el-option label="基金" value="基金"></el-option>
                <el-option label="债券" value="债券"></el-option>
                <el-option label="银行理财" value="银行理财"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12" :xs="24">
            <el-form-item label="名称:">
              <el-input 
                v-model="newInvestment.name" 
                placeholder="请输入投资名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8" :xs="24">
            <el-form-item label="数量:">
              <el-input-number 
                v-model="newInvestment.quantity" 
                :min="0"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8" :xs="24">
            <el-form-item label="买入价:">
              <el-input-number 
                v-model="newInvestment.purchasePrice" 
                :min="0"
                :step="0.01"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8" :xs="24">
            <el-form-item label="当前价 (可选):">
              <el-input-number 
                v-model="newInvestment.currentPrice" 
                :min="0"
                :step="0.01"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="买入日期:">
          <el-date-picker
            v-model="newInvestment.purchaseDate"
            type="date"
            placeholder="请选择买入日期"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <div class="form-buttons">
          <el-button 
            type="primary" 
            native-type="submit" 
            style="flex: 1"
          >
            {{ isEditingInvestment ? '更新' : '添加' }}
          </el-button>
          <el-button 
            v-if="isEditingInvestment" 
            @click="cancelInvestmentEdit"
            style="flex: 1"
          >
            取消
          </el-button>
        </div>
      </el-form>
    </el-card>
    
    <!-- 投资列表 -->
    <el-card class="investments">
      <template #header>
        <div class="card-header">
          <span>投资组合</span>
        </div>
      </template>
      
      <div v-if="investments.length === 0">
        <el-empty description="暂无投资记录">
          <p class="help-text">点击上方"添加投资"区域录入您的第一条投资信息</p>
        </el-empty>
      </div>
      
      <div v-else>
        <el-table :data="investments" style="width: 100%">
          <el-table-column prop="name" label="名称" />
          
          <el-table-column prop="type" label="类型" width="100" />
          
          <el-table-column label="买入信息" width="200">
            <template #default="scope">
              <div>价格: ¥{{ scope.row.purchasePrice.toFixed(2) }}</div>
              <div>数量: {{ scope.row.quantity }}</div>
              <div>日期: {{ formatDate(scope.row.purchaseDate) }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="当前信息" width="150">
            <template #default="scope">
              <div v-if="scope.row.currentPrice">
                价格: ¥{{ scope.row.currentPrice.toFixed(2) }}
              </div>
              <div v-else>价格: 未设置</div>
              <div>总价值: ¥{{ currentValue(scope.row).toFixed(2) }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="盈亏" width="150">
            <template #default="scope">
              <div :class="profitClass(scope.row)">
                {{ profit(scope.row) >= 0 ? '+' : '' }}¥{{ profit(scope.row).toFixed(2) }}
              </div>
              <div :class="profitClass(scope.row)">
                ({{ profitPercent(scope.row).toFixed(2) }}%)
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button 
                size="small" 
                type="primary" 
                @click="editInvestment(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteInvestment(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 投资建议 -->
    <el-card class="investment-advice-section">
      <template #header>
        <div class="card-header">
          <span>投资建议</span>
        </div>
      </template>
      
      <InvestmentAdvice 
        :balance="balance" 
        :transactions="transactions"
        @allocation-change="handleAllocationChange"
      />
      
      <!-- 自定义投资分配 -->
      <div class="custom-allocation" v-if="Object.keys(customAllocation).length > 0">
        <h3>自定义投资计划</h3>
        <el-row :gutter="20">
          <el-col 
            v-for="(allocation, key) in customAllocation" 
            :key="key"
            :span="8"
            :xs="24"
          >
            <el-card class="allocation-card">
              <div class="allocation-header">
                <span class="allocation-name">{{ allocation.name }}</span>
              </div>
              <div class="allocation-control">
                <el-slider 
                  v-model="allocation.percentage" 
                  :min="0" 
                  :max="100"
                  show-input
                  @change="updateCustomAllocation(key, $event)"
                />
              </div>
              <div class="allocation-amount">
                金额: ¥{{ allocation.amount.toFixed(2) }}
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="allocation-summary">
          <h3>投资分配对比</h3>
          <el-table :data="allocationComparisonArray" style="width: 100%">
            <el-table-column prop="name" label="投资类型" />
            
            <el-table-column prop="suggestedPercentage" label="建议分配(%)" width="120" />
            
            <el-table-column prop="currentPercentage" label="当前分配(%)" width="120" />
            
            <el-table-column prop="suggestedAmount" label="建议金额" width="120">
              <template #default="scope">
                ¥{{ scope.row.suggestedAmount.toFixed(2) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="currentAmount" label="当前金额" width="120">
              <template #default="scope">
                ¥{{ scope.row.currentAmount.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { 
  ElCard, 
  ElForm, 
  ElFormItem, 
  ElSelect, 
  ElOption, 
  ElInput, 
  ElInputNumber, 
  ElDatePicker, 
  ElButton,
  ElRow,
  ElCol,
  ElTable,
  ElTableColumn,
  ElEmpty,
  ElSlider
} from 'element-plus';
import InvestmentSummary from './InvestmentSummary.vue';
import InvestmentAdvice from './InvestmentAdvice.vue';

export default {
  name: 'InvestmentManagement',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElInput,
    ElInputNumber,
    ElDatePicker,
    ElButton,
    ElRow,
    ElCol,
    ElTable,
    ElTableColumn,
    ElEmpty,
    ElSlider,
    InvestmentSummary,
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
    allocationComparisonArray() {
      const comparison = [];
      
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
          
          const existingItem = comparison.find(item => item.key === key);
          if (!existingItem) {
            comparison.push({
              key: key,
              name: investment.type,
              suggestedPercentage: suggestedAllocations[key] ? suggestedAllocations[key].percentage : 0,
              currentPercentage: currentPercentage,
              suggestedAmount: suggestedAllocations[key] ? suggestedAllocations[key].amount : 0,
              currentAmount: currentValue
            });
          } else {
            // 如果已经有同类型的，累加
            existingItem.currentPercentage += currentPercentage;
            existingItem.currentAmount += currentValue;
          }
        });
      }
      
      // 补全缺失的建议项
      Object.keys(suggestedAllocations).forEach(key => {
        const existingItem = comparison.find(item => item.key === key);
        if (!existingItem) {
          comparison.push({
            key: key,
            name: suggestedAllocations[key].name,
            suggestedPercentage: suggestedAllocations[key].percentage,
            currentPercentage: 0,
            suggestedAmount: suggestedAllocations[key].amount,
            currentAmount: 0
          });
        }
      });
      
      return comparison;
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    currentValue(investment) {
      const price = investment.currentPrice || investment.purchasePrice;
      return price * investment.quantity;
    },
    profit(investment) {
      return (investment.currentPrice - investment.purchasePrice) * investment.quantity || 0;
    },
    profitClass(investment) {
      return {
        'profit': this.profit(investment) >= 0,
        'loss': this.profit(investment) < 0
      };
    },
    profitPercent(investment) {
      if (!investment.currentPrice) return 0;
      return ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
    },
    addInvestment() {
      if (!this.newInvestment.name.trim() || this.newInvestment.quantity <= 0 || this.newInvestment.purchasePrice <= 0) {
        this.$message({
          message: '请填写有效的投资信息',
          type: 'warning'
        });
        return;
      }
      
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
      // 初始化自定义分配比例
      const initializedAllocation = {};
      Object.keys(allocation).forEach(key => {
        initializedAllocation[key] = {
          ...allocation[key],
          percentage: allocation[key].percentage
        };
      });
      this.customAllocation = initializedAllocation;
    },
    updateCustomAllocation(key, percentage) {
      this.customAllocation[key].percentage = percentage;
      // 重新计算金额
      const totalInvestable = this.calculateInvestableFund();
      this.customAllocation[key].amount = totalInvestable * (percentage / 100);
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
  margin-bottom: 30px;
}

.investment-management h2 {
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.add-investment,
.investments,
.investment-advice-section {
  margin-bottom: 30px;
}

.card-header {
  font-weight: bold;
  font-size: 1.1rem;
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.profit {
  font-weight: bold;
}

.loss {
  font-weight: bold;
}

.custom-allocation h3 {
  margin-top: 30px;
  margin-bottom: 20px;
}

.allocation-card {
  margin-bottom: 20px;
}

.allocation-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: bold;
}

.allocation-name {
  font-size: 1.1rem;
}

.allocation-control {
  margin-bottom: 15px;
}

.allocation-amount {
  font-weight: bold;
}

.allocation-summary {
  margin-top: 30px;
}

.allocation-summary h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-buttons {
    flex-direction: column;
  }
}
</style>