<template>
  <div class="investment-calculator">
    <div class="calculator-header">
      <h3>投资计算器</h3>
      <div class="controls">
        <button @click="showAddOptionPage" class="btn-primary">
          添加投资方式
        </button>
      </div>
    </div>
    
    <div v-if="!showOptionForm">
      <div class="investment-options-list">
        <div 
          v-for="(option, index) in investmentOptions" 
          :key="index"
          class="investment-option-card"
        >
          <div class="option-header">
            <select 
              :value="option.type" 
              @change="updateOption(index, 'type', $event.target.value)"
              class="option-type-select"
            >
              <option 
                v-for="type in investmentTypes" 
                :key="type" 
                :value="type"
              >
                {{ type }}
              </option>
            </select>
            
            <input 
              type="text"
              :value="option.name" 
              placeholder="投资方式名称"
              class="option-name-input"
              @input="updateOption(index, 'name', $event.target.value)"
            />
            
            <button 
              @click="editOption(index)" 
              class="btn-secondary"
            >
              编辑
            </button>
            
            <button 
              @click="removeInvestmentOption(index)" 
              class="btn-danger"
            >
              ×
            </button>
          </div>
          
          <div class="option-details">
            <div class="detail-row">
              <label>预期年化收益率:</label>
              <input
                type="number"
                :value="option.returnRate"
                min="0"
                max="100"
                step="0.1"
                @input="updateOption(index, 'returnRate', parseFloat($event.target.value) || 0)"
              /> %
            </div>
            
            <div class="detail-row">
              <label>分配比例:</label>
              <input 
                type="range"
                :value="option.percentage"
                min="0"
                max="100"
                step="1"
                @input="updateOption(index, 'percentage', parseInt($event.target.value) || 0)"
              />
              <span class="percentage-value">{{ option.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="total-percentage" :class="{ 'error': totalPercentage !== 100 }">
        投资比例总计: {{ totalPercentage }}%
        <span v-if="totalPercentage !== 100" class="warning-text">投资比例总和应为100%</span>
      </div>
      
      <div v-if="totalPercentage === 100 && investableFund > 0" class="investment-summary">
        <h4>投资收益预估</h4>
        <div class="summary-grid">
          <div 
            v-for="(option, index) in investmentOptionsWithReturns" 
            :key="index"
            class="summary-card"
          >
            <div class="summary-header">
              <span class="summary-type">{{ option.type }}</span>
              <span class="summary-name">{{ option.name }}</span>
              <span class="summary-percentage">{{ option.percentage }}%</span>
            </div>
            <div class="summary-amount">¥{{ option.investmentAmount.toFixed(2) }}</div>
            <div class="summary-return-rate">{{ option.returnRate }}% 年化收益率</div>
            <div class="summary-return">预计年收益: ¥{{ option.expectedReturn.toFixed(2) }}</div>
          </div>
        </div>
        
        <div class="overall-summary">
          <div class="summary-row">
            <span>总投资金额:</span>
            <span>¥{{ overallInvestmentAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>预计年总收益:</span>
            <span>¥{{ overallExpectedReturn.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>整体年化收益率:</span>
            <span :class="{ 'positive': overallReturnRate > 0 }">{{ overallReturnRate.toFixed(2) }}%</span>
          </div>
          <div class="summary-row">
            <span>整体资产收益率 (相对于总资产):</span>
            <span :class="{ 'positive': assetReturnRate > 0 }">{{ assetReturnRate.toFixed(2) }}%</span>
          </div>
        </div>
      </div>
      
      <div v-else-if="investableFund <= 0" class="alert warning">
        可投资金额不足，无法进行投资计算。
      </div>
    </div>
    
    <!-- 添加/编辑投资方式表单页面 -->
    <div v-else>
      <InvestmentOptionForm
        :option="currentOption"
        :is-editing="isEditingOption"
        @save="saveOption"
        @cancel="cancelOption"
      />
    </div>
  </div>
</template>

<script>
import TypeManager from '../../utils/TypeManager.js';
import InvestmentOptionForm from './InvestmentOptionForm.vue';

export default {
  name: 'InvestmentCalculator',
  components: {
    InvestmentOptionForm
  },
  props: {
    investableFund: {
      type: Number,
      default: 0
    },
    totalAssets: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      investmentTypes: TypeManager.getInvestmentTypes(),
      investmentOptions: [
        { 
          type: '紧急备用金',
          name: '紧急备用金', 
          percentage: 10, 
          returnRate: 2.0 
        },
        { 
          type: '股票',
          name: '股票投资', 
          percentage: 30, 
          returnRate: 8.0 
        },
        { 
          type: '基金',
          name: '基金投资', 
          percentage: 40, 
          returnRate: 6.0 
        },
        { 
          type: '债券',
          name: '债券投资', 
          percentage: 20, 
          returnRate: 4.0 
        }
      ],
      showOptionForm: false,
      isEditingOption: false,
      currentOptionIndex: -1,
      currentOption: {
        type: '',
        name: '',
        returnRate: 5.0,
        percentage: 0
      }
    };
  },
  computed: {
    // 投资比例总计
    totalPercentage() {
      return this.investmentOptions.reduce((sum, option) => sum + option.percentage, 0);
    },
    
    // 包含收益计算的投资选项
    investmentOptionsWithReturns() {
      if (this.totalPercentage !== 100) return [];
      
      return this.investmentOptions.map(option => {
        const investmentAmount = this.investableFund * (option.percentage / 100);
        const expectedReturn = investmentAmount * (option.returnRate / 100);
        
        return {
          ...option,
          investmentAmount,
          expectedReturn
        };
      });
    },
    
    // 总投资金额
    overallInvestmentAmount() {
      return this.investmentOptionsWithReturns.reduce((sum, option) => sum + option.investmentAmount, 0);
    },
    
    // 预计年总收益
    overallExpectedReturn() {
      return this.investmentOptionsWithReturns.reduce((sum, option) => sum + option.expectedReturn, 0);
    },
    
    // 整体年化收益率
    overallReturnRate() {
      if (this.overallInvestmentAmount === 0) return 0;
      return (this.overallExpectedReturn / this.overallInvestmentAmount) * 100;
    },
    
    // 整体资产收益率 (相对于总资产)
    assetReturnRate() {
      if (this.totalAssets === 0) return 0;
      return (this.overallExpectedReturn / this.totalAssets) * 100;
    }
  },
  methods: {
    // 更新选项
    updateOption(index, field, value) {
      this.investmentOptions[index][field] = value;
    },
    
    // 编辑投资方式
    editOption(index) {
      this.currentOptionIndex = index;
      this.currentOption = { ...this.investmentOptions[index] };
      this.isEditingOption = true;
      this.showOptionForm = true;
    },
    
    // 显示添加投资方式页面
    showAddOptionPage() {
      this.currentOptionIndex = -1;
      this.currentOption = {
        type: this.investmentTypes.length > 0 ? this.investmentTypes[0] : '股票',
        name: '新投资方式',
        returnRate: 5.0,
        percentage: 0
      };
      this.isEditingOption = false;
      this.showOptionForm = true;
    },
    
    // 保存投资方式
    saveOption(option) {
      if (this.isEditingOption) {
        // 编辑现有选项
        this.investmentOptions[this.currentOptionIndex] = { ...option };
      } else {
        // 添加新选项
        this.investmentOptions.push({ ...option });
      }
      
      // 返回列表视图
      this.cancelOption();
    },
    
    // 取消编辑/添加
    cancelOption() {
      this.showOptionForm = false;
      this.isEditingOption = false;
      this.currentOptionIndex = -1;
    },
    
    // 删除投资方式
    removeInvestmentOption(index) {
      if (this.investmentOptions.length > 1) {
        this.investmentOptions.splice(index, 1);
      } else {
        alert('至少需要保留一种投资方式');
      }
    }
  },
  mounted() {
    // 监听自定义事件以更新投资类型
    window.addEventListener('typesUpdated', () => {
      this.investmentTypes = TypeManager.getInvestmentTypes();
    });
  },
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('typesUpdated', () => {
      this.investmentTypes = TypeManager.getInvestmentTypes();
    });
  }
};
</script>

<style scoped>
.investment-calculator {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.calculator-header h3 {
  margin: 0;
  color: #333;
}

.controls {
  display: flex;
  gap: 10px;
}

.investment-options-list {
  margin-bottom: 20px;
}

.investment-option-card {
  background: #F2F2F7;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.option-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}

.option-type-select,
.option-name-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.option-type-select {
  flex: 0 0 120px;
}

.option-name-input {
  flex: 1;
}

.option-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-row label {
  font-weight: 500;
  color: #333;
}

.detail-row input[type="number"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  width: 100px;
}

.detail-row input[type="range"] {
  width: 100%;
}

.percentage-value {
  font-weight: 500;
  color: #007AFF;
}

.total-percentage {
  padding: 15px;
  border-radius: 12px;
  background: #F2F2F7;
  margin-bottom: 20px;
  font-weight: 500;
}

.total-percentage.error {
  background: #FFECEB;
  color: #FF3B30;
}

.warning-text {
  color: #FF9500;
  font-size: 14px;
  margin-left: 10px;
}

.investment-summary h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-type {
  font-weight: 600;
  color: #007AFF;
}

.summary-name {
  font-weight: 500;
  color: #333;
}

.summary-percentage {
  font-weight: 600;
  color: #34C759;
}

.summary-amount {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.summary-return-rate {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.summary-return {
  font-size: 14px;
  color: #34C759;
  font-weight: 500;
}

.overall-summary {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.summary-row:last-child {
  border-bottom: none;
}

.positive {
  color: #34C759;
}

.alert {
  padding: 15px;
  border-radius: 12px;
  text-align: center;
}

.alert.warning {
  background: #FFF4E5;
  color: #FF9500;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
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
}

.btn-secondary {
  background: #F2F2F7;
  color: #007AFF;
}

.btn-secondary:hover {
  background: #e0e0e6;
}

.btn-danger {
  background: #FF3B30;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-danger:hover {
  background: #d73329;
}

@media (max-width: 768px) {
  .option-details {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>