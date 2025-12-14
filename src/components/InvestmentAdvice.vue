<template>
  <div class="investment-advice">
    <h3>投资建议</h3>
    <p>根据您当前的财务状况，我们为您提供以下投资建议：</p>
    <div class="advice-list">
      <div v-for="(item, index) in advice" :key="index" class="advice-item">
        <div class="advice-header">
          <h4>{{ item.name }}</h4>
          <span v-if="item.proportion" class="proportion">{{ item.proportion }}%</span>
        </div>
        <p>{{ item.message }}</p>
        <div v-if="item.amount" class="amount-bar">
          <div class="amount-fill" :style="{ width: item.proportion + '%' }"></div>
        </div>
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
    advice() {
      if (this.balance <= 0) {
        return [
          { name: '财务状况分析', message: '您的当前余额为负，请优先考虑增加收入或减少支出。' }
        ];
      }

      // 根据余额给出不同的分配建议
      let advice = [];
      
      // 计算紧急备用金（假设月支出为总收入的60%）
      const monthlyExpense = this.balance * 0.6;
      const emergencyFund = monthlyExpense * this.emergencyFundMonths;
      
      if (this.balance > emergencyFund) {
        // 如果资金充足，提供详细的投资分配建议
        const availableFund = this.balance - emergencyFund;
        advice = [
          { 
            name: '紧急备用金', 
            amount: emergencyFund,
            proportion: (emergencyFund / this.balance * 100).toFixed(1),
            message: `建议保留¥${emergencyFund.toFixed(2)}作为紧急备用金（${this.emergencyFundMonths}个月生活费）`
          },
          { 
            name: '稳健型理财', 
            amount: availableFund * 0.3,
            proportion: (availableFund * 0.3 / this.balance * 100).toFixed(1),
            message: `建议投入¥${(availableFund * 0.3).toFixed(2)}于稳健型理财产品`
          },
          { 
            name: '基金投资', 
            amount: availableFund * 0.4,
            proportion: (availableFund * 0.4 / this.balance * 100).toFixed(1),
            message: `建议投入¥${(availableFund * 0.4).toFixed(2)}于基金投资`
          },
          { 
            name: '股票投资', 
            amount: availableFund * 0.2,
            proportion: (availableFund * 0.2 / this.balance * 100).toFixed(1),
            message: `建议投入¥${(availableFund * 0.2).toFixed(2)}于股票投资`
          },
          { 
            name: '保险配置', 
            amount: availableFund * 0.1,
            proportion: (availableFund * 0.1 / this.balance * 100).toFixed(1),
            message: `建议投入¥${(availableFund * 0.1).toFixed(2)}于保险配置`
          }
        ];
      } else {
        // 资金不足时，建议先建立紧急备用金
        advice = [
          { 
            name: '紧急备用金建设', 
            amount: this.balance,
            proportion: '100',
            message: `您的资金尚不足以建立充足的紧急备用金，建议将全部¥${this.balance.toFixed(2)}用于此目的`
          }
        ];
      }
      
      return advice;
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

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.advice-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.advice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.advice-header h4 {
  font-size: 1.1rem;
  color: #333;
}

.proportion {
  font-weight: bold;
  color: #667eea;
}

.amount-bar {
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  margin-top: 10px;
  overflow: hidden;
}

.amount-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 5px;
}

.disclaimer {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff8e1;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.disclaimer p {
  font-size: 0.9rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .advice-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>