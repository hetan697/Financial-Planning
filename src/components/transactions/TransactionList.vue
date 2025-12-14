<template>
  <div class="transactions">
    <div class="header">
      <h2>交易记录</h2>
      <button @click="addTransaction" class="add-btn">添加交易</button>
    </div>
    
    <div v-if="transactions.length === 0" class="no-transactions">
      <div class="empty-state">
        <div class="empty-icon">💰</div>
        <h3>暂无交易记录</h3>
        <p>您还没有添加任何交易记录</p>
        <p class="help-text">点击上方"添加交易"按钮录入您的第一条交易信息</p>
      </div>
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
            <button @click="editTransaction(scope.row)" class="edit-btn">编辑</button>
            <button @click="deleteTransaction(scope.row.id)" class="delete-btn">删除</button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
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
  emits: ['delete-transaction', 'edit-transaction', 'add-transaction'],
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
    addTransaction() {
      this.$emit('add-transaction');
    },
  }
};
</script>

<style scoped>
.transactions {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.transactions h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.add-btn:hover {
  background-color: #337ecc;
}

.no-transactions {
  text-align: center;
  padding: 40px 20px;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #666;
}

.empty-state p {
  color: #999;
  margin-bottom: 5px;
}

.help-text {
  font-style: italic;
  margin-top: 15px;
  color: #667eea;
}

.income {
  color: #f56c6c;
  font-weight: bold;
}

.expense {
  color: #67c23a;
  font-weight: bold;
}

.edit-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 5px;
}

.edit-btn:hover {
  background-color: #138496;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

@media (max-width: 768px) {
  .transactions {
    padding: 10px;
  }
}
</style>