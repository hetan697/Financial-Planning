<template>
  <div class="investment-page">
    <el-page-header @back="goBack" :content="isEditing ? '编辑投资' : '添加投资'" class="page-header" />
    
    <el-card class="investment-form-card">
      <el-form 
        :model="localInvestment" 
        :rules="rules"
        ref="investmentForm"
        label-position="top"
        @submit.prevent="saveInvestment"
      >
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="投资类型:" prop="type">
              <el-select 
                v-model="localInvestment.type" 
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
            <el-form-item label="买入日期:" prop="purchaseDate">
              <el-date-picker
                v-model="localInvestment.purchaseDate"
                type="date"
                placeholder="请选择买入日期"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="名称:" prop="name">
          <el-input 
            v-model="localInvestment.name" 
            placeholder="请输入投资名称"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8" :xs="24">
            <el-form-item label="数量:" prop="quantity">
              <el-input-number 
                v-model="localInvestment.quantity" 
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
                v-model="localInvestment.purchasePrice" 
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
                v-model="localInvestment.currentPrice" 
                :min="0"
                :step="0.01"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="form-buttons">
          <el-button 
            type="primary" 
            native-type="submit" 
            style="flex: 1"
          >
            {{ isEditing ? '更新' : '添加' }}
          </el-button>
          <el-button 
            @click="goBack"
            style="flex: 1"
          >
            取消
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ElCard, ElForm, ElFormItem, ElSelect, ElOption, 
         ElDatePicker, ElInput, ElInputNumber, ElButton, ElRow, ElCol, ElPageHeader, ElMessage } from 'element-plus';

export default {
  name: 'InvestmentPage',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElDatePicker,
    ElInput,
    ElInputNumber,
    ElButton,
    ElRow,
    ElCol,
    ElPageHeader
  },
  props: {
    investment: {
      type: Object,
      default: () => ({
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: null,
        purchaseDate: new Date().toISOString().substr(0, 10)
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel'],
  data() {
    return {
      localInvestment: { ...this.investment },
      rules: {
        type: [
          { required: true, message: '请选择投资类型', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入投资名称', trigger: 'blur' }
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
  methods: {
    saveInvestment() {
      this.$refs.investmentForm.validate((valid) => {
        if (valid) {
          this.$emit('save', this.localInvestment);
        } else {
          ElMessage({
            message: '请填写所有必填字段',
            type: 'warning'
          });
          return false;
        }
      });
    },
    goBack() {
      this.$emit('cancel');
    }
  },
  watch: {
    investment: {
      handler(newVal) {
        this.localInvestment = { ...newVal };
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.investment-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.investment-form-card {
  margin-bottom: 30px;
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .form-buttons {
    flex-direction: column;
  }
  
  .investment-page {
    padding: 10px;
  }
}
</style>