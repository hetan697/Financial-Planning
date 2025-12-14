<template>
  <div class="investment-advice">
    <h3>投资建议</h3>
    <div class="advice-summary">
      <p>根据您当前的财务状况，我们为您提供以下投资建议：</p>
      <div class="financial-health" v-if="balance > 0">
        <span>财务健康度: </span>
        <div class="health-bar">
          <div class="health-fill" :style="{ width: healthPercentage + '%' }" :class="healthLevel"></div>
        </div>
        <span class="health-text" :class="healthLevel">{{ healthText }}</span>
      </div>
      <div v-else-if="balance < 0" class="negative-balance-warning">
        <p>⚠️ 您的账户余额为负，建议优先增加收入或减少支出</p>
      </div>
      <div v-else class="zero-balance-info">
        <p>ℹ️ 您还没有添加任何交易记录，建议先添加收支信息以便获取个性化投资建议</p>
      </div>
    </div>
    
    <div class="advice-sections">
      <!-- 紧急备用金建议 -->
      <div class="advice-section">
        <h4>💰 紧急备用金</h4>
        <p>{{ emergencyFundAdvice.message }}</p>
        <div v-if="emergencyFundAdvice.amount" class="amount-display">
          建议金额: <span class="amount">¥{{ emergencyFundAdvice.amount.toFixed(2) }}</span>
        </div>
      </div>
      
      <!-- 风险承受能力评估 -->
      <div class="advice-section">
        <h4>📊 风险承受能力评估</h4>
        <p>根据您的资产情况，您的风险承受能力为：<strong :class="riskLevel.class">{{ riskLevel.label }}</strong></p>
        <ul class="risk-characteristics">
          <li v-for="(char, index) in riskLevel.characteristics" :key="index">{{ char }}</li>
        </ul>
      </div>
      
      <!-- 投资分配建议 -->
      <div class="advice-section">
        <h4>📈 投资组合建议</h4>
        <p>{{ investmentAllocation.message }}</p>
        <div class="allocation-chart" v-if="Object.keys(investmentAllocation.details).length > 0">
          <div 
            v-for="(detail, key) in investmentAllocation.details" 
            :key="key"
            class="allocation-item"
          >
            <div class="allocation-header">
              <span class="allocation-name">{{ detail.name }}</span>
              <span class="allocation-percentage">{{ detail.percentage }}%</span>
            </div>
            <div class="allocation-amount">¥{{ detail.amount.toFixed(2) }}</div>
            <div class="allocation-bar">
              <div 
                class="allocation-fill" 
                :style="{ width: detail.percentage + '%' }"
                :class="getInvestmentClass(key)"
              ></div>
            </div>
            <div class="allocation-description">{{ detail.description }}</div>
          </div>
        </div>
        <div v-else class="no-allocation-advice">
          <p>当前暂无具体的投资分配建议。建议您先建立足够的紧急备用金后再考虑投资。</p>
        </div>
      </div>
      
      <!-- 投资策略建议 -->
      <div class="advice-section">
        <h4>🧭 投资策略</h4>
        <div class="strategy-points">
          <div 
            v-for="(strategy, index) in investmentStrategies" 
            :key="index"
            class="strategy-point"
          >
            <div class="strategy-number">{{ index + 1 }}</div>
            <div class="strategy-content">
              <h5>{{ strategy.title }}</h5>
              <p>{{ strategy.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 定期复查提醒 -->
      <div class="advice-section">
        <h4>📅 定期复查</h4>
        <p>{{ reviewAdvice.message }}</p>
        <ul>
          <li v-for="(tip, index) in reviewAdvice.tips" :key="index">{{ tip }}</li>
        </ul>
      </div>
    </div>
    
    <div class="disclaimer">
      <p><strong>免责声明：</strong>以上仅为一般性投资建议，不构成具体投资意见。投资有风险，请谨慎决策。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvestmentAdvice',
  props: {
    balance: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      emergencyFundMonths: 3 // 建议的应急资金月数
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
    
    // 紧急备用金建议
    emergencyFundAdvice() {
      if (this.balance <= 0) {
        return {
          message: '您的当前余额为负，请优先考虑增加收入或减少支出。',
          amount: 0
        };
      }
      
      // 计算紧急备用金（假设月支出为总收入的60%）
      const monthlyExpense = this.balance * 0.6;
      const emergencyFund = monthlyExpense * this.emergencyFundMonths;
      
      if (this.balance > emergencyFund) {
        return {
          message: `您已拥有足够的紧急备用金。建议保留¥${emergencyFund.toFixed(2)}作为${this.emergencyFundMonths}个月的生活费储备。`,
          amount: emergencyFund
        };
      } else {
        const needed = emergencyFund - this.balance;
        return {
          message: `您的紧急备用金不足。建议额外储备¥${needed.toFixed(2)}以达到${this.emergencyFundMonths}个月生活费的标准。`,
          amount: emergencyFund
        };
      }
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
    
    // 投资分配建议
    investmentAllocation() {
      if (this.balance <= 0) {
        return {
          message: '由于您的财务状况尚未达到投资门槛，建议先积累资金。',
          details: {}
        };
      }
      
      // 计算紧急备用金（假设月支出为总收入的60%）
      const monthlyExpense = this.balance * 0.6;
      const emergencyFund = monthlyExpense * this.emergencyFundMonths;
      
      if (this.balance <= emergencyFund) {
        return {
          message: '您的资金尚不足以建立充足的紧急备用金，建议优先储备紧急资金。',
          details: {}
        };
      }
      
      // 可用于投资的资金
      const investableFund = this.balance - emergencyFund;
      
      // 根据风险等级调整分配比例
      let allocation = {};
      if (this.riskLevel.class === 'conservative') {
        allocation = {
          conservative: { name: '稳健理财', percentage: 70, description: '银行理财、国债等低风险产品' },
          moderate: { name: '混合基金', percentage: 20, description: '平衡型基金，适度分散风险' },
          aggressive: { name: '股票投资', percentage: 10, description: '少量配置优质股票' }
        };
      } else if (this.riskLevel.class === 'moderate') {
        allocation = {
          conservative: { name: '稳健理财', percentage: 40, description: '银行理财、国债等低风险产品' },
          moderate: { name: '混合基金', percentage: 40, description: '平衡型基金，适度分散风险' },
          aggressive: { name: '股票投资', percentage: 20, description: '配置成长型股票或指数基金' }
        };
      } else {
        allocation = {
          conservative: { name: '稳健理财', percentage: 20, description: '少量配置保本产品' },
          moderate: { name: '混合基金', percentage: 50, description: '指数基金、主动型基金等' },
          aggressive: { name: '股票投资', percentage: 30, description: '成长股、行业ETF等' }
        };
      }
      
      // 计算各项投资额
      Object.keys(allocation).forEach(key => {
        allocation[key].amount = investableFund * (allocation[key].percentage / 100);
      });
      
      return {
        message: `根据您的风险承受能力(${this.riskLevel.label})，建议按以下方式分配投资资金：`,
        details: allocation
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
    getInvestmentClass(type) {
      const classes = {
        conservative: 'conservative',
        moderate: 'moderate',
        aggressive: 'aggressive'
      };
      return classes[type] || '';
    }
  }
};
</script>

<style scoped>
/* 投资建议 */
.investment-advice {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.investment-advice h3 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.advice-summary {
  margin-bottom: 25px;
}

.financial-health {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.health-bar {
  flex: 1;
  height: 12px;
  background-color: #eee;
  border-radius: 6px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  border-radius: 6px;
}

.health-fill.poor {
  background-color: #dc3545;
}

.health-fill.fair {
  background-color: #ffc107;
}

.health-fill.good {
  background-color: #28a745;
}

.health-fill.excellent {
  background-color: #20c997;
}

.health-text {
  font-weight: bold;
}

.health-text.poor {
  color: #dc3545;
}

.health-text.fair {
  color: #ffc107;
}

.health-text.good {
  color: #28a745;
}

.health-text.excellent {
  color: #20c997;
}

.negative-balance-warning,
.zero-balance-info {
  margin-top: 15px;
  padding: 15px;
  border-radius: 8px;
}

.negative-balance-warning {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.zero-balance-info {
  background-color: #cce7ff;
  color: #004085;
  border: 1px solid #b8daff;
}

.advice-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.advice-section {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.advice-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.amount-display {
  margin-top: 10px;
  font-size: 1.1rem;
}

.amount {
  font-weight: bold;
  color: #28a745;
}

.risk-characteristics {
  padding-left: 20px;
  margin: 10px 0;
}

.risk-characteristics li {
  margin-bottom: 5px;
}

.conservative {
  color: #17a2b8;
}

.moderate {
  color: #28a745;
}

.aggressive {
  color: #dc3545;
}

.allocation-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.allocation-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.allocation-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.allocation-name {
  font-weight: bold;
}

.allocation-percentage {
  font-weight: bold;
}

.allocation-amount {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.allocation-bar {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
}

.allocation-fill {
  height: 100%;
  border-radius: 4px;
}

.allocation-fill.conservative {
  background-color: #17a2b8;
}

.allocation-fill.moderate {
  background-color: #28a745;
}

.allocation-fill.aggressive {
  background-color: #dc3545;
}

.allocation-description {
  font-size: 0.9rem;
  color: #666;
}

.no-allocation-advice {
  background-color: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid #ffeaa7;
}

.strategy-points {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.strategy-point {
  display: flex;
  gap: 15px;
}

.strategy-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: bold;
}

.strategy-content h5 {
  margin: 0 0 5px 0;
  color: #333;
}

.strategy-content p {
  margin: 0;
  color: #666;
}

.disclaimer {
  margin-top: 30px;
  padding: 15px;
  background-color: #fff8e1;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.disclaimer p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .financial-health {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .allocation-chart {
    grid-template-columns: 1fr;
  }
  
  .strategy-point {
    flex-direction: column;
    gap: 5px;
  }
}
</style>