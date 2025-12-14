<template>
  <div class="investment-calculator">
    <div class="calculator-header">
      <h3>投资计算器</h3>
      <div class="controls">
        <el-button @click="showAddOptionPage" size="small" type="primary">
          添加投资方式
        </el-button>
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
            <el-select 
              v-model="option.type" 
              placeholder="投资类型"
              size="small"
              class="option-type-select"
              @change="updateOption(index, 'type', $event)"
            >
              <el-option 
                v-for="type in investmentTypes" 
                :key="type" 
                :label="type" 
                :value="type"
              ></el-option>
            </el-select>
            
            <el-input 
              v-model="option.name" 
              placeholder="投资方式名称"
              size="small"
              class="option-name-input"
              @input="updateOption(index, 'name', $event)"
            />
            
            <el-button 
              @click="editOption(index)" 
              size="small"
            >
              编辑
            </el-button>
            
            <el-button 
              @click="removeInvestmentOption(index)" 
              size="small" 
              type="danger"
              circle
            >
              ×
            </el-button>
          </div>
          
          <div class="option-details">
            <div class="detail-row">
              <label>预期年化收益率:</label>
              <el-input-number 
                v-model="option.returnRate" 
                :min="0" 
                :max="100" 
                :step="0.1"
                size="small"
                controls-position="right"
                @change="updateOption(index, 'returnRate', $event)"
              /> %
            </div>
            
            <div class="detail-row">
              <label>分配比例:</label>
              <el-slider
                v-model="option.percentage"
                :min="0"
                :max="100"
                :step="1"
                show-input
                size="small"
                @change="handlePercentageChange(index)"
              />
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
import { ElButton, ElInput, ElInputNumber, ElSlider, ElSelect, ElOption } from 'element-plus';
import TypeManager from '../../utils/TypeManager.js';
import InvestmentOptionForm from './InvestmentOptionForm.vue';

export default {
  name: 'InvestmentCalculator',
  components: {
    ElButton,
    ElInput,
    ElInputNumber,
    ElSlider,
    ElSelect,
    ElOption,
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
        this.$message.warning('至少需要保留一种投资方式');
      }
    },
    
    // 处理比例调整
    handlePercentageChange(changedIndex) {
      const changedOption = this.investmentOptions[changedIndex];
      
      // 如果总比例超过100%，需要调整其他选项的比例
      if (this.totalPercentage > 100) {
        const excess = this.totalPercentage - 100;
        this.distributeExcessPercentage(excess, changedIndex);
      } 
      // 如果总比例小于100%，需要补足缺少的比例
      else if (this.totalPercentage < 100) {
        const deficit = 100 - this.totalPercentage;
        this.distributeDeficitPercentage(deficit, changedIndex);
      }
    },
    
    // 分配多余的比例
    distributeExcessPercentage(excess, excludeIndex) {
      // 找到可以减少比例的选项（除了刚刚调整的选项和已经是0%的选项）
      const adjustableOptions = this.investmentOptions
        .map((option, index) => ({ option, index }))
        .filter(({ option, index }) => index !== excludeIndex && option.percentage > 0);
      
      if (adjustableOptions.length > 0) {
        // 平均减少每个可调整选项的比例
        const reductionPerOption = excess / adjustableOptions.length;
        adjustableOptions.forEach(({ option }) => {
          const reduction = Math.min(reductionPerOption, option.percentage);
          option.percentage -= reduction;
        });
      } else {
        // 如果没有可调整的选项，将多余的百分比从当前选项中减去
        this.investmentOptions[excludeIndex].percentage -= excess;
      }
      
      // 确保所有比例都是非负数并且是整数
      this.investmentOptions.forEach(option => {
        option.percentage = Math.max(0, Math.round(option.percentage));
      });
      
      // 再次检查总和，如有必要进行微调
      this.adjustToExactHundred();
    },
    
    // 补足缺少的比例
    distributeDeficitPercentage(deficit, excludeIndex) {
      // 找到可以增加比例的选项（除了刚刚调整的选项）
      const adjustableOptions = this.investmentOptions
        .map((option, index) => ({ option, index }))
        .filter(({ index }) => index !== excludeIndex);
      
      if (adjustableOptions.length > 0) {
        // 平均增加每个可调整选项的比例
        const additionPerOption = deficit / adjustableOptions.length;
        adjustableOptions.forEach(({ option }) => {
          option.percentage += additionPerOption;
        });
      } else {
        // 如果没有其他选项，将缺少的百分比加到当前选项
        this.investmentOptions[excludeIndex].percentage += deficit;
      }
      
      // 确保所有比例都是整数
      this.investmentOptions.forEach(option => {
        option.percentage = Math.round(option.percentage);
      });
      
      // 再次检查总和，如有必要进行微调
      this.adjustToExactHundred();
    },
    
    // 调整总和精确到100%
    adjustToExactHundred() {
      let currentTotal = this.investmentOptions.reduce((sum, option) => sum + option.percentage, 0);
      
      while (currentTotal !== 100) {
        if (currentTotal > 100) {
          // 找到一个可以减少的选项
          const reducibleOption = this.investmentOptions.find(option => option.percentage > 0);
          if (reducibleOption) {
            reducibleOption.percentage--;
            currentTotal--;
          } else {
            break; // 无法再减少
          }
        } else {
          // 找到一个可以增加的选项
          const incrementableOption = this.investmentOptions[0]; // 增加第一个选项
          if (incrementableOption) {
            incrementableOption.percentage++;
            currentTotal++;
          } else {
            break; // 无法再增加
          }
        }
      }
    }
  },
  watch: {
    investmentOptions: {
      handler() {
        // 向父组件发送投资选项更新事件
        this.$emit('update:investment-options', this.investmentOptions);
      },
      deep: true
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
.investment-calculator {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
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
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.option-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.option-type-select,
.option-name-input {
  flex: 1;
  min-width: 120px;
}

.option-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-row label {
  min-width: 120px;
  font-weight: 500;
}

.total-percentage {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  background-color: #e8f4ff;
  font-weight: 500;
}

.total-percentage.error {
  background-color: #ffeeee;
  color: #f56c6c;
}

.warning-text {
  font-size: 0.9em;
  color: #f56c6c;
}

.investment-summary h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9em;
}

.summary-type {
  font-weight: bold;
  color: #409eff;
}

.summary-name {
  color: #666;
}

.summary-percentage {
  font-weight: bold;
  color: #409eff;
}

.summary-amount {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.summary-return-rate {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}

.summary-return {
  font-size: 0.9em;
  color: #67c23a;
  font-weight: 500;
}

.overall-summary {
  background-color: #e8f4ff;
  border-radius: 8px;
  padding: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #d0e6ff;
}

.summary-row:last-child {
  border-bottom: none;
}

.positive {
  color: #f56c6c;
  font-weight: bold;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.alert.warning {
  background-color: #fff6e6;
  color: #e6a23c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .investment-calculator {
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .calculator-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .option-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>