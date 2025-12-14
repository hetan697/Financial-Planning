<template>
  <div class="type-management">
    <el-tabs v-model="activeTab" type="card">
      <!-- 数据管理标签页 -->
      <el-tab-pane label="数据管理" name="data">
        <div class="management-section">
          <h2 class="section-title">数据管理</h2>
          <div class="data-management-content">
            <div class="management-card">
              <h3>数据操作</h3>
              <div class="data-management-actions">
                <el-button @click="exportData" type="primary" round>
                  <el-icon><Upload /></el-icon>
                  导出数据
                </el-button>
                <el-button @click="triggerImport" type="success" round>
                  <el-icon><Download /></el-icon>
                  导入数据
                </el-button>
                <el-button @click="clearData" type="danger" round>
                  <el-icon><Delete /></el-icon>
                  清除数据
                </el-button>
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept=".json" 
                  @change="importData" 
                  style="display: none;"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 类型管理标签页 -->
      <el-tab-pane label="类型管理" name="types">
        <div class="management-section">
          <h2 class="section-title">类型管理</h2>
          <div class="type-management-content">
            <!-- 投资类型管理 -->
            <div class="type-section">
              <h3>投资类型</h3>
              <draggable 
                v-model="localInvestmentTypes" 
                tag="div"
                class="type-list"
                handle=".drag-handle"
                item-key="index"
              >
                <template #item="{ element, index }">
                  <div class="type-item">
                    <div class="drag-handle">
                      <el-icon><Rank /></el-icon>
                    </div>
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
                </template>
              </draggable>
              <el-button @click="addInvestmentType" size="small" type="primary" round>
                添加投资类型
              </el-button>
            </div>
            
            <!-- 交易类型管理 -->
            <div class="type-section">
              <h3>交易类型</h3>
              
              <div class="transaction-types">
                <div class="transaction-type-group">
                  <h4>收入类型</h4>
                  <draggable 
                    v-model="localTransactionTypes.income" 
                    tag="div"
                    class="type-list"
                    handle=".drag-handle"
                    item-key="index"
                  >
                    <template #item="{ element, index }">
                      <div class="type-item">
                        <div class="drag-handle">
                          <el-icon><Rank /></el-icon>
                        </div>
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
                    </template>
                  </draggable>
                  <el-button @click="addTransactionType('income')" size="small" type="primary" round>
                    添加收入类型
                  </el-button>
                </div>
                
                <div class="transaction-type-group">
                  <h4>支出类型</h4>
                  <draggable 
                    v-model="localTransactionTypes.expense" 
                    tag="div"
                    class="type-list"
                    handle=".drag-handle"
                    item-key="index"
                  >
                    <template #item="{ element, index }">
                      <div class="type-item">
                        <div class="drag-handle">
                          <el-icon><Rank /></el-icon>
                        </div>
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
                    </template>
                  </draggable>
                  <el-button @click="addTransactionType('expense')" size="small" type="primary" round>
                    添加支出类型
                  </el-button>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <el-button @click="saveTypes" type="primary" round>保存类型设置</el-button>
              <el-button @click="resetTypes" round>重置为默认</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ElButton, ElInput, ElIcon, ElTabs, ElTabPane } from 'element-plus';
import { Upload, Download, Delete, Rank } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import TypeManager from '../utils/TypeManager.js';

export default {
  name: 'TypeManagement',
  components: {
    ElButton,
    ElInput,
    ElIcon,
    ElTabs,
    ElTabPane,
    Upload,
    Download,
    Delete,
    Rank,
    draggable
  },
  emits: ['export-data', 'import-data', 'clear-data'],
  data() {
    return {
      activeTab: 'data',
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
        // 验证数据有效性
        const validInvestmentTypes = this.localInvestmentTypes.filter(type => type.trim() !== '');
        const validIncomeTypes = this.localTransactionTypes.income.filter(type => type.trim() !== '');
        const validExpenseTypes = this.localTransactionTypes.expense.filter(type => type.trim() !== '');
        
        if (validInvestmentTypes.length === 0) {
          this.$message.error('至少需要保留一种投资类型');
          return;
        }
        
        if (validIncomeTypes.length === 0) {
          this.$message.error('至少需要保留一种收入类型');
          return;
        }
        
        if (validExpenseTypes.length === 0) {
          this.$message.error('至少需要保留一种支出类型');
          return;
        }
        
        // 更新本地数据
        this.localInvestmentTypes = validInvestmentTypes;
        this.localTransactionTypes.income = validIncomeTypes;
        this.localTransactionTypes.expense = validExpenseTypes;
        
        // 保存到TypeManager
        TypeManager.setInvestmentTypes(this.localInvestmentTypes);
        TypeManager.setTransactionTypes(this.localTransactionTypes);
        
        // 触发自定义事件通知其他组件类型已更新
        window.dispatchEvent(new CustomEvent('typesUpdated'));
        
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
    },
    
    exportData() {
      this.$emit('export-data');
    },
    
    triggerImport() {
      this.$refs.fileInput.click();
    },
    
    importData(event) {
      this.$emit('import-data', event);
    },
    
    clearData() {
      this.$emit('clear-data');
    }
  },
  // 监听typesUpdated事件，确保组件间同步
  mounted() {
    const handleTypesUpdated = () => {
      this.localInvestmentTypes = [...TypeManager.getInvestmentTypes()];
      this.localTransactionTypes = JSON.parse(JSON.stringify(TypeManager.getTransactionTypes()));
    };
    
    window.addEventListener('typesUpdated', handleTypesUpdated);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('typesUpdated', handleTypesUpdated);
    });
  }
};
</script>

<style scoped>
.type-management {
  padding: 20px 0;
}

.management-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
}

.data-management-content,
.type-management-content {
  padding: 10px 0;
}

.management-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.management-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.2rem;
}

.data-management-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.data-management-actions .el-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.transaction-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.transaction-type-group h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #666;
  font-size: 1.1rem;
}

.type-section {
  margin-bottom: 30px;
}

.type-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.2rem;
}

.type-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.drag-handle {
  cursor: move;
  padding: 5px;
  background: #e8f4ff;
  border-radius: 4px;
}

.type-item :deep(.el-input) {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .type-management {
    padding: 15px 0;
  }
  
  .management-section {
    padding: 15px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .transaction-types {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .data-management-actions {
    flex-direction: column;
  }
}
</style>