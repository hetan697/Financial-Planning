<template>
  <section class="add-investment">
    <h2>添加投资项目</h2>
    <form @submit.prevent="addInvestment">
      <div class="form-row">
        <div class="form-group">
          <label>投资类型:</label>
          <select 
            :value="newInvestment.type" 
            @change="updateInvestment('type', $event.target.value)"
          >
            <option value="股票">股票</option>
            <option value="基金">基金</option>
            <option value="债券">债券</option>
            <option value="其他">其他</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>名称:</label>
          <input 
            type="text" 
            :value="newInvestment.name" 
            @input="updateInvestment('name', $event.target.value)"
            placeholder="例如：阿里巴巴、沪深300等" 
            required
          >
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>数量:</label>
          <input 
            type="number" 
            :value="newInvestment.quantity" 
            @input="updateInvestment('quantity', parseFloat($event.target.value) || 0)"
            min="0" 
            step="0.01" 
            placeholder="0" 
            required
          >
        </div>
        
        <div class="form-group">
          <label>买入价格:</label>
          <input 
            type="number" 
            :value="newInvestment.purchasePrice" 
            @input="updateInvestment('purchasePrice', parseFloat($event.target.value) || 0)"
            min="0" 
            step="0.01" 
            placeholder="0.00" 
            required
          >
        </div>
        
        <div class="form-group">
          <label>当前价格:</label>
          <input 
            type="number" 
            :value="newInvestment.currentPrice" 
            @input="updateInvestment('currentPrice', parseFloat($event.target.value) || 0)"
            min="0" 
            step="0.01" 
            placeholder="0.00 (可选)"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label>买入日期:</label>
        <input 
          type="date" 
          :value="newInvestment.purchaseDate" 
          @input="updateInvestment('purchaseDate', $event.target.value)"
          required
        >
      </div>
      
      <button type="submit" class="add-btn">添加投资</button>
    </form>
  </section>
</template>

<script>
export default {
  name: 'InvestmentForm',
  props: {
    newInvestment: {
      type: Object,
      required: true
    }
  },
  emits: ['add-investment', 'update-investment'],
  methods: {
    addInvestment() {
      this.$emit('add-investment');
    },
    updateInvestment(field, value) {
      this.$emit('update-investment', field, value);
    }
  }
};
</script>

<style scoped>
/* 表单区域 */
.add-investment {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.add-investment h2 {
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

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-btn:hover {
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>