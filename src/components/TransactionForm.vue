<template>
  <section class="add-transaction">
    <h2>{{ isEditing ? '编辑交易' : '添加交易' }}</h2>
    <form @submit.prevent="addTransaction">
      <div class="form-group">
        <label>类型:</label>
        <select :value="newTransaction.type" @change="updateTransaction('type', $event.target.value)">
          <option value="income">收入</option>
          <option value="expense">支出</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>描述:</label>
        <input 
          type="text" 
          :value="newTransaction.description" 
          @input="updateTransaction('description', $event.target.value)"
          placeholder="例如：工资、房租、餐饮等" 
          required
        >
      </div>
      
      <div class="form-group">
        <label>金额:</label>
        <input 
          type="number" 
          :value="newTransaction.amount" 
          @input="updateTransaction('amount', parseFloat($event.target.value) || 0)"
          min="0" 
          step="0.01" 
          placeholder="0.00" 
          required
        >
      </div>
      
      <div class="form-group">
        <label>日期:</label>
        <input 
          type="date" 
          :value="newTransaction.date" 
          @input="updateTransaction('date', $event.target.value)"
          required
        >
      </div>
      
      <div class="form-buttons">
        <button type="submit" class="add-btn">{{ isEditing ? '更新' : '添加' }}</button>
        <button 
          v-if="isEditing" 
          type="button" 
          class="cancel-btn"
          @click="cancelEdit"
        >
          取消
        </button>
      </div>
    </form>
  </section>
</template>

<script>
export default {
  name: 'TransactionForm',
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
  methods: {
    addTransaction() {
      this.$emit('add-transaction');
    },
    updateTransaction(field, value) {
      this.$emit('update-transaction', field, value);
    },
    cancelEdit() {
      this.$emit('cancel-edit');
    }
  }
};
</script>

<style scoped>
/* 表单区域 */
.add-transaction {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.add-transaction h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  flex: 1;
}

.add-btn:hover {
  transform: translateY(-2px);
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  flex: 1;
}

.cancel-btn:hover {
  background-color: #5a6268;
}
</style>