
import { Card, Button, Upload, Modal, message, Alert, Typography } from 'antd';
import { DownloadOutlined, UploadOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { storage } from '../../utils/storage';

const { Title, Paragraph } = Typography;

const DataManager = () => {
    const handleExport = () => {
        const data = storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success('导出成功');
    };

    const handleImport = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const success = storage.importData(e.target.result);
            if (success) {
                message.success('导入成功，即将刷新页面');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                message.error('导入失败，文件格式可能不正确');
            }
        };
        reader.readAsText(file);
        return false; // Prevent upload
    };

    const handleClear = () => {
        Modal.confirm({
            title: '确认清除数据',
            icon: <ExclamationCircleOutlined />,
            content: '此操作将清除所有收支记录、投资项目和计算器配置，但会保留类型设置。操作不可恢复！',
            okText: '确认清除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                storage.clearData();
                message.success('数据已清除，即将刷新页面');
                setTimeout(() => window.location.reload(), 1500);
            },
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card title="数据导出">
                <Paragraph>将所有财务数据（包括配置）导出为JSON文件进行备份。</Paragraph>
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                    导出数据
                </Button>
            </Card>

            <Card title="数据导入">
                <Paragraph>从JSON备份文件恢复数据。注意：这将覆盖当前的所有数据。</Paragraph>
                <Upload beforeUpload={handleImport} showUploadList={false} accept=".json">
                    <Button icon={<UploadOutlined />}>选择备份文件</Button>
                </Upload>
            </Card>

            <Card title="危险操作" style={{ borderColor: '#ffccc7' }}>
                <Alert
                    message="清除数据"
                    description="将删除本地存储中的所有财务数据。请确保已备份重要数据。"
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Button danger icon={<DeleteOutlined />} onClick={handleClear}>
                    清除所有数据
                </Button>
            </Card>
        </div>
    );
};

export default DataManager;
