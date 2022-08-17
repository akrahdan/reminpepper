
import { PageContainer } from "@ant-design/pro-components";
import {  Button, Input, Result, Tag } from "antd";


export const Main = () => {

  return (
    <PageContainer
      onBack={() => null}
      tags={<Tag color="blue">Welcome</Tag>}
      header={{
        style: {
          padding: "4px 16px",
          position: "fixed",
          top: 0,
          width: "100%",
          left: 0,
          zIndex: 999,
          boxShadow: "0 2px 8px #f0f1f2",
        },
      }}
      style={{
        paddingTop: 48,
      }}
      extra={[
        <Input.Search
          key="search"
          style={{
            width: 240,
          }}
        />,
        // <Button key="3">操作一</Button>,
        <Button key="2" type="primary">
          Log Out
        </Button>,
      ]}
    >
      <div
        style={{
          height: "120vh",
        }}
      >
        <Result
          status="404"
          style={{
            height: "100%",
            background: "#fff",
          }}
          title="Hello World"
          subTitle="Sorry, you are not authorized to access this page."
          extra={<Button type="primary">Back Home</Button>}
        />
      </div>
    </PageContainer>
  );
};
