import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  SettingOutlined,
  AuditOutlined,
  QrcodeOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { ReactNode, useMemo } from 'react'

const { Header, Sider, Content } = Layout

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const selectedKeys = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/snacks')) return ['snacks']
    if (path.startsWith('/import')) return ['import']
    if (path.startsWith('/reports')) return ['reports']
    if (path.startsWith('/settings')) return ['settings']
    if (path.startsWith('/audit')) return ['audit']
    if (path.startsWith('/scanner')) return ['scanner']
    if (path.startsWith('/access')) return ['access']
    if (path.startsWith('/notifications')) return ['notifications']
    return ['dashboard']
  }, [location.pathname])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={64}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <Typography.Text style={{ color: 'white', fontWeight: 700 }}>SnackWatch</Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
            { key: 'notifications', icon: <AuditOutlined />, label: <Link to="/notifications">Notifications</Link> },
            { key: 'snacks', icon: <ShoppingOutlined />, label: <Link to="/snacks">Snacks</Link> },
            { key: 'import', icon: <CloudUploadOutlined />, label: <Link to="/import">Import/Export</Link> },
            { key: 'reports', icon: <FileTextOutlined />, label: <Link to="/reports">Reports</Link> },
            { key: 'settings', icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> },
            { key: 'audit', icon: <AuditOutlined />, label: <Link to="/audit">Audit Log</Link> },
            { key: 'scanner', icon: <QrcodeOutlined />, label: <Link to="/scanner">Scanner</Link> },
            { key: 'access', icon: <UserSwitchOutlined />, label: <Link to="/access">Access</Link> },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: 'transparent', padding: '0 24px' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>Pantry Inventory Management</Typography.Title>
        </Header>
        <Content style={{ margin: 24 }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 24 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout


