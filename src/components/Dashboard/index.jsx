
import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined, PayCircleOutlined } from '@ant-design/icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { storage } from '../../utils/storage';
import dayjs from 'dayjs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const [data, setData] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        totalInvestment: 0,
        investmentProfit: 0,
    });

    const [chartData, setChartData] = useState({
        trend: { labels: [], datasets: [] },
        expense: { labels: [], datasets: [] },
        investment: { labels: [], datasets: [] },
    });

    useEffect(() => {
        const transactions = storage.getTransactions();
        const investments = storage.getInvestments();

        calculateStats(transactions, investments);
        prepareCharts(transactions, investments);
    }, []);

    const calculateStats = (transactions, investments) => {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalInvestment = investments.reduce((sum, i) => sum + i.value, 0);
        const investmentCost = investments.reduce((sum, i) => sum + i.cost, 0);

        setData({
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            totalInvestment,
            investmentProfit: totalInvestment - investmentCost
        });
    };

    const prepareCharts = (transactions, investments) => {
        // 1. Income/Expense Trend (Last 6 months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
            months.push(dayjs().subtract(i, 'month').format('YYYY-MM'));
        }

        const incomeData = months.map(month =>
            transactions
                .filter(t => t.type === 'income' && t.date.startsWith(month))
                .reduce((sum, t) => sum + t.amount, 0)
        );

        const expenseData = months.map(month =>
            transactions
                .filter(t => t.type === 'expense' && t.date.startsWith(month))
                .reduce((sum, t) => sum + t.amount, 0)
        );

        const trendChart = {
            labels: months,
            datasets: [
                {
                    label: '收入',
                    data: incomeData,
                    borderColor: '#cf1322',
                    backgroundColor: '#cf1322',
                },
                {
                    label: '支出',
                    data: expenseData,
                    borderColor: '#3f8600',
                    backgroundColor: '#3f8600',
                },
            ],
        };

        // 2. Expense Breakdown
        const expenseByCategory = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
            });

        const expenseChart = {
            labels: Object.keys(expenseByCategory),
            datasets: [
                {
                    data: Object.values(expenseByCategory),
                    backgroundColor: [
                        '#3f8600', '#5b8c00', '#7cb305', '#a0d911', '#bae637',
                        '#73d13d', '#36cfc9', '#4096ff', '#597ef7', '#9254de', '#f759ab'
                    ],
                },
            ],
        };

        // 3. Investment Returns (Line Chart as requested, though Bar is better)
        // Using Item Name as X-axis
        const investmentChart = {
            labels: investments.map(i => i.name),
            datasets: [
                {
                    label: '投资收益',
                    data: investments.map(i => i.value - i.cost),
                    borderColor: '#cf1322',
                    backgroundColor: 'rgba(207, 19, 34, 0.5)',
                    tension: 0.3,
                    fill: true,
                }
            ]
        };

        setChartData({
            trend: trendChart,
            expense: expenseChart,
            investment: investmentChart,
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Cards */}
            {/* Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="总收入"
                            value={data.totalIncome}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowUpOutlined />}
                            suffix="¥"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="总支出"
                            value={data.totalExpense}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowDownOutlined />}
                            suffix="¥"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="账户余额"
                            value={data.balance}
                            precision={2}
                            prefix={<WalletOutlined />}
                            suffix="¥"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="投资总额"
                            value={data.totalInvestment}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<PayCircleOutlined />}
                            suffix="¥"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16} xl={14}>
                    <Card title="收支趋势 (近6个月)" bordered={false}>
                        <div style={{ height: 300, maxWidth: 900, margin: '0 auto' }}>
                            <Line data={chartData.trend} options={{ maintainAspectRatio: false, responsive: true }} />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8} xl={10}>
                    <Card title="支出分类占比" bordered={false}>
                        <div style={{ height: 300, maxWidth: 500, margin: '0 auto' }}>
                            <Pie data={chartData.expense} options={{ maintainAspectRatio: false, responsive: true }} />
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col span={24}>
                    <Card title="投资项目收益趋势" bordered={false}>
                        <div style={{ height: 300, maxWidth: 1000, margin: '0 auto' }}>
                            <Line data={chartData.investment} options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }} />
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
