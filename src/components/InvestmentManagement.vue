<template>
  <div class="investment-management">
    <h2>投资管理与建议</h2>
    
    <!-- 投资概览 -->
    <InvestmentSummary 
      :total-cost="totalInvestmentCost" 
      :total-value="totalInvestmentValue" 
      :total-profit="totalInvestmentProfit"
    />
    
    <!-- 添加/编辑投资表单（仅在需要时显示）-->
    <el-card v-if="showInvestmentForm" class="add-investment">
      <template #header>
        <div class="card-header">
          <span>{{ isEditingInvestment ? '编辑投资' : '添加投资' }}</span>
          <el-button @click="cancelEdit" type="info" size="small">取消</el-button>
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
            @click="addInvestment"
          >
            {{ isEditingInvestment ? '更新投资' : '添加投资' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </el-form>
    </el-card>
    
    <!-- 投资列表 -->
    <InvestmentList 
      :investments="investments"
      @delete-investment="deleteInvestment"
      @edit-investment="editInvestment"
      @add-investment="showAddInvestmentForm"
    />
    
    <!-- 投资建议 -->
    <InvestmentAdvice 
      :balance="availableBalance"
      :transactions="transactions"
      @allocation-change="handleAllocationChange"
    />
  </div>
</template>

<script>
import { ElCard, ElForm, ElFormItem, ElRow, ElCol, ElSelect, ElOption, 
         ElInput, ElInputNumber, ElDatePicker, ElButton } from 'element-plus';
import InvestmentSummary from './InvestmentSummary.vue';
import InvestmentList from './InvestmentList.vue';
import InvestmentAdvice from './InvestmentAdvice.vue';

export default {
  name: 'InvestmentManagement',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElRow,
    ElCol,
    ElSelect,
    ElOption,
    ElInput,
    ElInputNumber,
    ElDatePicker,
    ElButton,
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
  data() {
    return {
      isEditingInvestment: false,
      editingInvestmentId: null,
      showInvestmentForm: false, // 控制是否显示投资表单
      newInvestment: {
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: 0,
        purchaseDate: new Date().toISOString().substr(0, 10)
      }
    };
  },
  computed: {
    totalInvestmentCost() {
      return this.investments.reduce((sum, investment) => {
        return sum + (investment.purchasePrice * investment.quantity);
      }, 0);
    },
    totalInvestmentValue() {
      return this.investments.reduce((sum, investment) => {
        const price = investment.currentPrice || investment.purchasePrice;
        return sum + (price * investment.quantity);
      }, 0);
    },
    totalInvestmentProfit() {
      return this.investments.reduce((sum, investment) => {
        const price = investment.currentPrice || investment.purchasePrice;
        return sum + ((price - investment.purchasePrice) * investment.quantity);
      }, 0);
    },
    availableBalance() {
      // 可用于投资的资金 = 总余额 - 已投资金额
      const investedAmount = this.investments.reduce((sum, investment) => {
        return sum + (investment.purchasePrice * investment.quantity);
      }, 0);
      return this.balance - investedAmount;
    }
  },
  methods: {
    showAddInvestmentForm() {
      // 重置表单状态
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
      this.showInvestmentForm = true;
    },
    addInvestment() {
      if (!this.newInvestment.name.trim() || this.newInvestment.quantity <= 0 || this.newInvestment.purchasePrice <= 0) {
        this.$message({
          message: '请填写有效的投资信息',
          type: 'warning'
        });
        return;
      }

      if (this.isEditingInvestment) {
        // 更新现有投资
        this.$emit('update-investment', this.editingInvestmentId, this.newInvestment);
        this.cancelEdit();
      } else {
        // 添加新投资
        this.$emit('add-investment', this.newInvestment);
        
        this.$message({
          message: '投资添加成功',
          type: 'success'
        });
      }
      
      // 隐藏表单
      this.showInvestmentForm = false;
    },
    
    deleteInvestment(id) {
      this.$emit('delete-investment', id);
    },
    
    editInvestment(investment) {
      this.isEditingInvestment = true;
      this.editingInvestmentId = investment.id;
      this.newInvestment = { ...investment };
      this.showInvestmentForm = true;
    },
    
    cancelEdit() {
      this.isEditingInvestment = false;
      this.editingInvestmentId = null;
      this.showInvestmentForm = false;
      this.$emit('cancel-edit');
    },
    
    resetForm() {
      if (this.isEditingInvestment) {
        // 如果是编辑状态，重置为原始数据
        const investment = this.investments.find(i => i.id === this.editingInvestmentId);
        if (investment) {
          this.newInvestment = { ...investment };
        }
      } else {
        // 如果是新增状态，重置为空表单
        this.newInvestment = {
          type: '股票',
          name: '',
          quantity: 0,
          purchasePrice: 0,
          currentPrice: 0,
          purchaseDate: new Date().toISOString().substr(0, 10)
        };
      }
    },
    
    handleAllocationChange(allocation) {
      // 可以在这里处理投资分配建议的变化
      console.log('投资分配建议:', allocation);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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