<template>
  <div class="transaction-page">
    <el-page-header @back="goBack" :content="isEditing ? '编辑交易' : '添加交易'" class="page-header" />
    
    <el-card class="transaction-form-card">
      <el-form 
        :model="localTransaction" 
        label-position="top"
        @submit.prevent="saveTransaction"
      >
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="类型:">
              <el-select 
                v-model="localTransaction.type" 
                placeholder="请选择类型"
                style="width: 100%"
              >
                <el-option label="收入" value="income"></el-option>
                <el-option label="支出" value="expense"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12" :xs="24">
            <el-form-item label="日期:">
              <el-date-picker
                v-model="localTransaction.date"
                type="date"
                placeholder="请选择日期"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="明细:">
          <el-select 
            v-model="localTransaction.description" 
            placeholder="请选择明细"
            style="width: 100%"
          >
            <el-option-group label="收入">
              <el-option 
                v-for="item in incomeOptions" 
                :key="item" 
                :label="item" 
                :value="item"
              />
            </el-option-group>
            <el-option-group label="支出">
              <el-option 
                v-for="item in expenseOptions" 
                :key="item" 
                :label="item" 
                :value="item"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注 (可选):">
          <el-input 
            v-model="localTransaction.notes" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
        
        <el-form-item label="金额:">
          <el-input-number 
            v-model="localTransaction.amount" 
            :min="0"
            :step="0.01"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        
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
import { ElCard, ElForm, ElFormItem, ElSelect, ElOption, ElOptionGroup, 
         ElDatePicker, ElInput, ElInputNumber, ElButton, ElRow, ElCol, ElPageHeader } from 'element-plus';

export default {
  name: 'TransactionPage',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElOptionGroup,
    ElDatePicker,
    ElInput,
    ElInputNumber,
    ElButton,
    ElRow,
    ElCol,
    ElPageHeader
  },
  props: {
    transaction: {
      type: Object,
      default: () => ({
        type: 'income',
        description: '',
        notes: '',
        amount: 0,
        date: new Date().toISOString().substr(0, 10)
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
      localTransaction: { ...this.transaction },
      incomeOptions: [
        '工资',
        '奖金',
        '投资收益',
        '兼职收入',
        '礼金',
        '其他收入'
      ],
      expenseOptions: [
        '房租',
        '水电费',
        '餐饮',
        '交通',
        '购物',
        '娱乐',
        '医疗',
        '教育',
        '保险',
        '投资支出',
        '其他支出'
      ]
    };
  },
  methods: {
    saveTransaction() {
      if (!this.localTransaction.description || this.localTransaction.amount <= 0) {
        this.$message({
          message: '请选择有效的明细和金额',
          type: 'warning'
        });
        return;
      }
      
      this.$emit('save', this.localTransaction);
    },
    goBack() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.transaction-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.transaction-form-card {
  margin-bottom: 30px;
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .transaction-page {
    padding: 10px;
  }
  
  .form-buttons {
    flex-direction: column;
  }
}
</style>