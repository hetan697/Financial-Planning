<template>
  <section class="add-investment">
    <h2>{{ isEditing ? '编辑投资' : '添加投资项目' }}</h2>
    <form @submit.prevent="addInvestment">
      <div class="form-row">
        <div class="form-group">
          <label>投资类型:</label>
          <select 
            :value="newInvestment.type" 
            @change="updateInvestment('type', $event.target.value)"
          >
            <option 
              v-for="type in investmentTypes" 
              :key="type" 
              :value="type"
            >
              {{ type }}
            </option>
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
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>当前价格:</label>
          <input 
            type="number" 
            :value="newInvestment.currentPrice || ''" 
            @input="updateInvestment('currentPrice', $event.target.value ? parseFloat($event.target.value) : null)"
            min="0" 
            step="0.01" 
            placeholder="可选"
          >
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
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn-primary">
          {{ isEditing ? '更新投资' : '添加投资' }}
        </button>
        <button type="button" class="btn-secondary" @click="cancelEdit">
          取消
        </button>
      </div>
    </form>
  </section>
</template>

<script>
import TypeManager from '../../utils/TypeManager.js';

export default {
  name: 'InvestmentForm',
  props: {
    newInvestment: {
      type: Object,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-investment', 'add-investment', 'cancel-edit'],
  data() {
    return {
      investmentTypes: TypeManager.getInvestmentTypes()
    };
  },
  methods: {
    updateInvestment(field, value) {
      this.$emit('update-investment', { field, value });
    },
    addInvestment() {
      this.$emit('add-investment', this.newInvestment);
    },
    cancelEdit() {
      this.$emit('cancel-edit');
    }
  },
  mounted() {
    // 监听localStorage变化以更新投资类型
    window.addEventListener('storage', (e) => {
      if (e.key === 'investmentTypes') {
        this.investmentTypes = TypeManager.getInvestmentTypes();
      }
    });
  }
};
</script>

<style scoped>
.add-investment {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.add-investment h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px 15px -10px;
}

.form-group {
  flex: 1;
  min-width: 200px;
  padding: 0 10px;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #f4f4f5;
  color: #606266;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background-color: #e9e9eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .add-investment {
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .form-row {
    flex-direction: column;
    margin: 0 0 15px 0;
  }
  
  .form-group {
    min-width: 100%;
    padding: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>