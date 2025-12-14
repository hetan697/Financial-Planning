<template>
  <div class="investment-advice">
    <h3>投资建议</h3>
    
    <div class="advice-section">
      <p>根据您当前的财务状况，我们为您提供以下投资建议：</p>
      
      <div v-if="balance > 0" class="health-info">
        <div class="health-bar">
          <span>财务健康度: </span>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :class="healthLevel"
              :style="{ width: healthPercentage + '%' }"
            ></div>
            <span class="progress-text">{{ healthPercentage }}%</span>
          </div>
          <span :class="['health-label', healthLevel]">{{ healthText }}</span>
        </div>
      </div>
      
      <div v-else-if="balance < 0" class="alert error">
        您的账户余额为负，建议优先增加收入或减少支出
      </div>
      
      <div v-else class="alert info">
        您还没有添加任何交易记录，建议先添加收支信息以便获取个性化投资建议
      </div>
    </div>
    
    <!-- 紧急备用金建议 -->
    <div class="advice-section">
      <h4>💰 紧急备用金</h4>
      <p>{{ emergencyFundAdvice.message }}</p>
      <div v-if="emergencyFundAdvice.amount" class="fund-amount">
        建议金额: <span>¥{{ emergencyFundAdvice.amount.toFixed(2) }}</span>
      </div>
    </div>
    
    <!-- 风险评估 -->
    <div class="advice-section">
      <h4>📊 风险评估</h4>
      <p>根据您的资产情况，您的风险承受能力为：<strong :class="riskLevel.class">{{ riskLevel.label }}</strong></p>
      <ul class="characteristics">
        <li v-for="(characteristic, index) in riskLevel.characteristics" :key="index">
          {{ characteristic }}
        </li>
      </ul>
    </div>
    
    <!-- 投资组合 -->
    <div class="advice-section">
      <h4>📈 投资组合</h4>
      <p>{{ investmentAllocation.message }}</p>
      
      <!-- 投资计算器 -->
      <div v-if="balance > 0 && emergencyFundAdvice.amount >= 0 && balance > emergencyFundAdvice.amount">
        <InvestmentCalculator 
          :investable-fund="investableFund"
          :total-assets="balance"
          @update:investment-options="handleInvestmentOptionsUpdate"
        />
      </div>
      
      <div v-else class="alert warning">
        当前暂无具体的投资分配建议。建议您先建立足够的紧急备用金后再考虑投资。
      </div>
    </div>
    
    <!-- 投资策略 -->
    <div class="advice-section">
      <h4>🧭 投资策略</h4>
      <ol class="strategy-list">
        <li v-for="(strategy, index) in investmentStrategies" :key="index">
          <strong>{{ strategy.title }}</strong>: {{ strategy.description }}
        </li>
      </ol>
    </div>
    
    <!-- 定期复查 -->
    <div class="advice-section">
      <h4>📅 定期复查</h4>
      <p>{{ reviewAdvice.message }}</p>
      <ul class="tips-list">
        <li v-for="(tip, index) in reviewAdvice.tips" :key="index">
          {{ tip }}
        </li>
      </ul>
    </div>
    
    <div class="disclaimer alert warning">
      以上仅为一般性投资建议，不构成具体投资意见。投资有风险，请谨慎决策。
    </div>
  </div>
</template>

<script>
import { ElSlider } from 'element-plus';
import InvestmentCalculator from './InvestmentCalculator.vue';

