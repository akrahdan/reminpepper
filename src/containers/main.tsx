import { PageContainer } from "@ant-design/pro-components";
import { Button, Input, Result, Tag, Typography } from "antd";
import { Card, Col, Row, Space, Image } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import Wave from "wave-visualizer";
import React, { useEffect, useRef, useState } from "react";
import type { Event } from "services/event";
import { useAppSelector } from "store/hooks";
import { selectEvents } from "state/event/eventSlice";
import { useGetEventsQuery } from "services/event";
import { Media } from "services/media";

const { Meta } = Card;
const { Title} = Typography

export const Main = () => {
  const [visible, setVisible] = useState<number>(null);
  const [wave] = useState(new Wave());
  const [events, setEvents] = useState<Event[]>([]);
  const [resident, setResident] = useState<String>('123')
  const canvasEl = useRef(null);
  const { data: eventsQuery } = useGetEventsQuery();
  const selectedEvents = useAppSelector(selectEvents);

  useEffect(() => {
    const filteredEvents = selectedEvents.filter(ev => ev.resident.residentId == resident)
    // console.log("Events: ", selectedEvents)
    setEvents(filteredEvents);
  }, [selectedEvents, resident]);

  const renderImage = (photos: Media[] = []) => {
    return photos.map((photo) => {
      return (
        <Image width={400} src={`${process.env.REACT_APP_API}${photo.url}`} />
      );
    });
  };

  const renderView = (events: Event[] = []) => {
    return events.map((event) => {
      return (
        <Col span={6} style={{paddingTop: 16, paddingLeft: 20}}>
          <Card
            hoverable
            style={{ width: 240, height: 400 }}
            onClick={() => setVisible(event.id)}
            cover={
              <Image
                width={240}
                height= {320}
                preview= {{visible: false}}
                src={`${process.env.REACT_APP_API}${event.photos[0].url}`}
              />
            }
          >
            <Meta  title={<Title level={2}>{event.title}</Title>}  />
          </Card>
          <div style={{ display: "none" }}>
            <Image.PreviewGroup
              preview={{
                visible: visible == event.id,
                onVisibleChange: (vis) => setVisible(null),
              }}
            >
              {renderImage(event.photos)}
            </Image.PreviewGroup>
          </div>
        </Col>
      );
    });
  };

  const renderEvents = (events = []) => {
    if (!events.length)
      return (
        <Space align="center" direction="vertical" size="large">
          <canvas height={300} width="300" ref={canvasEl} />
        </Space>
      );

    return (
      <Space
        direction="vertical"
        size="large"
        style={{ display: "flex", height: "100%", background: "#fff" }}
      >
        <Row gutter={16}>
          {renderView(events)}
          
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
