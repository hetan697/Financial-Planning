
import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Radio, DatePicker, Space, Tag, message, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../utils/storage';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();
    const [transactionTypes, setTransactionTypes] = useState({ income: [], expense: [] });
    const [currentType, setCurrentType] = useState('expense');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setTransactions(storage.getTransactions());
        setTransactionTypes(storage.getTransactionTypes());
    };

    const handleAdd = () => {
        setEditingId(null);
        setCurrentType('expense');
        form.resetFields();
        form.setFieldsValue({
            date: dayjs(),
            type: 'expense'
        });
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        setCurrentType(record.type);
        form.setFieldsValue({
            ...record,
            date: dayjs(record.date)
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这条记录吗？',
            onOk: () => {
                const newData = transactions.filter(t => t.id !== id);
                setTransactions(newData);
                storage.saveTransactions(newData);
                message.success('删除成功');
            }
        });
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            const transactionData = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                amount: Number(values.amount)
            };

            let newTransactions;
            if (editingId) {
                newTransactions = transactions.map(t =>
                    t.id === editingId ? { ...transactionData, id: editingId } : t
                );
                message.success('修改成功');
            } else {
                newTransactions = [...transactions, { ...transactionData, id: uuidv4() }];
                message.success('添加成功');
            }

            // Sort by date desc
            newTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(newTransactions);
            storage.saveTransactions(newTransactions);
            setIsModalOpen(false);
        });
    };

    const columns = [
        {
            title: '日期',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type) => (
                <Tag color={type === 'income' ? 'error' : 'success'}>
                    {type === 'income' ? '收入' : '支出'}
                </Tag>
            ),
            filters: [
                { text: '收入', value: 'income' },
                { text: '支出', value: 'expense' },
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 120,
        },
        {
            title: '金额',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount, record) => (
                <span style={{ color: record.type === 'income' ? '#cf1322' : '#3f8600', fontWeight: 'bold' }}>
                    {record.type === 'income' ? '+' : '-'}{amount.toFixed(2)}
                </span>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: '备注',
            dataIndex: 'note',
            key: 'note',
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} type="text" onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} type="text" danger onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="收支记录"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>记一笔</Button>}
        >
            {window.innerWidth < 768 ? (
                <List
                    dataSource={transactions}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button icon={<EditOutlined />} type="text" onClick={() => handleEdit(item)} />,
                                <Button icon={<DeleteOutlined />} type="text" danger onClick={() => handleDelete(item.id)} />
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Tag color={item.type === 'income' ? 'error' : 'success'}>
                                        {item.type === 'income' ? '收' : '支'}
                                    </Tag>
                                }
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.category}</span>
                                        <span style={{ color: item.type === 'income' ? '#cf1322' : '#3f8600', fontWeight: 'bold' }}>
                                            {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)}
                                        </span>
                                    </div>
                                }
                                description={
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.date}</span>
                                        <span>{item.note || '-'}</span>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Table
                    dataSource={transactions}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            )}

            <Modal
                title={editingId ? "编辑记录" : "新增记录"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ type: 'expense', date: dayjs() }}
                >
                    <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                        <Radio.Group onChange={e => setCurrentType(e.target.value)}>
                            <Radio.Button value="expense">支出</Radio.Button>
                            <Radio.Button value="income">收入</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item name="date" label="日期" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                        <Select>
                            {transactionTypes[currentType]?.map(type => (
                                <Select.Option key={type} value={type}>{type}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            precision={2}
                            min={0}
                            addonBefore="¥"
                        />
                    </Form.Item>

                    <Form.Item name="note" label="备注">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default Transactions;
