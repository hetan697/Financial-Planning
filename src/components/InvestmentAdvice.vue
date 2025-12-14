<template>
  <div class="investment-advice">
    <div class="advice-summary">
      <p>根据您当前的财务状况，我们为您提供以下投资建议：</p>
      <div class="financial-health" v-if="balance > 0">
        <span>财务健康度: </span>
        <el-progress 
          :percentage="healthPercentage" 
          :status="healthLevelStatus"
          :stroke-width="12"
          :show-text="true"
        />
        <span class="health-text" :class="healthLevel">{{ healthText }}</span>
      </div>
      <div v-else-if="balance < 0" class="negative-balance-warning">
        <el-alert
          title="您的账户余额为负，建议优先增加收入或减少支出"
          type="error"
          show-icon
        />
      </div>
      <div v-else class="zero-balance-info">
        <el-alert
          title="您还没有添加任何交易记录，建议先添加收支信息以便获取个性化投资建议"
          type="info"
          show-icon
        />
      </div>
    </div>
    
    <el-tabs type="border-card">
      <el-tab-pane label="💰 紧急备用金">
        <div class="advice-section">
          <p>{{ emergencyFundAdvice.message }}</p>
          <div v-if="emergencyFundAdvice.amount" class="amount-display">
            建议金额: <span class="amount">¥{{ emergencyFundAdvice.amount.toFixed(2) }}</span>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="📊 风险评估">
        <div class="advice-section">
          <p>根据您的资产情况，您的风险承受能力为：<strong :class="riskLevel.class">{{ riskLevel.label }}</strong></p>
          <el-alert
            :title="characteristic"
            v-for="(characteristic, index) in riskLevel.characteristics"
            :key="index"
            type="info"
            style="margin-bottom: 10px;"
          />
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="📈 投资组合">
        <div class="advice-section">
          <p>{{ investmentAllocation.message }}</p>
          <div class="allocation-chart" v-if="Object.keys(investmentAllocation.details).length > 0">
            <el-row :gutter="20">
              <el-col 
                v-for="(detail, key) in investmentAllocation.details" 
                :key="key"
                :span="8"
                :xs="24"
              >
                <el-card class="allocation-item">
                  <div class="allocation-header">
                    <span class="allocation-name">{{ detail.name }}</span>
                    <span class="allocation-percentage">{{ detail.percentage }}%</span>
                  </div>
                  <div class="allocation-amount">¥{{ detail.amount.toFixed(2) }}</div>
                  <div class="allocation-bar">
                    <el-progress 
                      :percentage="detail.percentage" 
                      :show-text="false"
                      :stroke-width="8"
                      :color="getInvestmentColor(key)"
                    />
                  </div>
                  <div class="allocation-description">{{ detail.description }}</div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          <div v-else class="no-allocation-advice">
            <el-alert
              title="当前暂无具体的投资分配建议。建议您先建立足够的紧急备用金后再考虑投资。"
              type="warning"
              show-icon
            />
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="🧭 投资策略">
        <div class="advice-section">
          <el-timeline>
            <el-timeline-item
              v-for="(strategy, index) in investmentStrategies"
              :key="index"
              :timestamp="'策略 ' + (index + 1)"
              placement="top"
            >
              <el-card>
                <h4>{{ strategy.title }}</h4>
                <p>{{ strategy.description }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="📅 定期复查">
        <div class="advice-section">
          <p>{{ reviewAdvice.message }}</p>
          <el-alert
            :title="tip"
            v-for="(tip, index) in reviewAdvice.tips"
            :key="index"
            type="success"
            style="margin-bottom: 10px;"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <div class="disclaimer">
      <el-alert
        title="以上仅为一般性投资建议，不构成具体投资意见。投资有风险，请谨慎决策。"
        type="warning"
        show-icon
      />
    </div>
  </div>
</template>

<script>
import { 
  ElProgress, 
  ElAlert, 
  ElTabs, 
  ElTabPane, 
  ElRow, 
  ElCol, 
  ElCard, 
  ElTimeline, 
  ElTimelineItem 
} from 'element-plus';

export default {
  name: 'InvestmentAdvice',
  components: {
    ElProgress,
    ElAlert,
    ElTabs,
    ElTabPane,
    ElRow,
    ElCol,
    ElCard,
    ElTimeline,
    ElTimelineItem
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
      
      // 计算月均支出
      const totalExpense = recentExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
      const monthsCount = Math.min(6, this.getMonthsCovered(recentExpenses));
      const averageMonthlyExpense = monthsCount > 0 ? totalExpense / monthsCount : 0;
      
      // 紧急备用金通常为3-6个月的支出
      const emergencyFund = averageMonthlyExpense * this.emergencyFundMonths;
      
      if (this.balance <= emergencyFund) {
        return {
          message: `您的资金尚不足以建立充足的紧急备用金（建议金额: ¥${emergencyFund.toFixed(2)}），建议优先储备紧急资金。`,
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
      
      // 发送分配建议给父组件
      this.$emit('allocation-change', allocation);
      
      return {
        message: `根据您的风险承受能力(${this.riskLevel.label})和财务状况，建议按以下方式分配投资资金：`,
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
    getInvestmentColor(type) {
      const colors = {
        conservative: '#17a2b8',
        moderate: '#28a745',
        aggressive: '#dc3545'
      };
      return colors[type] || '#667eea';
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
    }
  }
};
</script>

<style scoped>
.investment-advice {
  margin-bottom: 30px;
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

.health-text {
  font-weight: bold;
  min-width: 60px;
  text-align: center;
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
}

.advice-section {
  padding: 20px 0;
}

.amount-display {
  margin-top: 10px;
  font-size: 1.1rem;
}

.amount {
  font-weight: bold;
  color: #28a745;
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
  margin-top: 15px;
}

.allocation-item {
  margin-bottom: 20px;
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

.allocation-description {
  font-size: 0.9rem;
  color: #666;
  margin-top: 10px;
}

.no-allocation-advice {
  margin-top: 15px;
}

.disclaimer {
  margin-top: 30px;
}
</style>