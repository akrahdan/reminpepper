import { PageContainer } from "@ant-design/pro-components";
import { Button, Input, Result, Tag } from "antd";
import { Card, Col, Row, Space, Image } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";

const { Meta } = Card;

export const Main = () => {
  const [visible, setVisible] = useState(false);

  const [events, setEvents] = useState([]);

  const renderEvents = (events = []) => {
    if (!events.length)
      return (
        <Space align="center" direction="vertical" size="large">
          <FontAwesomeIcon fontSize={100} icon={faMicrophone} />
        </Space>
      );

    return (
      <Space
        direction="vertical"
        size="large"
        style={{ display: "flex", height: "100%", background: "#fff" }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Card
              hoverable
              style={{ width: 240 }}
              onClick={() => setVisible(true)}
              cover={
                <img
                  alt="example"
                  src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                />
              }
            >
              <Meta title="Wedding" description="A great day at Minnesota" />
            </Card>
            <div style={{ display: "none" }}>
              <Image.PreviewGroup
                preview={{
                  visible,
                  onVisibleChange: (vis) => setVisible(vis),
                }}
              >
                <Image src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp" />
                <Image src="https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp" />
                <Image src="https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp" />
              </Image.PreviewGroup>
            </div>
          </Col>

          <Col span={6}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={
                <img
                  alt="example"
                  src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                />
              }
            >
              <Meta title="Wedding" description="A great day at Minnesota" />
            </Card>
          </Col>

          <Col span={6}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={
                <img
                  alt="example"
                  src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                />
              }
            >
              <Meta title="Wedding" description="A great day at Minnesota" />
            </Card>
          </Col>

          <Col span={6}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={
                <img
                  alt="example"
                  src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                />
              }
            >
              <Meta title="Wedding" description="A great day at Minnesota" />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={
                <img
                  alt="example"
                  src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                />
              }
            >
              <Meta title="Wedding" description="A great day at Minnesota" />
            </Card>
          </Col>

          <Col span={6}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={
                <img
                  alt="example"
                  src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                />
              }
            >
              <Meta title="Wedding" description="A great day at Minnesota" />
            </Card>
          </Col>

          <Col span={6}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={
                <img
                  alt="example"
                  src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                />
              }
            >
              <Meta title="Wedding" description="A great day at Minnesota" />
            </Card>
          </Col>

          <Col span={6}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={
                <img
                  alt="example"
                  src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                />
              }
            >
              <Meta title="Wedding" description="A great day at Minnesota" />
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };
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
        {renderEvents(events)}
      </div>
    </PageContainer>
  );
};
