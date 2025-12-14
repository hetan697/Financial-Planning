<template>
  <div class="investment-calculator">
    <div class="calculator-header">
      <h3>投资计算器</h3>
      <div class="controls">
        <el-button @click="addInvestmentOption" size="small" type="primary">
          添加投资方式
        </el-button>
      </div>
    </div>
    
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
          >
            <el-option label="股票" value="股票"></el-option>
            <el-option label="基金" value="基金"></el-option>
            <el-option label="债券" value="债券"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
          
          <el-input 
            v-model="option.name" 
            placeholder="投资方式名称"
            size="small"
            class="option-name-input"
          />
          
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
</template>

<script>
import { ElButton, ElInput, ElInputNumber, ElSlider, ElSelect, ElOption } from 'element-plus';

export default {
  name: 'InvestmentCalculator',
  components: {
    ElButton,
    ElInput,
    ElInputNumber,
    ElSlider,
    ElSelect,
    ElOption
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
      investmentOptions: [
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
        },
        { 
          type: '其他',
          name: '其他投资', 
          percentage: 10, 
          returnRate: 3.0 
        }
      ]
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
    // 添加投资方式
    addInvestmentOption() {
      this.investmentOptions.push({
        type: '股票',
        name: '新投资方式',
        percentage: 0,
        returnRate: 5.0
      });
    },
    
    // 删除投资方式
    removeInvestmentOption(index) {
      if (this.investmentOptions.length > 1) {
        this.investmentOptions.splice(index, 1);
      } else {
        this.$message.warning('至少需要保留一种投资方式');
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
  }
};
</script>

<style scoped>
.investment-calculator {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calculator-header h3 {
  margin: 0;
}

.controls {
  display: flex;
  gap: 10px;
}

.investment-options-list {
  margin-bottom: 20px;
}

.investment-option-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.option-type-select {
  width: 100px;
}

.option-name-input {
  flex: 1;
}

.option-details .detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.option-details .detail-row label {
  width: 120px;
  font-weight: bold;
}

.option-details .detail-row :deep(.el-input-number) {
  margin: 0 10px;
  width: 100px;
}

.total-percentage {
  font-weight: bold;
  font-size: 1.1em;
  text-align: right;
  margin-bottom: 20px;
}

.total-percentage.error {
  color: #f56c6c;
}

.warning-text {
  font-size: 0.9em;
  color: #e6a23c;
}

.investment-summary h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.summary-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #fafafa;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-type {
  font-weight: bold;
  color: #409eff;
}

.summary-name {
  flex: 1;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
}

.summary-percentage {
  font-weight: bold;
  color: #409eff;
}

.summary-amount {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.summary-return-rate {
  margin-bottom: 5px;
  color: #666;
}

.summary-return {
  font-weight: bold;
  color: #67c23a;
}

.overall-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
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

.summary-row .positive {
  color: #67c23a;
  font-weight: bold;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
}

.alert.warning {
  background-color: #fdf6ec;
  border-left: 4px solid #e6a23c;
  color: #e6a23c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .investment-calculator {
    padding: 15px;
  }
  
  .calculator-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .option-header {
    flex-wrap: wrap;
  }
  
  .option-type-select {
    width: auto;
    flex: 1;
  }
  
  .option-details .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .option-details .detail-row label {
    width: auto;
    margin-bottom: 5px;
  }
  
  .option-details .detail-row :deep(.el-input-number) {
    margin: 5px 0;
    width: 100%;
  }
  
  .summary-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .summary-type,
  .summary-name,
  .summary-percentage {
    text-align: left;
  }
}
</style>