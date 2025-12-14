// 类型管理工具
class TypeManager {
  // 默认投资类型
  static defaultInvestmentTypes = ['股票', '基金', '债券', '其他'];
  
  // 默认交易类型
  static defaultTransactionTypes = {
    income: ['工资', '奖金', '投资收益', '兼职收入', '礼金', '其他收入'],
    expense: ['房租', '水电费', '餐饮', '交通', '购物', '娱乐', '医疗', '教育', '保险', '投资支出', '其他支出']
  };
  
  // 默认投资计算器选项
  static defaultInvestmentOptions = [
    { 
      type: '紧急备用金',
      name: '紧急备用金', 
      percentage: 10, 
      returnRate: 2.0 
    },
    { 
      type: '股票',
      name: '股票投资', 
      percentage: 30, 
      returnRate: 8.0 
    },
    { 
      type: '基金',
      name: '基金投资', 
      percentage: 40, 
      returnRate: 6.0 
    },
    { 
      type: '债券',
      name: '债券投资', 
      percentage: 20, 
      returnRate: 4.0 
    }
  ];

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
      // 触发自定义事件通知其他组件类型已更新
      window.dispatchEvent(new CustomEvent('typesUpdated'));
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
      // 触发自定义事件通知其他组件类型已更新
      window.dispatchEvent(new CustomEvent('typesUpdated'));
    } catch (error) {
      console.error('Failed to save transaction types to localStorage:', error);
    }
  }
  
  // 获取投资计算器选项
  static getInvestmentOptions() {
    try {
      const options = localStorage.getItem('investmentOptions');
      return options ? JSON.parse(options) : this.defaultInvestmentOptions;
    } catch (error) {
      console.error('Failed to parse investment options from localStorage:', error);
      return this.defaultInvestmentOptions;
    }
  }
  
  // 设置投资计算器选项
  static setInvestmentOptions(options) {
    try {
      localStorage.setItem('investmentOptions', JSON.stringify(options));
    } catch (error) {
      console.error('Failed to save investment options to localStorage:', error);
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
    
    if (!localStorage.getItem('investmentOptions')) {
      this.setInvestmentOptions(this.defaultInvestmentOptions);
    }
  }
}

export default TypeManager;