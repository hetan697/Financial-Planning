<template>
  <div class="investment-list">
    <el-table 
      :data="investments" 
      style="width: 100%"
    >
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="quantity" label="数量" width="100" />
      <el-table-column prop="purchasePrice" label="买入价" width="100">
        <template #default="scope">
          ¥{{ scope.row.purchasePrice.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="currentPrice" label="当前价" width="100">
        <template #default="scope">
          <span v-if="scope.row.currentPrice !== null">
            ¥{{ scope.row.currentPrice.toFixed(2) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="当前价值" width="120">
        <template #default="scope">
          ¥{{ calculateCurrentValue(scope.row).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="收益" width="120">
        <template #default="scope">
          <span :class="calculateProfit(scope.row) >= 0 ? 'profit-positive' : 'profit-negative'">
            ¥{{ calculateProfit(scope.row).toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="$emit('edit-investment', scope.row)">
            编辑
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="$emit('delete-investment', scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div v-if="investments.length === 0" class="no-investments">
      <p>暂无投资记录</p>
    </div>
  </div>
</template>

<script>
import { 
  ElTable, 
  ElTableColumn, 
  ElButton 
} from 'element-plus';

export default {
  name: 'InvestmentList',
  components: {
    ElTable,
    ElTableColumn,
    ElButton
  },
  props: {
    investments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['delete-investment', 'edit-investment'],
  methods: {
    calculateCurrentValue(investment) {
      const price = investment.currentPrice !== null ? 
        investment.currentPrice : investment.purchasePrice;
      return price * investment.quantity;
    },
    calculateProfit(investment) {
      return (investment.currentPrice - investment.purchasePrice) * investment.quantity || 0;
    }
  }
};
</script>

<style scoped>
.profit-positive {
  color: #f56c6c;
  font-weight: bold;
}

.profit-negative {
  color: #67c23a;
  font-weight: bold;
}

.no-investments {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}
</style>