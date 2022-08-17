import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu , Button, Divider} from 'antd';
import React, { useState } from 'react';
import "./home.css"
import { Av } from './avatar';
const { Header, Sider, Content } = Layout;
const height: React.CSSProperties = {
  padding: "230px 0",
};
export const Home: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout  style={{ minHeight: '100vh' }} >
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ backgroundColor:"white" }}>
        <div className="logo" />
        <Menu
          // theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'Memories',
            },
            {
              key: '2',
              icon: <UserOutlined />,
              label: 'Events',
            },
            {
              key: '3',
              icon: <VideoCameraOutlined />,
              label: 'Residents',
            },
            {
              key: '4',
              icon: <UploadOutlined />,
              label: 'Songs',
            },
            
          ]}
        >
        <div style={{padding:'400px 0'}}>
      <Button>Log Out</Button>
      <Divider></Divider>
      <Av></Av>
      </div>
      
         
        </Menu>
       
      
     
      
       
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ textAlign: 'left', padding: 10 }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
          })}
          
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
          }}
        >
          Content
        </Content>
      </Layout>
    </Layout>
  );
};

