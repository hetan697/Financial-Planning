
import { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Table, Space, Typography, Row, Col, Statistic, Popconfirm, message, Select, List, Popover } from 'antd';
import { PlusOutlined, DeleteOutlined, CalculatorOutlined, EditOutlined } from '@ant-design/icons';
import { storage } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';

const { Title, Text } = Typography;

const Calculator = () => {
    const [methods, setMethods] = useState([]);
    const [totalAmount, setTotalAmount] = useState(() => storage.getCalculatorTotal());
    const [investmentTypes, setInvestmentTypes] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        const savedConfig = storage.getCalculatorConfig();
        // Load investment types
        setInvestmentTypes(storage.getInvestmentTypes());

        if (savedConfig && savedConfig.length > 0) {
            setMethods(savedConfig);
        } else {
            // Default sample data
            setMethods([
                { id: uuidv4(), name: '股票', rate: 10, percent: 30 },
                { id: uuidv4(), name: '基金', rate: 5, percent: 40 },
                { id: uuidv4(), name: '银行理财', rate: 3, percent: 30 },
            ]);
        }
    }, []);

    useEffect(() => {
        storage.saveCalculatorConfig(methods);
    }, [methods]);

    useEffect(() => {
        storage.saveCalculatorTotal(totalAmount);
    }, [totalAmount]);

    const handleAdd = () => {
        const newMethod = {
            id: uuidv4(),
            name: investmentTypes[0] || '股票', // Default to first type if available
            rate: 5,
            percent: 0,
        };
        setMethods([...methods, newMethod]);
    };

    const handleDelete = (id) => {
        setMethods(methods.filter(m => m.id !== id));
    };

    const handleUpdate = (id, field, value) => {
        const newMethods = methods.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        );
        setMethods(newMethods);
    };

    // Calculations
    const totalPercent = methods.reduce((sum, m) => sum + m.percent, 0);

    const resultData = methods.map(m => ({
        ...m,
        amount: totalAmount * (m.percent / 100),
        return: totalAmount * (m.percent / 100) * (m.rate / 100),
    }));

    const totalReturn = resultData.reduce((sum, m) => sum + m.return, 0);
    const weightedRate = totalAmount > 0 ? (totalReturn / totalAmount) * 100 : 0;

    const columns = [
        {
            title: '投资方式',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Select
                    style={{ width: '100%' }}
                    value={text}
                    onChange={value => handleUpdate(record.id, 'name', value)}
                >
                    {investmentTypes.map(type => (
                        <Select.Option key={type} value={type}>{type}</Select.Option>
                    ))}
                </Select>
            ),
        },
        {
            title: '预期年化 (%)',
            dataIndex: 'rate',
            key: 'rate',
            width: 150,
            render: (val, record) => (
                <InputNumber
                    min={0}
                    max={100}
                    value={val}
                    onChange={v => handleUpdate(record.id, 'rate', v)}
                    suffix="%"
                />
            ),
        },
        {
            title: '分配比例 (%)',
            dataIndex: 'percent',
            key: 'percent',
            width: 150,
            render: (val, record) => (
                <InputNumber
                    min={0}
                    max={100}
                    value={val}
                    onChange={v => handleUpdate(record.id, 'percent', v)}
                    suffix="%"
                    status={totalPercent > 100 ? 'error' : ''}
                />
            ),
        },
        {
            title: '及算投入金额',
            key: 'amount',
            render: (_, record) => `¥${(totalAmount * (record.percent / 100)).toFixed(2)}`,
        },
        {
            title: '预期年收益',
            key: 'return',
            render: (_, record) => (
                <span style={{ color: '#cf1322', fontWeight: 'bold' }}>
                    ¥{(totalAmount * (record.percent / 100) * (record.rate / 100)).toFixed(2)}
                </span>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id)}
                />
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card
                        style={{ height: '100%' }}
                        title="总投入本金"
                        extra={
                            <Popover
                                content={
                                    <InputNumber
                                        style={{ width: 150 }}
                                        value={totalAmount}
                                        onChange={setTotalAmount}
                                        addonBefore="¥"
                                        placeholder="调整本金"
                                    />
                                }
                                title="调整总本金"
                                trigger="click"
                            >
                                <Button type="link" icon={<EditOutlined />}>调整</Button>
                            </Popover>
                        }
                    >
                        <Statistic
                            value={totalAmount}
                            precision={2}
                            prefix="¥"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ height: '100%' }} title="预期总年收益">
                        <Statistic
                            value={totalReturn}
                            precision={2}
                            prefix="¥"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ height: '100%' }} title="加权平均收益率">
                        <Statistic
                            value={weightedRate}
                            precision={2}
                            suffix="%"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title="投资组合配置"
                extra={
                    <Space>
                        <Text type={totalPercent !== 100 ? 'danger' : 'success'}>
                            当前总比例: {totalPercent}%
                        </Text>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            添加方式
                        </Button>
                    </Space>
                }
            >
                {window.innerWidth < 768 ? (
                    <List
                        dataSource={methods}
                        renderItem={item => (
                            <List.Item>
                                <Card style={{ width: '100%' }} size="small">
                                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Space>
                                            <span style={{ fontWeight: 'bold' }}>方式:</span>
                                            <Select
                                                style={{ width: 120 }}
                                                value={item.name}
                                                onChange={value => handleUpdate(item.id, 'name', value)}
                                            >
                                                {investmentTypes.map(type => (
                                                    <Select.Option key={type} value={type}>{type}</Select.Option>
                                                ))}
                                            </Select>
                                        </Space>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDelete(item.id)}
                                        />
                                    </div>
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <div style={{ marginBottom: 4 }}>年化(%):</div>
                                            <InputNumber
                                                min={0}
                                                max={100}
                                                value={item.rate}
                                                onChange={v => handleUpdate(item.id, 'rate', v)}
                                                style={{ width: '100%' }}
                                                suffix="%"
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ marginBottom: 4 }}>比例(%):</div>
                                            <InputNumber
                                                min={0}
                                                max={100}
                                                value={item.percent}
                                                onChange={v => handleUpdate(item.id, 'percent', v)}
                                                style={{ width: '100%' }}
                                                suffix="%"
                                                status={totalPercent > 100 ? 'error' : ''}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ color: '#888' }}>投入金额:</div>
                                            <div>¥{(totalAmount * (item.percent / 100)).toFixed(2)}</div>
                                        </Col>
                                        <Col span={12}>
                                            <div style={{ color: '#888' }}>预期收益:</div>
                                            <div style={{ color: '#cf1322', fontWeight: 'bold' }}>
                                                ¥{(totalAmount * (item.percent / 100) * (item.rate / 100)).toFixed(2)}
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </List.Item>
                        )}
                        footer={
                            <div style={{ padding: '0 16px' }}>
                                <Row justify="space-between" style={{ marginBottom: 8 }}>
                                    <Col>总比例:</Col>
                                    <Col>
                                        <Text type={totalPercent !== 100 ? 'danger' : 'success'}>{totalPercent}%</Text>
                                    </Col>
                                </Row>
                                <Row justify="space-between">
                                    <Col>预期总收益:</Col>
                                    <Col>
                                        <Text type="danger">¥{totalReturn.toFixed(2)}</Text>
                                    </Col>
                                </Row>
                            </div>
                        }
                    />
                ) : (
                    <Table
                        dataSource={methods}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 800 }}
                        summary={() => (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0}>总计</Table.Summary.Cell>
                                <Table.Summary.Cell index={1}>-</Table.Summary.Cell>
                                <Table.Summary.Cell index={2}>
                                    <Text type={totalPercent !== 100 ? 'danger' : 'success'}>{totalPercent}%</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3}>¥{totalAmount.toFixed(2)}</Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>
                                    <Text type="danger">¥{totalReturn.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={5}>-</Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default Calculator;
