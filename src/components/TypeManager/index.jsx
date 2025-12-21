
import { useState, useEffect } from 'react';
import { Card, List, Input, Button, Tabs, message, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { storage } from '../../utils/storage';

const TypeManager = () => {
    const [transactionTypes, setTransactionTypes] = useState({ income: [], expense: [] });
    const [investmentTypes, setInvestmentTypes] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setTransactionTypes(storage.getTransactionTypes());
        setInvestmentTypes(storage.getInvestmentTypes());
    };

    const handleAdd = (category) => {
        if (!inputValue.trim()) return;

        if (category === 'investment') {
            if (investmentTypes.includes(inputValue)) {
                message.warning('该类型已存在');
                return;
            }
            const newData = [...investmentTypes, inputValue];
            setInvestmentTypes(newData);
            storage.saveInvestmentTypes(newData);
        } else {
            if (transactionTypes[category].includes(inputValue)) {
                message.warning('该类型已存在');
                return;
            }
            const newData = {
                ...transactionTypes,
                [category]: [...transactionTypes[category], inputValue]
            };
            setTransactionTypes(newData);
            storage.saveTransactionTypes(newData);
        }

        setInputValue('');
        message.success('添加成功');
    };

    const handleDelete = (category, item) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除类型 "${item}" 吗？`,
            onOk: () => {
                if (category === 'investment') {
                    const newData = investmentTypes.filter(t => t !== item);
                    setInvestmentTypes(newData);
                    storage.saveInvestmentTypes(newData);
                } else {
                    const newData = {
                        ...transactionTypes,
                        [category]: transactionTypes[category].filter(t => t !== item)
                    };
                    setTransactionTypes(newData);
                    storage.saveTransactionTypes(newData);
                }
                message.success('删除成功');
            }
        });
    };

    const handleMove = (category, index, direction) => {
        if (category === 'investment') {
            const newData = [...investmentTypes];
            if (direction === 'up' && index > 0) {
                [newData[index], newData[index - 1]] = [newData[index - 1], newData[index]];
            } else if (direction === 'down' && index < newData.length - 1) {
                [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
            }
            setInvestmentTypes(newData);
            storage.saveInvestmentTypes(newData);
        } else {
            const currentList = transactionTypes[category];
            const newList = [...currentList];
            if (direction === 'up' && index > 0) {
                [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
            } else if (direction === 'down' && index < newList.length - 1) {
                [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
            }

            const newData = {
                ...transactionTypes,
                [category]: newList
            };
            setTransactionTypes(newData);
            storage.saveTransactionTypes(newData);
        }
    };

    const renderList = (category, data) => (
        <div>
            <div style={{ display: 'flex', marginBottom: 16 }}>
                <Input
                    placeholder="输入新类型名称"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onPressEnter={() => handleAdd(category)}
                    style={{ marginRight: 8 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(category)}>
                    添加
                </Button>
            </div>
            <List
                bordered
                dataSource={data}
                renderItem={(item, index) => (
                    <List.Item
                        actions={[
                            <Button
                                key="up"
                                type="text"
                                icon={<ArrowUpOutlined />}
                                disabled={index === 0}
                                onClick={() => handleMove(category, index, 'up')}
                            />,
                            <Button
                                key="down"
                                type="text"
                                icon={<ArrowDownOutlined />}
                                disabled={index === data.length - 1}
                                onClick={() => handleMove(category, index, 'down')}
                            />,
                            <Button
                                key="delete"
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(category, item)}
                            />
                        ]}
                    >
                        {item}
                    </List.Item>
                )}
            />
        </div>
    );

    const items = [
        {
            key: 'expense',
            label: '支出类型',
            children: renderList('expense', transactionTypes.expense),
        },
        {
            key: 'income',
            label: '收入类型',
            children: renderList('income', transactionTypes.income),
        },
        {
            key: 'investment',
            label: '投资类型',
            children: renderList('investment', investmentTypes),
        },
    ];

    return (
        <Card title="类型管理">
            <Tabs defaultActiveKey="expense" items={items} onChange={() => setInputValue('')} />
        </Card>
    );
};

export default TypeManager;
