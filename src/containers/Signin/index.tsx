import bgImg from './pepper.jpg'
import {
  AlipayOutlined,
  LockOutlined,
  
  UserOutlined,
  WeiboOutlined,
} from "@ant-design/icons";
import {
  LoginFormPage,
  
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Divider, message, Space, Tabs } from "antd";
import type { CSSProperties } from "react";
import { useAuthenticate } from 'containers/Auth';
import { useState } from "react";

const iconStyles: CSSProperties = {
  color: "rgba(0, 0, 0, 0.2)",
  fontSize: "18px",
  verticalAlign: "middle",
  cursor: "pointer",
};




export const Signin = () => {
  const { onLogin} =  useAuthenticate();
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [me,setMe] = useState<string>('');

  const handleSubmit = async () => {
    
    if (password && email) {
        await onLogin(email, password, (res)=> {
          setMe(res)
        })
    }
  }
  return (
    <div
      style={{
        backgroundColor: "white",
        height: "calc(100vh - 48px)",
        margin: -24,
      }}
    >
      <LoginFormPage
        
        submitter={{
            onSubmit: handleSubmit
        }}
        backgroundImageUrl='pepper.jpg'
        logo="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
        title="DECRS"
        subTitle="Login into your account"
        activityConfig={{
          style: {
            boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
            color: "#fff",
            borderRadius: 8,
            backgroundColor: "#1677FF",
          },
          title: "Reminiscence Therapy for Elderly Care",
          subTitle: "Dementia and Elderly Care Robotics and Sensing",
         
          
        }}
        actions={

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              
            }}
          
            onSubmit={handleSubmit}
          >
           
          </div>
        }
      >
        
        <ProFormText
          name="email "
        
          fieldProps={{
            onChange: (event) => setEmail(event.target.value),
            value: email,
            size: "large",
            prefix: <UserOutlined className={"prefixIcon"} />,
          }}
          placeholder={"Email or Username"}
          rules={[
            {
              required: true,
              message: "Please enter a username!",
            },
          ]}
        />
        <ProFormText.Password
          name=" password "
          fieldProps={{
            size: "large",
            onChange: (event) => setPassword(event.target.value),
            value: password,
            prefix: <LockOutlined className={"prefixIcon"} />,
          }}
          placeholder={"Password"}
          rules={[
            {
              required: true,
              message: "Please enter your password! ",
            },
          ]}
        />
        

        <div
          style={{
            marginBottom: 24,
          }}
        ></div>
      </LoginFormPage>
      
    </div>
  );
};
