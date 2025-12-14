<template>
  <section class="investments">
    <h2>投资组合</h2>
    <div v-if="investments.length === 0" class="no-investments">
      暂无投资记录
    </div>
    <div v-else class="investment-list">
      <div 
        class="investment-item"
        v-for="investment in investments" 
        :key="investment.id"
      >
        <div class="investment-info">
          <h4>{{ investment.name }}</h4>
          <p>类型: {{ investment.type }} | 买入日期: {{ formatDate(investment.purchaseDate) }}</p>
        </div>
        <div class="investment-details">
          <span>数量: {{ investment.quantity }}</span>
          <span>买入价: ¥{{ investment.purchasePrice.toFixed(2) }}</span>
          <span v-if="investment.currentPrice">当前价: ¥{{ investment.currentPrice.toFixed(2) }}</span>
        </div>
        <div class="investment-value">
          <div>总价值: ¥{{ currentValue(investment).toFixed(2) }}</div>
          <div :class="profitClass(investment)">盈亏: ¥{{ profit(investment).toFixed(2) }} ({{ profitPercent(investment).toFixed(2) }}%)</div>
        </div>
        <div class="investment-actions">
          <button @click="editInvestment(investment)" class="edit-btn">编辑</button>
          <button @click="deleteInvestment(investment.id)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'InvestmentList',
  props: {
    investments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['delete-investment', 'edit-investment'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    currentValue(investment) {
      const price = investment.currentPrice || investment.purchasePrice;
      return price * investment.quantity;
    },
    profit(investment) {
      return (investment.currentPrice - investment.purchasePrice) * investment.quantity || 0;
    },
    profitClass(investment) {
      return {
        'profit': this.profit(investment) >= 0,
        'loss': this.profit(investment) < 0
      };
    },
    profitPercent(investment) {
      if (!investment.currentPrice) return 0;
      return ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
    },
    deleteInvestment(id) {
      this.$emit('delete-investment', id);
    },
    editInvestment(investment) {
      this.$emit('edit-investment', investment);
    }
  }
};
</script>

<style scoped>
/* 投资记录 */
.investments {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.investments h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.no-investments {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-style: italic;
}

.investment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.investment-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #fafafa;
  transition: box-shadow 0.2s;
}

.investment-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.investment-info {
  flex: 1;
}

.investment-info h4 {
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.investment-info p {
  color: #777;
  font-size: 0.9rem;
}

.investment-details {
  display: flex;
  gap: 15px;
  margin-right: 15px;
  font-size: 0.9rem;
  color: #666;
}

.investment-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 15px;
}

.investment-value .profit {
  color: #4caf50;
}

.investment-value .loss {
  color: #f44336;
}

.investment-actions {
  display: flex;
  gap: 10px;
}

.edit-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit-btn:hover {
  background-color: #138496;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .investment-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .investment-details {
    margin: 10px 0;
  }
  
  .investment-details {
    flex-wrap: wrap;
  }
  
  .investment-value {
    margin: 10px 0;
  }
  
  .investment-actions {
    align-self: flex-end;
  }
}
</style>