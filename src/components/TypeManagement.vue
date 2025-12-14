<template>
  <div class="type-management">
    <h3>类型管理</h3>
    
    <!-- 投资类型管理 -->
    <div class="type-section">
      <h4>投资类型</h4>
      <div class="type-list">
        <div 
          v-for="(type, index) in localInvestmentTypes" 
          :key="index"
          class="type-item"
        >
          <el-input 
            v-model="localInvestmentTypes[index]" 
            size="small"
            @blur="validateInvestmentType(index)"
          />
          <el-button 
            @click="removeInvestmentType(index)" 
            size="small" 
            type="danger"
            circle
          >
            ×
          </el-button>
        </div>
      </div>
      <el-button @click="addInvestmentType" size="small" type="primary">
        添加投资类型
      </el-button>
    </div>
    
    <!-- 交易类型管理 -->
    <div class="type-section">
      <h4>交易类型</h4>
      
      <div class="transaction-types">
        <div class="transaction-type-group">
          <h5>收入类型</h5>
          <div class="type-list">
            <div 
              v-for="(type, index) in localTransactionTypes.income" 
              :key="index"
              class="type-item"
            >
              <el-input 
                v-model="localTransactionTypes.income[index]" 
                size="small"
                @blur="validateTransactionType('income', index)"
              />
              <el-button 
                @click="removeTransactionType('income', index)" 
                size="small" 
                type="danger"
                circle
              >
                ×
              </el-button>
            </div>
          </div>
          <el-button @click="addTransactionType('income')" size="small" type="primary">
            添加收入类型
          </el-button>
        </div>
        
        <div class="transaction-type-group">
          <h5>支出类型</h5>
          <div class="type-list">
            <div 
              v-for="(type, index) in localTransactionTypes.expense" 
              :key="index"
              class="type-item"
            >
              <el-input 
                v-model="localTransactionTypes.expense[index]" 
                size="small"
                @blur="validateTransactionType('expense', index)"
              />
              <el-button 
                @click="removeTransactionType('expense', index)" 
                size="small" 
                type="danger"
                circle
              >
                ×
              </el-button>
            </div>
          </div>
          <el-button @click="addTransactionType('expense')" size="small" type="primary">
            添加支出类型
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      <el-button @click="saveTypes" type="primary">保存类型设置</el-button>
      <el-button @click="resetTypes">重置为默认</el-button>
    </div>
  </div>
</template>

<script>
import { ElButton, ElInput } from 'element-plus';
import TypeManager from '../utils/TypeManager.js';

export default {
  name: 'TypeManagement',
  components: {
    ElButton,
    ElInput
  },
  data() {
    return {
      localInvestmentTypes: [...TypeManager.getInvestmentTypes()],
      localTransactionTypes: JSON.parse(JSON.stringify(TypeManager.getTransactionTypes()))
    };
  },
  methods: {
    addInvestmentType() {
      this.localInvestmentTypes.push('新投资类型');
    },
    
    removeInvestmentType(index) {
      if (this.localInvestmentTypes.length > 1) {
        this.localInvestmentTypes.splice(index, 1);
      } else {
        this.$message.warning('至少需要保留一种投资类型');
      }
    },
    
    validateInvestmentType(index) {
      const type = this.localInvestmentTypes[index].trim();
      if (!type) {
        this.$message.error('投资类型不能为空');
        this.localInvestmentTypes[index] = '新投资类型';
      }
    },
    
    addTransactionType(typeGroup) {
      this.localTransactionTypes[typeGroup].push(`新${typeGroup === 'income' ? '收入' : '支出'}类型`);
    },
    
    removeTransactionType(typeGroup, index) {
      if (this.localTransactionTypes[typeGroup].length > 1) {
        this.localTransactionTypes[typeGroup].splice(index, 1);
      } else {
        this.$message.warning(`至少需要保留一种${typeGroup === 'income' ? '收入' : '支出'}类型`);
      }
    },
    
    validateTransactionType(typeGroup, index) {
      const type = this.localTransactionTypes[typeGroup][index].trim();
      if (!type) {
        this.$message.error(`${typeGroup === 'income' ? '收入' : '支出'}类型不能为空`);
        this.localTransactionTypes[typeGroup][index] = `新${typeGroup === 'income' ? '收入' : '支出'}类型`;
      }
    },
    
    saveTypes() {
      try {
        TypeManager.setInvestmentTypes(this.localInvestmentTypes);
        TypeManager.setTransactionTypes(this.localTransactionTypes);
        
        // 触发localStorage变化事件，通知其他组件更新
        window.dispatchEvent(new Event('storage'));
        
        this.$message.success('类型设置保存成功');
      } catch (error) {
        console.error('保存类型设置失败:', error);
        this.$message.error('保存类型设置失败');
      }
    },
    
    resetTypes() {
      this.$confirm('确定要重置为默认类型吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.localInvestmentTypes = [...TypeManager.defaultInvestmentTypes];
        this.localTransactionTypes = JSON.parse(JSON.stringify(TypeManager.defaultTransactionTypes));
        this.saveTypes();
        this.$message.success('已重置为默认类型');
      }).catch(() => {
        // 用户取消操作
      });
    }
  }
};
</script>

<style scoped>
.type-management {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.type-management h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.type-section {
  margin-bottom: 30px;
}

.type-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.transaction-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.transaction-type-group h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #666;
}

.type-list {
  margin-bottom: 15px;
}

.type-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.type-item :deep(.el-input) {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .transaction-types {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>