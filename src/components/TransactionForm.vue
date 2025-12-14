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
      
      <div class="form-row">
        <div class="form-group">
          <label>明细:</label>
          <select 
            :value="newTransaction.description" 
            @change="updateTransaction('description', $event.target.value)"
            required
          >
            <option value="" disabled selected>请选择明细</option>
            <optgroup label="收入">
              <option value="工资">工资</option>
              <option value="奖金">奖金</option>
              <option value="投资收益">投资收益</option>
              <option value="兼职收入">兼职收入</option>
              <option value="礼金">礼金</option>
              <option value="其他收入">其他收入</option>
            </optgroup>
            <optgroup label="支出">
              <option value="房租">房租</option>
              <option value="水电费">水电费</option>
              <option value="餐饮">餐饮</option>
              <option value="交通">交通</option>
              <option value="购物">购物</option>
              <option value="娱乐">娱乐</option>
              <option value="医疗">医疗</option>
              <option value="教育">教育</option>
              <option value="保险">保险</option>
              <option value="投资支出">投资支出</option>
              <option value="其他支出">其他支出</option>
            </optgroup>
          </select>
        </div>
        
        <div class="form-group">
          <label>备注 (可选):</label>
          <input 
            type="text" 
            :value="newTransaction.notes || ''" 
            @input="updateTransaction('notes', $event.target.value)"
            placeholder="请输入备注信息" 
          >
        </div>
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

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>