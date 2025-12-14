# 个人财务管理系统

一个基于Vue.js的个人财务管理应用程序，帮助您跟踪收支、管理投资并获得个性化的投资建议。

> 本项目基于vibe coding理念实现，强调代码的流畅性、一致性和良好的开发体验。

## 功能特性

### 1. 看板
- 显示财务概览（总收入、总支出、账户余额、投资总额）
- 提供图表可视化：
  * 收支趋势图（折线图，显示每月收入和支出变化）
  * 支出分类图（饼图，显示各类支出占比）
  * 投资收益趋势图（柱状图，显示各投资项目收益情况）

### 2. 收支
- 添加收入和支出记录
- 查看交易历史
- 实时计算总收入、总支出和账户余额
- 支持自定义交易类型（收入/支出明细）

### 3. 投资
- 添加和管理投资项目（股票、基金、债券等）
- 跟踪投资数量、买入价格和当前价格
- 实时计算投资总价值和盈亏情况
- 支持自定义投资类型
- 提供个性化投资建议

### 4. 管理
- 支持自定义投资类型和交易类型
- 所有类型存储在localStorage中
- 提供图形化界面管理所有类型
- 数据导入导出功能（JSON格式）
- 数据清除功能

## 技术栈

- Vue.js 3 (原生JavaScript，无需构建工具)
- HTML5
- CSS3 (含Flexbox和Grid布局)
- localStorage API (数据持久化)
- Element Plus (UI组件库)
- Element Plus Icons (图标库)
- Chart.js (图表可视化)

## 项目结构

```
financial-planning/
├── index.html              # 应用入口文件
├── 404.html                # GitHub Pages SPA重定向文件
├── manifest.json           # PWA配置文件
├── sw.js                   # Service Worker文件
├── package.json            # 项目配置文件
├── README.md               # 项目说明文档
├── .claude                 # Claude提示词文件
├── vite.config.js          # Vite配置文件
├── src/                    # 源代码目录
│   ├── main.js             # Vue应用入口
│   ├── App.vue             # 主应用组件
│   ├── utils/              # 工具函数目录
│   │   └── TypeManager.js  # 类型管理工具
│   ├── assets/             # 静态资源
│   ├── components/         # Vue组件
│   │   ├── SummarySection.vue      # 摘要展示组件
│   │   ├── TypeManagement.vue      # 类型管理组件
│   │   ├── dashboard/              # 仪表盘组件目录
│   │   │   └── Dashboard.vue       # 数据看板组件
│   │   ├── transactions/           # 交易相关组件目录
│   │   │   ├── TransactionForm.vue # 交易表单组件
│   │   │   ├── TransactionList.vue # 交易列表组件
│   │   │   ├── TransactionPage.vue # 交易页面组件
│   │   │   └── TransactionsView.vue# 财务记录视图组件
│   │   └── investments/            # 投资相关组件目录
│   │       ├── InvestmentManagement.vue # 投资管理组件
│   │       ├── InvestmentSummary.vue   # 投资摘要组件
│   │       ├── InvestmentForm.vue      # 投资表单组件
│   │       ├── InvestmentList.vue      # 投资列表组件
│   │       ├── InvestmentAdvice.vue    # 投资建议组件
│   │       ├── InvestmentCalculator.vue # 投资计算器组件
│   │       └── InvestmentPage.vue      # 投资页面组件
└── docs/                   # 文档目录
```

## 快速开始

### 运行项目

1. 克隆或下载项目到本地
2. 在项目根目录下启动HTTP服务器:
   ```bash
   # 使用Python内置服务器
   python3 -m http.server 8000
   
   # 或使用npm脚本
   npm start
   ```
3. 在浏览器中打开 `http://localhost:8000`

### 部署到GitHub Pages

1. 在GitHub上创建一个新的仓库
2. 将项目推送到该仓库
3. 在仓库设置中启用GitHub Pages，选择`master`分支作为源
4. 应用将自动部署到`https://<username>.github.io/<repository>/`

应用支持离线使用，首次加载后会缓存所有必要资源，即使在网络不可用的情况下也能正常使用。

### 使用说明

1. **看板**
   - 切换到"看板"标签页
   - 查看财务概览、收支趋势图、支出分类图和投资收益趋势图

2. **收支**
   - 切换到"收支"标签页
   - 点击"添加交易"按钮添加新的收入或支出记录
   - 可以编辑或删除已有记录

3. **投资**
   - 切换到"投资"标签页
   - 点击"添加投资"按钮添加新的投资项目
   - 可以编辑或删除已有投资项目

4. **管理**
   - 切换到"管理"标签页
   - 可以自定义投资类型和交易类型（收入/支出明细）
   - 修改后点击"保存类型设置"生效
   - 可以导出数据到JSON文件或从JSON文件导入数据
   - 可以清除所有数据

## 投资建议算法

系统根据以下规则提供投资建议：

1. **资金充足时**（余额大于紧急备用金）:
   - 紧急备用金：基于过去6个月平均月支出×3个月
   - 稳健型理财：根据风险评估结果分配比例
   - 基金投资：根据风险评估结果分配比例
   - 股票投资：根据风险评估结果分配比例

2. **资金不足时**:
   - 建议优先建立紧急备用金

## 数据持久化

所有数据都保存在浏览器的localStorage中，具有以下特点：
- 数据在页面刷新或关闭后不会丢失
- 不同浏览器或设备间数据不共享
- 提供数据导入导出功能
- 提供"清除所有数据"按钮用于手动清空数据

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 开发说明

该项目使用Vue 3 Composition API构建，采用单文件组件(SFC)格式，但无需构建步骤即可直接在浏览器中运行。

项目基于vibe coding理念实现，注重：
- 代码的流畅性和一致性
- 良好的开发体验
- 组件间的和谐协作
- 用户界面的顺畅交互

### 项目重构

为了提高代码的可维护性和组织性，项目进行了以下重构：
1. 按功能模块将组件分组到子目录中（dashboard、transactions、investments）
2. 统一了组件的样式和间距规范
3. 优化了组件间的引用关系

## 关于vibe coding

vibe coding是一种编程理念，强调代码不仅要功能正确，还要传达正确的"氛围"或"感觉"。在本项目中体现为：
- 组件之间的一致性和协调性
- 用户界面的流畅交互体验
- 代码结构的清晰和优雅
- 功能模块间的自然衔接

## 许可证

MIT License

## 免责声明

本软件提供的投资建议仅供参考，不构成具体投资意见。投资有风险，请谨慎决策。