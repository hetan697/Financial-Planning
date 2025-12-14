<template>
  <el-card class="add-transaction">
    <template #header>
      <div class="card-header">
        <span>{{ isEditing ? '编辑交易' : '添加交易' }}</span>
      </div>
    </template>
    
    <el-form 
      :model="newTransaction" 
      label-position="top"
      @submit.prevent="addTransaction"
    >
      <el-row :gutter="20">
        <el-col :span="12" :xs="24">
          <el-form-item label="类型:">
            <el-select 
              v-model="newTransaction.type" 
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
              v-model="newTransaction.date"
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
          v-model="newTransaction.description" 
          placeholder="请选择明细"
          style="width: 100%"
        >
          <el-option-group label="收入">
            <el-option 
              v-for="item in transactionTypes.income" 
              :key="item" 
              :label="item" 
              :value="item"
            />
          </el-option-group>
          <el-option-group label="支出">
            <el-option 
              v-for="item in transactionTypes.expense" 
              :key="item" 
              :label="item" 
              :value="item"
            />
          </el-option-group>
        </el-select>
      </el-form-item>
      
      <el-form-item label="备注 (可选):">
        <el-input 
          v-model="newTransaction.notes" 
          placeholder="请输入备注信息"
        />
      </el-form-item>
      
      <el-form-item label="金额:">
        <el-input-number 
          v-model="newTransaction.amount" 
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
          @click="cancelEdit"
          style="flex: 1"
        >
          取消
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script>
import { 
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
  ElCol
} from 'element-plus';
import TypeManager from '../../utils/TypeManager.js';

export default {
  name: 'TransactionForm',
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
    ElCol
  },
  props: {
    newTransaction: {
      type: Object,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-transaction', 'update-transaction', 'cancel-edit'],
  data() {
    return {
      transactionTypes: TypeManager.getTransactionTypes()
    };
  },
  methods: {
    addTransaction() {
      if (!this.newTransaction.description || this.newTransaction.amount <= 0) {
        this.$message({
          message: '请选择有效的明细和金额',
          type: 'warning'
        });
        return;
      }
      
      this.$emit('add-transaction');
    },
    updateTransaction(field, value) {
      this.$emit('update-transaction', field, value);
    },
    cancelEdit() {
      this.$emit('cancel-edit');
    }
  },
  mounted() {
    // 监听localStorage变化以更新交易类型
    window.addEventListener('storage', (e) => {
      if (e.key === 'transactionTypes') {
        this.transactionTypes = TypeManager.getTransactionTypes();
      }
    });
  }
};
</script>

<style scoped>
.add-transaction {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .form-buttons {
    flex-direction: column;
  }
}
</style>