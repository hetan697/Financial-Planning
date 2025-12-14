<template>
  <div class="type-management">
    <div class="tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'data' }"
        @click="activeTab = 'data'"
      >
        数据管理
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'types' }"
        @click="activeTab = 'types'"
      >
        类型管理
      </button>
    </div>

    <!-- 数据管理部分 -->
    <div v-show="activeTab === 'data'" class="tab-content">
      <div class="card-section">
        <div class="card-header">
          <span class="card-title">数据管理</span>
        </div>
        
        <div class="data-management-section">
          <h4>数据操作</h4>
          <div class="data-management-actions">
            <button class="btn-primary" @click="exportData">
              导出数据
            </button>
            <button class="btn-success" @click="triggerImport">
              导入数据
            </button>
            <button class="btn-danger" @click="clearData">
              清除数据
            </button>
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
    
    <!-- 类型管理部分 -->
    <div v-show="activeTab === 'types'" class="tab-content">
      <div class="card-section">
        <div class="card-header">
          <span class="card-title">类型管理</span>
        </div>
        
        <!-- 投资类型管理 -->
        <div class="type-section">
          <h4>投资类型</h4>
          <draggable 
            v-model="localInvestmentTypes" 
            tag="div"
            class="type-list"
            handle=".drag-handle"
            item-key="index"
            @end="saveInvestmentTypes"
          >
            <template #item="{ element, index }">
              <div class="type-item">
                <div class="drag-handle">⋮⋮</div>
                <input 
                  v-model="localInvestmentTypes[index]" 
                  class="type-input"
                  @blur="validateAndSaveInvestmentType(index)"
                  @keyup.enter="validateAndSaveInvestmentType(index)"
                />
                <button 
                  @click="removeAndSaveInvestmentType(index)" 
                  class="btn-icon btn-danger"
                >
                  ×
                </button>
              </div>
            </template>
          </draggable>
          <button @click="addAndSaveInvestmentType" class="btn-secondary">
            添加投资类型
          </button>
        </div>
        
        <!-- 交易类型管理 -->
        <div class="type-section">
          <h4>交易类型</h4>
          
          <div class="transaction-types">
            <div class="transaction-type-group">
              <h5>收入类型</h5>
              <draggable 
                v-model="localTransactionTypes.income" 
                tag="div"
                class="type-list"
                handle=".drag-handle"
                item-key="index"
                @end="saveTransactionTypes"
              >
                <template #item="{ element, index }">
                  <div class="type-item">
                    <div class="drag-handle">⋮⋮</div>
                    <input 
                      v-model="localTransactionTypes.income[index]" 
                      class="type-input"
                      @blur="validateAndSaveTransactionType('income', index)"
                      @keyup.enter="validateAndSaveTransactionType('income', index)"
                    />
                    <button 
                      @click="removeAndSaveTransactionType('income', index)" 
                      class="btn-icon btn-danger"
                    >
                      ×
                    </button>
                  </div>
                </template>
              </draggable>
              <button @click="addAndSaveTransactionType('income')" class="btn-secondary">
                添加收入类型
              </button>
            </div>
            
            <div class="transaction-type-group">
              <h5>支出类型</h5>
              <draggable 
                v-model="localTransactionTypes.expense" 
                tag="div"
                class="type-list"
                handle=".drag-handle"
                item-key="index"
                @end="saveTransactionTypes"
              >
                <template #item="{ element, index }">
                  <div class="type-item">
                    <div class="drag-handle">⋮⋮</div>
                    <input 
                      v-model="localTransactionTypes.expense[index]" 
                      class="type-input"
                      @blur="validateAndSaveTransactionType('expense', index)"
                      @keyup.enter="validateAndSaveTransactionType('expense', index)"
                    />
                    <button 
                      @click="removeAndSaveTransactionType('expense', index)" 
                      class="btn-icon btn-danger"
                    >
                      ×
                    </button>
                  </div>
                </template>
              </draggable>
              <button @click="addAndSaveTransactionType('expense')" class="btn-secondary">
                添加支出类型
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import TypeManager from '../utils/TypeManager.js';

export default {
  name: 'TypeManagement',
  components: {
    draggable
  },
  emits: ['export-data', 'import-data', 'clear-data'],
  data() {
    return {
      activeTab: 'data',
      localInvestmentTypes: [...TypeManager.getInvestmentTypes()],
      localTransactionTypes: {
        income: [...TypeManager.getTransactionTypes().income],
        expense: [...TypeManager.getTransactionTypes().expense]
      }
    };
  },
  methods: {
    triggerImport() {
      this.$refs.fileInput.click();
    },
    exportData() {
      this.$emit('export-data');
    },
    importData(event) {
      this.$emit('import-data', event);
    },
    clearData() {
      this.$emit('clear-data');
    },
    // 投资类型管理方法
    addAndSaveInvestmentType() {
      this.localInvestmentTypes.push('新投资类型');
      this.saveInvestmentTypes();
    },
    removeAndSaveInvestmentType(index) {
      if (this.localInvestmentTypes.length <= 1) {
        alert('至少需要保留一个投资类型');
        return;
      }
      this.localInvestmentTypes.splice(index, 1);
      this.saveInvestmentTypes();
    },
    validateAndSaveInvestmentType(index) {
      if (!this.localInvestmentTypes[index].trim()) {
        alert('类型名称不能为空');
        this.localInvestmentTypes[index] = '新投资类型';
      }
      this.saveInvestmentTypes();
    },
    saveInvestmentTypes() {
      TypeManager.setInvestmentTypes(this.localInvestmentTypes);
    },
    // 交易类型管理方法
    addAndSaveTransactionType(type) {
      this.localTransactionTypes[type].push('新类型');
      this.saveTransactionTypes();
    },
    removeAndSaveTransactionType(type, index) {
      if (this.localTransactionTypes[type].length <= 1) {
        alert('至少需要保留一个类型');
        return;
      }
      this.localTransactionTypes[type].splice(index, 1);
      this.saveTransactionTypes();
    },
    validateAndSaveTransactionType(type, index) {
      if (!this.localTransactionTypes[type][index].trim()) {
        alert('类型名称不能为空');
        this.localTransactionTypes[type][index] = '新类型';
      }
      this.saveTransactionTypes();
    },
    saveTransactionTypes() {
      TypeManager.setTransactionTypes(this.localTransactionTypes);
    }
  }
};
</script>

<style scoped>
.type-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab-button {
  padding: 12px 20px;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.tab-button.active {
  color: #007AFF;
  border-bottom: 3px solid #007AFF;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.card-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.data-management-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-primary, .btn-success, .btn-danger, .btn-secondary {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-primary:hover {
  background: #0062cc;
}

.btn-success {
  background: #34C759;
  color: white;
}

.btn-success:hover {
  background: #2da44e;
}

.btn-danger {
  background: #FF3B30;
  color: white;
}

.btn-danger:hover {
  background: #d73329;
}

.btn-secondary {
  background: #F2F2F7;
  color: #007AFF;
}

.btn-secondary:hover {
  background: #e0e0e6;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.type-section {
  margin-bottom: 30px;
}

.type-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.type-list {
  margin-bottom: 15px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 10px;
  background: #F2F2F7;
  border-radius: 10px;
}

.drag-handle {
  cursor: move;
  padding: 5px;
  font-size: 18px;
  color: #999;
}

.type-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
}

.transaction-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.transaction-type-group h5 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

@media (max-width: 768px) {
  .transaction-types {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .data-management-actions {
    flex-direction: column;
  }
}
</style>