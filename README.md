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
- 投资计算器支持独立调整各项投资比例

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
3. 在仓库设置中启用GitHub Pages，选择`gh-pages`分支作为源
4. 访问`https://<username>.github.io/<repository>/`即可使用应用

## 设计特色

### iOS风格界面
- 采用现代化的iOS风格设计语言
- 桌面端使用毛玻璃效果的侧边栏导航
- 移动端使用毛玻璃效果的底部导航栏
- 全屏体验，内容占据整个屏幕空间

### 响应式设计
- 自动适配桌面和移动设备
- 桌面端显示侧边栏导航
- 移动端显示底部导航栏

### 数据可视化
- 使用Chart.js实现丰富的图表展示
- 收支趋势图帮助了解财务变化
- 支出分类图直观显示消费结构
- 投资收益图展示投资表现

## 数据持久化

所有数据都存储在浏览器的localStorage中，包括：
- 交易记录
- 投资项目
- 自定义类型设置

数据会在页面刷新或关闭后自动保存，不会丢失。

## 核心算法

### 投资建议算法
系统根据用户的财务状况提供个性化的投资建议：
1. 计算紧急备用金（基于过去6个月平均月支出 × 3个月）
2. 评估可投资金额（账户余额 - 紧急备用金）
3. 根据风险偏好推荐投资组合：
   - 紧急备用金：10%
   - 稳健理财：30%
   - 基金投资：40%
   - 股票投资：20%

### 投资收益计算
- 单项投资收益 = 投资金额 × 预期年化收益率
- 整体年化收益率 = 总预期收益 / 总投资金额
- 整体资产收益率 = 总预期收益 / 用户总资产

## 开发指南

### 项目结构说明
- `src/App.vue`: 主应用组件，负责整体布局和路由
- `src/components/`: 所有Vue组件按功能模块组织
- `src/utils/TypeManager.js`: 类型管理工具，处理自定义类型的存储和读取

### 组件设计原则
1. 高内聚低耦合：每个组件只关注特定功能
2. 可复用性：通用组件可在多个地方使用
3. 响应式：所有组件都能适应不同屏幕尺寸
4. 易维护：代码结构清晰，易于理解和修改

### 数据流管理
1. 父组件通过props向子组件传递数据
2. 子组件通过events向父组件发送消息
3. 持久化数据通过localStorage存储和读取
4. 类型数据通过TypeManager工具统一管理

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License

## 免责声明

本软件提供的投资建议仅供参考，不构成具体投资意见。投资有风险，请谨慎决策。