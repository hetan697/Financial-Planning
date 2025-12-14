<template>
  <div class="transaction-list">
    <el-table 
      :data="transactions" 
      style="width: 100%" 
      :default-sort="{ prop: 'date', order: 'descending' }"
    >
      <el-table-column prop="date" label="日期" sortable width="120">
        <template #default="scope">
          {{ formatDate(scope.row.date) }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'">
            {{ scope.row.type === 'income' ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="明细" />
      <el-table-column prop="notes" label="备注" />
      <el-table-column prop="amount" label="金额" sortable>
        <template #default="scope">
          <span :class="scope.row.type === 'income' ? 'income' : 'expense'">
            {{ scope.row.type === 'income' ? '+' : '-' }}¥{{ scope.row.amount.toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="$emit('edit-transaction', scope.row)">
            编辑
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="$emit('delete-transaction', scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div v-if="transactions.length === 0" class="no-transactions">
      <p>暂无交易记录</p>
    </div>
  </div>
</template>

<script>
import { 
  ElTable, 
  ElTableColumn,
  ElTag,
  ElButton
} from 'element-plus';

export default {
  name: 'TransactionList',
  components: {
    ElTable,
    ElTableColumn,
    ElTag,
    ElButton
  },
  props: {
    transactions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['delete-transaction', 'edit-transaction'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    }
  }
};
</script>

<style scoped>
.income {
  color: #f56c6c;
  font-weight: bold;
}

.expense {
  color: #67c23a;
  font-weight: bold;
}

.no-transactions {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}
</style>