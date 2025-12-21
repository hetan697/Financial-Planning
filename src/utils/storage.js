
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finance_transactions',
  INVESTMENTS: 'finance_investments',
  INVESTMENT_TYPES: 'finance_investment_types',
  TRANSACTION_TYPES: 'finance_transaction_types',
  CALCULATOR_CONFIG: 'finance_calculator_config',
};

const DEFAULT_TYPES = {
  income: ['工资', '奖金', '投资收益', '兼职收入', '礼金', '其他收入'],
  expense: ['房租', '水电费', '餐饮', '交通', '购物', '娱乐', '医疗', '教育', '保险', '投资支出', '其他支出'],
  investment: ['股票', '基金', '债券', '理财产品', '加密货币', '房产', '其他'],
};

export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTION_TYPES)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTION_TYPES, JSON.stringify({
      income: DEFAULT_TYPES.income,
      expense: DEFAULT_TYPES.expense
    }));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.INVESTMENT_TYPES)) {
    localStorage.setItem(STORAGE_KEYS.INVESTMENT_TYPES, JSON.stringify(DEFAULT_TYPES.investment));
  }
};

export const storage = {
  // Transactions
  getTransactions: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]'),
  saveTransactions: (data) => localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data)),
  
  // Investments
  getInvestments: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.INVESTMENTS) || '[]'),
  saveInvestments: (data) => localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(data)),
  
  // Types
  getTransactionTypes: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTION_TYPES) || JSON.stringify({ income: [], expense: [] })),
  saveTransactionTypes: (data) => localStorage.setItem(STORAGE_KEYS.TRANSACTION_TYPES, JSON.stringify(data)),
  
  getInvestmentTypes: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.INVESTMENT_TYPES) || '[]'),
  saveInvestmentTypes: (data) => localStorage.setItem(STORAGE_KEYS.INVESTMENT_TYPES, JSON.stringify(data)),

  // Calculator
  getCalculatorConfig: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.CALCULATOR_CONFIG) || '[]'),
  saveCalculatorConfig: (data) => localStorage.setItem(STORAGE_KEYS.CALCULATOR_CONFIG, JSON.stringify(data)),

  // Data Management
  exportData: () => {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([key, value]) => {
      data[key] = localStorage.getItem(value);
    });
    return JSON.stringify(data);
  },
  
  importData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      Object.entries(STORAGE_KEYS).forEach(([key, value]) => {
        if (data[key]) {
          localStorage.setItem(value, data[key]);
        }
      });
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },
  
  clearData: () => {
    // Keep types, clear data
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INVESTMENTS);
    localStorage.removeItem(STORAGE_KEYS.CALCULATOR_CONFIG);
  }
};