export default {
  name: 'InvestmentAdvice',
  components: {
    ElSlider,
    InvestmentCalculator
  },
  props: {
    balance: {
      type: Number,
      default: 0
    },
    transactions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['allocation-change'],
  data() {
    return {
      emergencyFundMonths: 3, // 建议的应急资金月数
      investmentOptions: []
    };
  },
  computed: {
    // 财务健康度百分比
    healthPercentage() {
      if (this.balance <= 0) return 20;
      if (this.balance < 1000) return 40;
      if (this.balance < 5000) return 60;
      if (this.balance < 10000) return 80;
      return 100;
    },
    
    // 财务健康等级状态
    healthLevelStatus() {
      const percentage = this.healthPercentage;
      if (percentage < 40) return 'exception';
      if (percentage < 70) return 'warning';
      if (percentage < 90) return '';
      return 'success';
    },
    
    // 财务健康等级
    healthLevel() {
      const percentage = this.healthPercentage;
      if (percentage < 40) return 'poor';
      if (percentage < 70) return 'fair';
      if (percentage < 90) return 'good';
      return 'excellent';
    },
    
    // 财务健康文本
    healthText() {
      const levels = {
        'poor': '需改善',
        'fair': '一般',
        'good': '良好',
        'excellent': '优秀'
      };
      return levels[this.healthLevel];
    },
    
    // 投资比例总计
    totalPercentage() {
      return this.investmentOptions.reduce((sum, option) => sum + option.percentage, 0);
    },
    
    // 紧急备用金建议
    emergencyFundAdvice() {
      // 基于过去6个月的支出记录计算月均支出
      const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
      
      if (expenseTransactions.length === 0) {
        return {
          message: '您还没有任何支出记录，建议先记录至少3个月的支出数据以便更准确地计算紧急备用金。',
          amount: 0
        };
      }
      
      // 获取过去6个月的支出记录
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentExpenses = expenseTransactions.filter(t => new Date(t.date) >= sixMonthsAgo);
      
      if (recentExpenses.length === 0) {
        return {
          message: '您最近6个月没有支出记录，建议先记录至少3个月的支出数据以便更准确地计算紧急备用金。',
          amount: 0
        };
      }
      
      // 计算月均支出
      const totalExpense = recentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
      const monthsCount = Math.min(6, this.getMonthsCovered(recentExpenses));
      const averageMonthlyExpense = monthsCount > 0 ? totalExpense / monthsCount : 0;
      
      // 紧急备用金通常为3-6个月的支出
      const emergencyFund = averageMonthlyExpense * this.emergencyFundMonths;
      
      return {
        message: `根据您最近${monthsCount}个月的支出记录，月均支出为¥${averageMonthlyExpense.toFixed(2)}。建议准备${this.emergencyFundMonths}个月的紧急备用金。`,
        amount: emergencyFund
      };
    },
    
    // 风险承受能力评估
    riskLevel() {
      if (this.balance <= 0) {
        return {
          label: '保守型',
          class: 'conservative',
          characteristics: [
            '资本 preservation 为主要目标',
            '对投资损失非常敏感',
            '适合极低风险产品，如银行存款'
          ]
        };
      }
      
      if (this.balance < 5000) {
        return {
          label: '保守型',
          class: 'conservative',
          characteristics: [
            '首要目标是保护本金',
            '对投资损失较为敏感',
            '适合低风险产品，如银行定期存款、国债'
          ]
        };
      }
      
      if (this.balance < 20000) {
        return {
          label: '稳健型',
          class: 'moderate',
          characteristics: [
            '愿意承担一定风险以换取更高收益',
            '追求长期稳定的回报',
            '适合混合型投资，如债券基金、蓝筹股'
          ]
        };
      }
      
      return {
        label: '积极型',
        class: 'aggressive',
        characteristics: [
          '能承受较大短期波动',
          '追求较高长期收益',
          '可适当配置高风险高收益产品，如成长股、指数基金'
        ]
      };
    },
    
    // 可用于投资的资金
    investableFund() {
      if (this.balance <= 0) return 0;
      
      // 计算紧急备用金（基于实际支出数据）
      const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
      
      if (expenseTransactions.length === 0) {
        return 0;
      }
      
      // 获取过去6个月的支出记录
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentExpenses = expenseTransactions.filter(t => new Date(t.date) >= sixMonthsAgo);
      
      if (recentExpenses.length === 0) {
        return 0;
      }
      
      // 计算月均支出
      const totalExpense = recentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
      const monthsCount = Math.min(6, this.getMonthsCovered(recentExpenses));
      const averageMonthlyExpense = monthsCount > 0 ? totalExpense / monthsCount : 0;
      
      // 紧急备用金通常为3-6个月的支出
      const emergencyFund = averageMonthlyExpense * this.emergencyFundMonths;
      
      return Math.max(0, this.balance - emergencyFund);
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
    
    // 投资分配建议
    investmentAllocation() {
      if (this.balance <= 0) {
        return {
          message: '由于您的财务状况尚未达到投资门槛，建议先积累资金。',
          details: {}
        };
      }
      
      // 计算紧急备用金（基于实际支出数据）
      const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
      
      if (expenseTransactions.length === 0) {
        return {
          message: '建议先记录至少3个月的支出数据，以便更准确地计算紧急备用金和制定投资计划。',
          details: {}
        };
      }
      
      // 获取过去6个月的支出记录
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentExpenses = expenseTransactions.filter(t => new Date(t.date) >= sixMonthsAgo);
      
      if (recentExpenses.length === 0) {
        return {
          message: '建议先记录至少3个月的支出数据，以便更准确地计算紧急备用金和制定投资计划。',
          details: {}
        };
      }
      
      if (this.investableFund <= 0) {
        const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const recentExpenses = expenseTransactions.filter(t => new Date(t.date) >= sixMonthsAgo);
        const totalExpense = recentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
        const monthsCount = Math.min(6, this.getMonthsCovered(recentExpenses));
        const averageMonthlyExpense = monthsCount > 0 ? totalExpense / monthsCount : 0;
        const emergencyFund = averageMonthlyExpense * this.emergencyFundMonths;
        
        return {
          message: `您的资金尚不足以建立充足的紧急备用金（建议金额: ¥${emergencyFund.toFixed(2)}），建议优先储备紧急资金。`,
          details: {}
        };
      }
      
      // 发送分配建议给父组件
      const allocationDetails = {};
      this.investmentOptions.forEach((option, index) => {
        allocationDetails[`option_${index}`] = {
          name: option.name,
          percentage: option.percentage,
          description: `预期年化收益率: ${option.returnRate}%`
        };
      });
      
      this.$emit('allocation-change', allocationDetails);
      
      return {
        message: `根据您的风险承受能力(${this.riskLevel.label})和财务状况，建议按以下方式分配投资资金：`,
        details: allocationDetails
      };
    },
    
    // 投资策略建议
    investmentStrategies() {
      return [
        {
          title: '分散投资',
          description: '不要把鸡蛋放在一个篮子里，通过资产类别、行业、地域等多维度分散投资降低风险。'
        },
        {
          title: '定期定额投资',
          description: '采用定期定额投资策略，可以平滑市场波动，降低择时风险，尤其适用于基金投资。'
        },
        {
          title: '长期持有',
          description: '优质资产应长期持有，避免频繁交易。历史数据显示，长期持有往往能获得更好的回报。'
        },
        {
          title: '定期再平衡',
          description: '每年或每半年检查一次投资组合，根据市场变化和个人目标调整资产配置比例。'
        }
      ];
    },
    
    // 定期复查建议
    reviewAdvice() {
      return {
        message: '投资不是一劳永逸的事情，需要定期复查和调整：',
        tips: [
          '每季度检查一次投资组合表现',
          '每年重新评估风险承受能力和投资目标',
          '根据人生阶段调整投资策略（如结婚、生子、临近退休等）',
          '关注宏观经济环境变化对投资的影响'
        ]
      };
    }
  },
  methods: {
    getInvestmentColor(type) {
      const colors = {
        conservative: '#409eff',
        moderate: '#67c23a',
        aggressive: '#f56c6c'
      };
      return colors[type] || '#409eff';
    },
    
    // 计算支出记录覆盖的月份数量
    getMonthsCovered(transactions) {
      if (transactions.length === 0) return 0;
      
      // 获取最早的和最晚的交易日期
      const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      
      // 计算月份差
      const yearDiff = lastDate.getFullYear() - firstDate.getFullYear();
      const monthDiff = lastDate.getMonth() - firstDate.getMonth();
      return yearDiff * 12 + monthDiff + 1; // +1表示包含起始和结束月份
    },
    
    // 处理投资选项更新
    handleInvestmentOptionsUpdate(options) {
      this.investmentOptions = options;
    }
  }
};
</script>

<style scoped>
.investment-advice {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.investment-advice h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.advice-section {
  margin-bottom: 25px;
}

.advice-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.advice-section h5 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.health-info {
  margin: 15px 0;
}

.health-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-fill.poor {
  background-color: #f56c6c;
}

.progress-fill.fair {
  background-color: #e6a23c;
}

.progress-fill.good {
  background-color: #67c23a;
}

.progress-fill.excellent {
  background-color: #409eff;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
}

.health-label {
  font-weight: bold;
}

.health-label.poor {
  color: #f56c6c;
}

.health-label.fair {
  color: #e6a23c;
}

.health-label.good {
  color: #67c23a;
}

.health-label.excellent {
  color: #409eff;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
}

.alert.error {
  background-color: #fef0f0;
  border-left: 4px solid #f56c6c;
  color: #f56c6c;
}

.alert.info {
  background-color: #f4f4f5;
  border-left: 4px solid #909399;
  color: #909399;
}

.alert.warning {
  background-color: #fdf6ec;
  border-left: 4px solid #e6a23c;
  color: #e6a23c;
}

.fund-amount {
  font-weight: bold;
  font-size: 1.1em;
  color: #409eff;
}

.characteristics,
.tips-list {
  padding-left: 20px;
}

.characteristics li,
.tips-list li {
  margin-bottom: 8px;
}

.strategy-list {
  padding-left: 20px;
}

.strategy-list li {
  margin-bottom: 10px;
}

.investment-options {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.options-controls {
  margin-bottom: 20px;
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
}

.option-name-input {
  flex: 1;
  margin-right: 10px;
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

.investment-summary {
  margin-top: 20px;
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

.summary-name {
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

.investment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.investment-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #fafafa;
}

.investment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.investment-name {
  font-weight: bold;
  font-size: 1.1em;
}

.investment-percentage {
  font-weight: bold;
  color: #409eff;
}

.investment-amount {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.investment-progress {
  margin-bottom: 10px;
}

.investment-description {
  font-size: 0.9em;
  color: #666;
}

.disclaimer {
  margin-top: 20px;
  font-weight: bold;
}

.conservative {
  color: #409eff;
}

.moderate {
  color: #67c23a;
}

.aggressive {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .investment-advice {
    padding: 15px;
  }
  
  .investment-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .health-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .investment-options {
    padding: 15px;
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
}
</style>