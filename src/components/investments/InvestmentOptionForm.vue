<template>
  <div class="investment-option-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEditing ? '编辑投资方式' : '添加投资方式' }}</span>
        </div>
      </template>
      
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="投资类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择投资类型" style="width: 100%;">
            <el-option 
              v-for="type in investmentTypes" 
              :key="type" 
              :label="type" 
              :value="type"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="投资方式名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入投资方式名称" />
        </el-form-item>
        
        <el-form-item label="预期年化收益率" prop="returnRate">
          <el-input-number 
            v-model="form.returnRate" 
            :min="0" 
            :max="100" 
            :step="0.1"
            controls-position="right"
            style="width: 100%;"
          /> %
        </el-form-item>
        
        <el-form-item label="分配比例" prop="percentage">
          <el-slider
            v-model="form.percentage"
            :min="0"
            :max="100"
            :step="1"
            show-input
          />
        </el-form-item>
        
        <div class="form-actions">
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ElCard, ElForm, ElFormItem, ElInput, ElInputNumber, ElSelect, ElOption, ElSlider, ElButton } from 'element-plus';
import TypeManager from '../../utils/TypeManager.js';

export default {
  name: 'InvestmentOptionForm',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElInput,
    ElInputNumber,
    ElSelect,
    ElOption,
    ElSlider,
    ElButton
  },
  props: {
    option: {
      type: Object,
      default: () => ({
        type: '',
        name: '',
        returnRate: 5.0,
        percentage: 0
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: { ...this.option },
      investmentTypes: TypeManager.getInvestmentTypes(),
      rules: {
        type: [
          { required: true, message: '请选择投资类型', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入投资方式名称', trigger: 'blur' }
        ],
        returnRate: [
          { required: true, message: '请输入预期年化收益率', trigger: 'blur' }
        ],
        percentage: [
          { required: true, message: '请设置分配比例', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    submitForm() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$emit('save', this.form);
        }
      });
    },
    
    cancel() {
      this.$emit('cancel');
    }
  },
  mounted() {
    // 监听localStorage变化以更新投资类型
    window.addEventListener('storage', (e) => {
      if (e.key === 'investmentTypes') {
        this.investmentTypes = TypeManager.getInvestmentTypes();
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('storage', () => {});
  }
};
</script>

<style scoped>
.investment-option-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .investment-option-form {
    padding: 15px;
  }
  
  :deep(.el-form-item__label) {
    padding-bottom: 5px;
  }
}
</style>