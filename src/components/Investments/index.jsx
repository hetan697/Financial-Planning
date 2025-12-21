
import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Statistic, Row, Col, Tag, message, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/storage';

const Investments = () => {
    const [investments, setInvestments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();
    const [investmentTypes, setInvestmentTypes] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setInvestments(storage.getInvestments());
        setInvestmentTypes(storage.getInvestmentTypes());
    };

    const calculateTotal = () => {
        let totalCost = 0;
        let totalValue = 0;
        investments.forEach(item => {
            totalCost += item.cost;
            totalValue += item.value;
        });
        return {
            cost: totalCost,
            value: totalValue,
            profit: totalValue - totalCost,
            rate: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
        };
    };

    const totals = calculateTotal();

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个投资项目吗？',
            onOk: () => {
                const newData = investments.filter(t => t.id !== id);
                setInvestments(newData);
                storage.saveInvestments(newData);
                message.success('删除成功');
            }
        });
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            const investmentData = {
                ...values,
                cost: Number(values.cost),
                value: Number(values.value)
            };

            let newInvestments;
            if (editingId) {
                newInvestments = investments.map(t =>
                    t.id === editingId ? { ...t, ...investmentData } : t
                );
                message.success('修改成功');
            } else {
                newInvestments = [...investments, { ...investmentData, id: uuidv4() }];
                message.success('添加成功');
            }

            setInvestments(newInvestments);
            storage.saveInvestments(newInvestments);
            setIsModalOpen(false);
        });
    };

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: '投入本金',
            dataIndex: 'cost',
            key: 'cost',
            render: val => `¥${val.toFixed(2)}`,
            sorter: (a, b) => a.cost - b.cost,
        },
        {
            title: '当前价值',
            dataIndex: 'value',
            key: 'value',
            render: val => `¥${val.toFixed(2)}`,
            sorter: (a, b) => a.value - b.value,
        },
        {
            title: '盈亏',
            key: 'profit',
            render: (_, record) => {
                const profit = record.value - record.cost;
                const color = profit >= 0 ? '#cf1322' : '#3f8600'; // Red for up, Green for down
                return (
                    <span style={{ color, fontWeight: 'bold' }}>
                        {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                    </span>
                );
            },
            sorter: (a, b) => (a.value - a.cost) - (b.value - b.cost),
        },
        {
            title: '收益率',
            key: 'rate',
            render: (_, record) => {
                const rate = record.cost > 0 ? ((record.value - record.cost) / record.cost) * 100 : 0;
                const color = rate >= 0 ? '#cf1322' : '#3f8600';
                return (
                    <span style={{ color }}>
                        {rate >= 0 ? '+' : ''}{rate.toFixed(2)}%
                    </span>
                );
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
                </div>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Card bordered={false} style={{ height: '100%' }}>
                        <Statistic
                            title="总投入"
                            value={totals.cost}
                            precision={2}
                            prefix="¥"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ height: '100%' }}>
                        <Statistic
                            title="当前总值"
                            value={totals.value}
                            precision={2}
                            prefix="¥"
                            valueStyle={{ color: totals.profit >= 0 ? '#cf1322' : '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ height: '100%' }}>
                        <Statistic
                            title="总盈亏"
                            value={totals.profit}
                            precision={2}
                            valueStyle={{ color: totals.profit >= 0 ? '#cf1322' : '#3f8600' }}
                            suffix={
                                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                                    ({totals.rate >= 0 ? '+' : ''}{totals.rate.toFixed(2)}%)
                                </span>
                            }
                            prefix={totals.profit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title="投资组合"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加项目</Button>}
            >
                {window.innerWidth < 768 ? (
                    <List
                        dataSource={investments}
                        renderItem={item => {
                            const profit = item.value - item.cost;
                            const color = profit >= 0 ? '#cf1322' : '#3f8600';
                            const rate = item.cost > 0 ? ((item.value - item.cost) / item.cost) * 100 : 0;

                            return (
                                <List.Item
                                    actions={[
                                        <Button icon={<EditOutlined />} type="text" onClick={() => handleEdit(item)} />,
                                        <Button icon={<DeleteOutlined />} type="text" danger onClick={() => handleDelete(item.id)} />
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Tag color="blue">{item.type}</Tag>}
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{item.name}</span>
                                                <span>¥{item.value.toFixed(2)}</span>
                                            </div>
                                        }
                                        description={
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>成本: ¥{item.cost.toFixed(2)}</span>
                                                <span style={{ color, fontWeight: 'bold' }}>
                                                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)} ({rate.toFixed(2)}%)
                                                </span>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                ) : (
                    <Table
                        dataSource={investments}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 600 }}
                    />
                )}
            </Card>

            <Modal
                title={editingId ? "编辑投资" : "新增投资"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                        <Input placeholder="例如：腾讯控股" />
                    </Form.Item>

                    <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                        <Select>
                            {investmentTypes.map(type => (
                                <Select.Option key={type} value={type}>{type}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="cost" label="投入本金" rules={[{ required: true }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            addonBefore="¥"
                        />
                    </Form.Item>

                    <Form.Item name="value" label="当前价值" rules={[{ required: true }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            addonBefore="¥"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Investments;
