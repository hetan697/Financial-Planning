import { useState } from 'react';
import { Layout, Menu, theme, Button, Drawer, Grid } from 'antd';
import {
  DashboardOutlined,
  AccountBookOutlined,
  RiseOutlined,
  CalculatorOutlined,
  TagsOutlined,
  DatabaseOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import Calculator from './components/Calculator';
import TypeManager from './components/TypeManager';
import DataManager from './components/DataManager';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const screens = useBreakpoint();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '财务看板',
    },
    {
      key: 'transactions',
      icon: <AccountBookOutlined />,
      label: '收支记录',
    },
    {
      key: 'investments',
      icon: <RiseOutlined />,
      label: '投资管理',
    },
    {
      key: 'calculator',
      icon: <CalculatorOutlined />,
      label: '投资计算器',
    },
    {
      key: 'types',
      icon: <TagsOutlined />,
      label: '类型管理',
    },
    {
      key: 'data',
      icon: <DatabaseOutlined />,
      label: '数据管理',
    },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'investments':
        return <Investments />;
      case 'calculator':
        return <Calculator />;
      case 'types':
        return <TypeManager />;
      case 'data':
        return <DataManager />;
      default:
        return <Dashboard />;
    }
  };

  const onMenuClick = (e) => {
    setCurrentView(e.key);
    setDrawerVisible(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: colorBgContainer, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ color: 'rgba(0, 0, 0, 0.88)', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DashboardOutlined style={{ fontSize: '20px', color: '#1677ff' }} />
          <span>个人财务管理系统</span>
        </div>

        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[currentView]}
          items={menuItems}
          onClick={onMenuClick}
          className="desktop-menu"
          style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end', borderBottom: 'none' }}
        />
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          className="mobile-menu-btn"
        />
      </Header>

      <Content className="app-content">
        <div
          className="app-content-inner"
          style={{
            background: colorBgContainer,
            minHeight: 280,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderContent()}
        </div>
      </Content>

      <Drawer
        title="菜单"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={240}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[currentView]}
          items={menuItems}
          onClick={onMenuClick}
          style={{ border: 'none' }}
        />
      </Drawer>
    </Layout>
  );
};

export default App;
