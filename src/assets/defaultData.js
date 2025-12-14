// 默认数据
export const defaultTransactions = [
  {
    id: 1,
    type: 'income',
    description: '工资收入',
    amount: 8000,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10) // 一个月前
  },
  {
    id: 2,
    type: 'expense',
    description: '房租',
    amount: 2500,
    date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
  },
  {
    id: 3,
    type: 'expense',
    description: '超市购物',
    amount: 350,
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
  },
  {
    id: 4,
    type: 'expense',
    description: '交通费用',
    amount: 200,
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
  },
  {
    id: 5,
    type: 'expense',
    description: '餐饮娱乐',
    amount: 500,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
  }
];

export const defaultInvestments = [
  {
    id: 1,
    type: '股票',
    name: '科技龙头股',
    quantity: 100,
    purchasePrice: 100,
    currentPrice: 120,
    purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10) // 两个月前
  },
  {
    id: 2,
    type: '基金',
    name: '沪深300指数基金',
    quantity: 500,
    purchasePrice: 5,
    currentPrice: 4.8,
    purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
  },
  {
    id: 3,
    type: '债券',
    name: '国债',
    quantity: 10,
    purchasePrice: 1000,
    currentPrice: 1010,
    purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10) // 三个月前
  }
];

export const defaultData = {
  transactions: defaultTransactions,
  investments: defaultInvestments
};