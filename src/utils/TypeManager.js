// 类型管理工具
class TypeManager {
  // 默认投资类型
  static defaultInvestmentTypes = ['股票', '基金', '债券', '其他'];
  
  // 默认交易类型
  static defaultTransactionTypes = {
    income: ['工资', '奖金', '投资收益', '兼职收入', '礼金', '其他收入'],
    expense: ['房租', '水电费', '餐饮', '交通', '购物', '娱乐', '医疗', '教育', '保险', '投资支出', '其他支出']
  };

  // 获取投资类型
  static getInvestmentTypes() {
    try {
      const types = localStorage.getItem('investmentTypes');
      return types ? JSON.parse(types) : this.defaultInvestmentTypes;
    } catch (error) {
      console.error('Failed to parse investment types from localStorage:', error);
      return this.defaultInvestmentTypes;
    }
  }

  // 设置投资类型
  static setInvestmentTypes(types) {
    try {
      localStorage.setItem('investmentTypes', JSON.stringify(types));
    } catch (error) {
      console.error('Failed to save investment types to localStorage:', error);
    }
  }

  // 获取交易类型
  static getTransactionTypes() {
    try {
      const types = localStorage.getItem('transactionTypes');
      return types ? JSON.parse(types) : this.defaultTransactionTypes;
    } catch (error) {
      console.error('Failed to parse transaction types from localStorage:', error);
      return this.defaultTransactionTypes;
    }
  }

  // 设置交易类型
  static setTransactionTypes(types) {
    try {
      localStorage.setItem('transactionTypes', JSON.stringify(types));
    } catch (error) {
      console.error('Failed to save transaction types to localStorage:', error);
    }
  }

  // 初始化类型数据
  static initialize() {
    // 如果localStorage中没有类型数据，则初始化为默认值
    if (!localStorage.getItem('investmentTypes')) {
      this.setInvestmentTypes(this.defaultInvestmentTypes);
    }
    
    if (!localStorage.getItem('transactionTypes')) {
      this.setTransactionTypes(this.defaultTransactionTypes);
    }
  }
}

export default TypeManager;