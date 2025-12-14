<template>
  <div class="investment-management">
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
        :rules="investmentRules"
        ref="investmentForm"
        label-position="top"
        @submit.prevent="submitInvestment"
      >
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="投资类型:" prop="type">
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
            <el-form-item label="名称:" prop="name">
              <el-input 
                v-model="newInvestment.name" 
                placeholder="请输入投资名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8" :xs="24">
            <el-form-item label="数量:" prop="quantity">
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
            <el-form-item label="买入价:" prop="purchasePrice">
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
            <el-form-item label="当前价 (可选):" prop="currentPrice">
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
        
        <el-form-item label="买入日期:" prop="purchaseDate">
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
            {{ isEditingInvestment ? '更新投资' : '添加投资' }}
          </el-button>
        </div>
      </el-form>
    </el-card>
    
    <!-- 投资列表 -->
    <InvestmentList 
      :investments="investments"
      @edit-investment="editInvestment"
      @delete-investment="requestDeleteInvestment"
    />
    
    <!-- 投资建议 -->
    <InvestmentAdvice 
      :balance="balance"
      :transactions="transactions"
      :investments="investments"
    />
  </div>
</template>

<script>
import { ElCard, ElForm, ElFormItem, ElSelect, ElOption, ElInput, 
         ElInputNumber, ElButton, ElRow, ElCol, ElDatePicker, ElMessage, ElMessageBox } from 'element-plus';
import InvestmentSummary from './InvestmentSummary.vue';
import InvestmentList from './InvestmentList.vue';
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
    ElButton,
    ElRow,
    ElCol,
    ElDatePicker,
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
      showInvestmentForm: false,
      isEditingInvestment: false,
      newInvestment: this.getEmptyInvestment(),
      investmentRules: {
        type: [
          { required: true, message: '请选择投资类型', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入投资名称', trigger: 'blur' },
          { min: 1, max: 50, message: '投资名称长度在1-50个字符之间', trigger: 'blur' }
        ],
        quantity: [
          { required: true, message: '请输入数量', trigger: 'change' },
          { type: 'number', min: 0.001, message: '数量必须大于0', trigger: 'change' }
        ],
        purchasePrice: [
          { required: true, message: '请输入买入价', trigger: 'change' },
          { type: 'number', min: 0.01, message: '买入价必须大于0', trigger: 'change' }
        ],
        purchaseDate: [
          { required: true, message: '请选择买入日期', trigger: 'change' }
        ]
      }
    };
  },
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
    getEmptyInvestment() {
      return {
        id: Date.now(),
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: null,
        purchaseDate: new Date().toISOString().substr(0, 10)
      };
    },
    submitInvestment() {
      this.$refs.investmentForm.validate((valid) => {
        if (valid) {
          if (this.isEditingInvestment) {
            this.$emit('update-investment', this.newInvestment);
          } else {
            this.$emit('add-investment', this.newInvestment);
          }
          this.resetForm();
        } else {
          ElMessage({
            message: '请填写所有必填字段并确保输入有效',
            type: 'warning'
          });
          return false;
        }
      });
    },
    resetForm() {
      this.showInvestmentForm = false;
      this.isEditingInvestment = false;
      this.newInvestment = this.getEmptyInvestment();
      if (this.$refs.investmentForm) {
        this.$refs.investmentForm.resetFields();
      }
    },
    editInvestment(investment) {
      this.newInvestment = { ...investment };
      this.isEditingInvestment = true;
      this.showInvestmentForm = true;
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
    cancelEdit() {
      this.resetForm();
    }
  },
  watch: {
    showInvestmentForm(val) {
      if (!val) {
        this.$nextTick(() => {
          if (this.$refs.investmentForm) {
            this.$refs.investmentForm.clearValidate();
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.investment-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.add-investment {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .form-buttons {
    flex-direction: column;
  }
}
</style>