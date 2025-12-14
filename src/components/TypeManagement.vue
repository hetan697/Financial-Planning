<template>
  <div class="type-management">
    <div class="card-section">
      <h3>类型管理</h3>
      
      <div class="type-section">
        <h4>投资类型</h4>
        <draggable 
          v-model="localInvestmentTypes" 
          tag="ul"
          class="type-list"
          handle=".drag-handle"
          @end="saveInvestmentTypes"
        >
          <li 
            v-for="(type, index) in localInvestmentTypes" 
            :key="index"
            class="type-item"
          >
            <div class="drag-handle">⋮⋮</div>
            <input 
              type="text" 
              :value="type"
              @input="updateInvestmentType(index, $event.target.value)"
              @blur="validateAndSaveInvestmentType(index)"
              @keyup.enter="validateAndSaveInvestmentType(index)"
              class="type-input"
            >
            <button 
              @click="removeInvestmentType(index)"
              class="remove-button"
            >
              ×
            </button>
          </li>
        </draggable>
        
        <div class="type-actions">
          <input 
            v-model="newInvestmentType" 
            placeholder="输入新类型名称"
            class="new-type-input"
            @keyup.enter="addInvestmentType"
          >
          <button 
            @click="addInvestmentType"
            class="btn-primary"
          >
            添加类型
          </button>
        </div>
      </div>
      
      <div class="type-section">
        <h4>交易类型</h4>
        
        <div class="transaction-types">
          <div class="type-subsection">
            <h5>收入类型</h5>
            <draggable 
              v-model="localTransactionTypes.income" 
              tag="ul"
              class="type-list"
              handle=".drag-handle"
              @end="saveTransactionTypes"
            >
              <li 
                v-for="(type, index) in localTransactionTypes.income" 
                :key="index"
                class="type-item"
              >
                <div class="drag-handle">⋮⋮</div>
                <input 
                  type="text" 
                  :value="type"
                  @input="updateIncomeType(index, $event.target.value)"
                  @blur="validateAndSaveIncomeType(index)"
                  @keyup.enter="validateAndSaveIncomeType(index)"
                  class="type-input"
                >
                <button 
                  @click="removeIncomeType(index)"
                  class="remove-button"
                >
                  ×
                </button>
              </li>
            </draggable>
            
            <div class="type-actions">
              <input 
                v-model="newIncomeType" 
                placeholder="输入新类型名称"
                class="new-type-input"
                @keyup.enter="addIncomeType"
              >
              <button 
                @click="addIncomeType"
                class="btn-primary"
              >
                添加类型
              </button>
            </div>
          </div>
          
          <div class="type-subsection">
            <h5>支出类型</h5>
            <draggable 
              v-model="localTransactionTypes.expense" 
              tag="ul"
              class="type-list"
              handle=".drag-handle"
              @end="saveTransactionTypes"
            >
              <li 
                v-for="(type, index) in localTransactionTypes.expense" 
                :key="index"
                class="type-item"
              >
                <div class="drag-handle">⋮⋮</div>
                <input 
                  type="text" 
                  :value="type"
                  @input="updateExpenseType(index, $event.target.value)"
                  @blur="validateAndSaveExpenseType(index)"
                  @keyup.enter="validateAndSaveExpenseType(index)"
                  class="type-input"
                >
                <button 
                  @click="removeExpenseType(index)"
                  class="remove-button"
                >
                  ×
                </button>
              </li>
            </draggable>
            
            <div class="type-actions">
              <input 
                v-model="newExpenseType" 
                placeholder="输入新类型名称"
                class="new-type-input"
                @keyup.enter="addExpenseType"
              >
              <button 
                @click="addExpenseType"
                class="btn-primary"
              >
                添加类型
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-section">
      <h3>数据管理</h3>
      
      <div class="data-actions">
        <div class="action-group">
          <button @click="exportData" class="btn-secondary">
            导出数据
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            @change="importData" 
            accept=".json"
            class="file-input"
          >
          <button @click="triggerFileInput" class="btn-secondary">
            导入数据
          </button>
        </div>
        
        <button @click="clearData" class="btn-danger">
          清空所有数据
        </button>
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
      localInvestmentTypes: [...TypeManager.getInvestmentTypes()],
      localTransactionTypes: JSON.parse(JSON.stringify(TypeManager.getTransactionTypes())),
      newInvestmentType: '',
      newIncomeType: '',
      newExpenseType: ''
    };
  },
  methods: {
    // Investment types methods
    updateInvestmentType(index, value) {
      this.localInvestmentTypes.splice(index, 1, value);
    },
    validateAndSaveInvestmentType(index) {
      const type = this.localInvestmentTypes[index];
      if (!type.trim()) {
        alert('类型名称不能为空');
        this.localInvestmentTypes.splice(index, 1);
        return;
      }
      this.saveInvestmentTypes();
    },
    addInvestmentType() {
      if (!this.newInvestmentType.trim()) {
        alert('请输入类型名称');
        return;
      }
      
      if (this.localInvestmentTypes.includes(this.newInvestmentType)) {
        alert('该类型已存在');
        return;
      }
      
      this.localInvestmentTypes.push(this.newInvestmentType);
      this.newInvestmentType = '';
      this.saveInvestmentTypes();
    },
    removeInvestmentType(index) {
      if (this.localInvestmentTypes.length <= 1) {
        alert('至少需要保留一个类型');
        return;
      }
      this.localInvestmentTypes.splice(index, 1);
      this.saveInvestmentTypes();
    },
    saveInvestmentTypes() {
      TypeManager.setInvestmentTypes(this.localInvestmentTypes);
    },
    
    // Income types methods
    updateIncomeType(index, value) {
      this.localTransactionTypes.income.splice(index, 1, value);
    },
    validateAndSaveIncomeType(index) {
      const type = this.localTransactionTypes.income[index];
      if (!type.trim()) {
        alert('类型名称不能为空');
        this.localTransactionTypes.income.splice(index, 1);
        return;
      }
      this.saveTransactionTypes();
    },
    addIncomeType() {
      if (!this.newIncomeType.trim()) {
        alert('请输入类型名称');
        return;
      }
      
      if (this.localTransactionTypes.income.includes(this.newIncomeType)) {
        alert('该类型已存在');
        return;
      }
      
      this.localTransactionTypes.income.push(this.newIncomeType);
      this.newIncomeType = '';
      this.saveTransactionTypes();
    },
    removeIncomeType(index) {
      if (this.localTransactionTypes.income.length <= 1) {
        alert('至少需要保留一个类型');
        return;
      }
      this.localTransactionTypes.income.splice(index, 1);
      this.saveTransactionTypes();
    },
    
    // Expense types methods
    updateExpenseType(index, value) {
      this.localTransactionTypes.expense.splice(index, 1, value);
    },
    validateAndSaveExpenseType(index) {
      const type = this.localTransactionTypes.expense[index];
      if (!type.trim()) {
        alert('类型名称不能为空');
        this.localTransactionTypes.expense.splice(index, 1);
        return;
      }
      this.saveTransactionTypes();
    },
    addExpenseType() {
      if (!this.newExpenseType.trim()) {
        alert('请输入类型名称');
        return;
      }
      
      if (this.localTransactionTypes.expense.includes(this.newExpenseType)) {
        alert('该类型已存在');
        return;
      }
      
      this.localTransactionTypes.expense.push(this.newExpenseType);
      this.newExpenseType = '';
      this.saveTransactionTypes();
    },
    removeExpenseType(index) {
      if (this.localTransactionTypes.expense.length <= 1) {
        alert('至少需要保留一个类型');
        return;
      }
      this.localTransactionTypes.expense.splice(index, 1);
      this.saveTransactionTypes();
    },
    saveTransactionTypes() {
      TypeManager.setTransactionTypes(this.localTransactionTypes);
    },
    
    // Data management methods
    exportData() {
      this.$emit('export-data');
    },
    importData(event) {
      this.$emit('import-data', event);
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    clearData() {
      if (confirm('此操作将永久删除所有数据，是否继续？')) {
        this.$emit('clear-data');
      }
    }
  },
  watch: {
    localInvestmentTypes: {
      handler() {
        // 实时保存投资类型更改
        this.saveInvestmentTypes();
      },
      deep: true
    },
    localTransactionTypes: {
      handler() {
        // 实时保存交易类型更改
        this.saveTransactionTypes();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.type-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.card-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.type-section {
  margin-bottom: 30px;
}

.type-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.type-subsection {
  margin-bottom: 25px;
}

.type-subsection h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.type-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: #F2F2F7;
  border-radius: 12px;
}

.drag-handle {
  cursor: move;
  padding: 5px;
  color: #999;
  font-size: 18px;
  line-height: 1;
}

.type-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.remove-button {
  width: 32px;
  height: 32px;
  background: #FF3B30;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.remove-button:hover {
  background: #d73329;
  transform: scale(1.05);
}

.type-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.new-type-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
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
  transform: scale(1.02);
}

.btn-secondary {
  background: #F2F2F7;
  color: #007AFF;
}

.btn-secondary:hover {
  background: #e0e0e6;
  transform: scale(1.02);
}

.btn-danger {
  background: #FF3B30;
  color: white;
  align-self: flex-start;
}

.btn-danger:hover {
  background: #d73329;
  transform: scale(1.02);
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.file-input {
  display: none;
}

.transaction-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .type-management {
    gap: 15px;
  }
  
  .card-section {
    border-radius: 16px;
    padding: 15px;
  }
  
  .type-actions {
    flex-direction: column;
  }
  
  .transaction-types {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .action-group {
    flex-direction: column;
  }
}
</style>