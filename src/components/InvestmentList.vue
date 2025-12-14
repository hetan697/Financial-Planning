<template>
  <el-card class="investments">
    <template #header>
      <div class="card-header">
        <span>投资组合</span>
        <el-button 
          type="primary" 
          @click="addInvestment"
          class="add-button"
        >
          添加投资
        </el-button>
      </div>
    </template>
    
    <div v-if="investments.length === 0" class="no-investments">
      <el-empty description="暂无投资记录">
        <p>点击上方"添加投资"按钮录入您的第一条投资信息</p>
      </el-empty>
    </div>
    
    <div v-else>
      <el-table 
        :data="investments" 
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" />
        
        <el-table-column prop="type" label="类型" width="100" />
        
        <el-table-column label="买入日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.purchaseDate) }}
          </template>
        </el-table-column>
        
        <el-table-column label="数量" width="100">
          <template #default="scope">
            {{ scope.row.quantity }}
          </template>
        </el-table-column>
        
        <el-table-column label="买入价" width="100">
          <template #default="scope">
            ¥{{ scope.row.purchasePrice.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="当前价" width="100">
          <template #default="scope">
            <span v-if="scope.row.currentPrice !== null">
              ¥{{ scope.row.currentPrice.toFixed(2) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="总价值" width="120">
          <template #default="scope">
            ¥{{ currentValue(scope.row).toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column label="盈亏" width="150">
          <template #default="scope">
            <span :class="profitClass(scope.row)">
              {{ profit(scope.row) >= 0 ? '+' : '' }}¥{{ profit(scope.row).toFixed(2) }}
              ({{ profitPercent(scope.row).toFixed(2) }}%)
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="editInvestment(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteInvestment(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script>
import { 
  ElCard, 
  ElTable, 
  ElTableColumn, 
  ElButton, 
  ElEmpty 
} from 'element-plus';

export default {
  name: 'InvestmentList',
  components: {
    ElCard,
    ElTable,
    ElTableColumn,
    ElButton,
    ElEmpty
  },
  props: {
    investments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['delete-investment', 'edit-investment', 'add-investment'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    },
    currentValue(investment) {
      const price = investment.currentPrice !== null ? 
        investment.currentPrice : investment.purchasePrice;
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
    },
    addInvestment() {
      this.$emit('add-investment');
    }
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button {
  margin-left: auto;
}

.no-investments p {
  color: #999;
  font-style: italic;
}

.profit {
  color: #f56c6c;
  font-weight: bold;
}

.loss {
  color: #67c23a;
  font-weight: bold;
}
</style>