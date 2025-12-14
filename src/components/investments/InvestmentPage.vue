<template>
  <div class="investment-page">
    <div class="page-header">
      <button class="back-button" @click="goBack">
        ← 返回
      </button>
      <h2>{{ isEditing ? '编辑投资' : '添加投资' }}</h2>
    </div>
    
    <div class="investment-form-card">
      <form @submit.prevent="saveInvestment" class="investment-form">
        <div class="form-row">
          <div class="form-group">
            <label>投资类型:</label>
            <select 
              :value="localInvestment.type" 
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
              :value="localInvestment.name" 
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
              :value="localInvestment.quantity" 
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
              :value="localInvestment.purchasePrice" 
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
              :value="localInvestment.currentPrice || ''" 
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
              :value="localInvestment.purchaseDate" 
              @input="updateInvestment('purchaseDate', $event.target.value)"
              required
            >
          </div>
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="btn-primary">
            {{ isEditing ? '更新投资' : '添加投资' }}
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
  name: 'InvestmentPage',
  props: {
    investment: {
      type: Object,
      default: () => ({
        type: '股票',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: null,
        purchaseDate: new Date().toISOString().substr(0, 10)
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel'],
  data() {
    return {
      localInvestment: { ...this.investment },
      investmentTypes: TypeManager.getInvestmentTypes()
    };
  },
  methods: {
    updateInvestment(field, value) {
      this.localInvestment[field] = value;
    },
    saveInvestment() {
      if (!this.localInvestment.name || 
          this.localInvestment.quantity <= 0 || 
          this.localInvestment.purchasePrice <= 0) {
        alert('请输入有效的投资名称、数量和买入价');
        return;
      }
      
      this.$emit('save', this.localInvestment);
    },
    goBack() {
      this.$emit('cancel');
    },
    updateInvestmentTypes() {
      this.investmentTypes = TypeManager.getInvestmentTypes();
    }
  },
  watch: {
    investment: {
      handler(newVal) {
        this.localInvestment = { ...newVal };
      },
      deep: true
    }
  },
  mounted() {
    // 监听自定义事件以更新投资类型
    window.addEventListener('typesUpdated', this.updateInvestmentTypes);
  },
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('typesUpdated', this.updateInvestmentTypes);
  }
};
</script>

<style scoped>
.investment-page {
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

.investment-form-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  flex: 1;
  overflow-y: auto;
}

.investment-form {
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