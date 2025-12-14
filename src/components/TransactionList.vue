<template>
  <el-card class="transactions">
    <template #header>
      <div class="card-header">
        <span>交易记录</span>
      </div>
    </template>
    
    <div v-if="transactions.length === 0" class="no-transactions">
      <el-empty description="暂无交易记录">
        <p class="help-text">点击上方"添加交易"区域录入您的第一条交易记录</p>
      </el-empty>
    </div>
    
    <div v-else>
      <el-table 
        :data="transactions" 
        style="width: 100%" 
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="date" label="日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="明细" />
        
        <el-table-column prop="notes" label="备注" />
        
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            <span :class="scope.row.type">
              ¥{{ scope.row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="editTransaction(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteTransaction(scope.row.id)"
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
  name: 'TransactionList',
  components: {
    ElCard,
    ElTable,
    ElTableColumn,
    ElButton,
    ElEmpty
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
    },
    deleteTransaction(id) {
      this.$emit('delete-transaction', id);
    },
    editTransaction(transaction) {
      this.$emit('edit-transaction', transaction);
    },
    tableRowClassName({ row }) {
      if (row.type === 'income') {
        return 'income-row';
      } else if (row.type === 'expense') {
        return 'expense-row';
      }
      return '';
    }
  }
};
</script>

<style scoped>
.transactions {
  margin-bottom: 30px;
}

.card-header {
  font-weight: bold;
  font-size: 1.1rem;
}

.no-transactions {
  text-align: center;
  padding: 40px 20px;
}

.help-text {
  font-style: italic;
  color: #667eea;
  margin-top: 15px;
}
</style>