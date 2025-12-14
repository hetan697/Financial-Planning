<template>
  <div class="transaction-page">
    <div class="page-header">
      <button class="back-button" @click="goBack">
        ← 返回
      </button>
      <h2>{{ isEditing ? '编辑交易' : '添加交易' }}</h2>
    </div>
    
    <div class="transaction-form-card">
      <form @submit.prevent="saveTransaction" class="transaction-form">
        <div class="form-row">
          <div class="form-group">
            <label>类型:</label>
            <select v-model="localTransaction.type">
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>日期:</label>
            <input 
              type="date" 
              v-model="localTransaction.date"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>明细:</label>
          <select v-model="localTransaction.description">
            <optgroup label="收入" v-if="localTransaction.type === 'income'">
              <option 
                v-for="item in incomeOptions" 
                :key="item" 
                :value="item"
              >
                {{ item }}
              </option>
            </optgroup>
            <optgroup label="支出" v-if="localTransaction.type === 'expense'">
              <option 
                v-for="item in expenseOptions" 
                :key="item" 
                :value="item"
              >
                {{ item }}
              </option>
            </optgroup>
          </select>
        </div>
        
        <div class="form-group">
          <label>备注 (可选):</label>
          <input 
            type="text" 
            v-model="localTransaction.notes" 
            placeholder="请输入备注信息"
          >
        </div>
        
        <div class="form-group">
          <label>金额:</label>
          <input 
            type="number" 
            v-model.number="localTransaction.amount" 
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="btn-primary">
            {{ isEditing ? '更新' : '添加' }}
          </button>
          <button type="button" class="btn-secondary" @click="goBack">
            取消
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import TypeManager from '../../utils/TypeManager.js';

export default {
  name: 'TransactionPage',
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
    const transactionTypes = TypeManager.getTransactionTypes();
    
    return {
      localTransaction: { ...this.transaction },
      incomeOptions: transactionTypes.income,
      expenseOptions: transactionTypes.expense
    };
  },
  methods: {
    saveTransaction() {
      if (!this.localTransaction.type || !this.localTransaction.description || 
          !this.localTransaction.date || this.localTransaction.amount <= 0) {
        alert('请填写所有必填字段且金额必须大于0');
        return;
      }
      
      this.$emit('save', this.localTransaction);
    },
    goBack() {
      this.$emit('cancel');
    },
    updateTransactionTypes() {
      const transactionTypes = TypeManager.getTransactionTypes();
      this.incomeOptions = transactionTypes.income;
      this.expenseOptions = transactionTypes.expense;
    }
  },
  watch: {
    transaction: {
      handler(newVal) {
        this.localTransaction = { ...newVal };
      },
      deep: true
    }
  },
  mounted() {
    // 监听自定义事件以更新交易类型
    window.addEventListener('typesUpdated', this.updateTransactionTypes);
  },
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('typesUpdated', this.updateTransactionTypes);
  }
};
</script>

<style scoped>
.transaction-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.back-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 10px;
  color: #007AFF;
  border-radius: 8px;
}

.back-button:hover {
  background-color: #f0f0f0;
}

.page-header h2 {
  margin: 0;
  flex: 1;
  text-align: center;
  padding-right: 60px; /* 为返回按钮留出空间 */
}

.transaction-form-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  flex: 1;
  overflow-y: auto;
}

.transaction-form {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-bottom: 20px;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 16px;
  background: #F2F2F7;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.form-buttons {
  display: flex;
  gap: 15px;
  margin-top: auto;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #007AFF;
  color: white;
}

.btn-primary:hover {
  background: #0062cc;
}

.btn-secondary {
  background: #F2F2F7;
  color: #007AFF;
}

.btn-secondary:hover {
  background: #e0e0e6;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>