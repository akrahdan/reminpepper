import { PageContainer } from "@ant-design/pro-components";
import { Button, Input, Result, Tag, Typography, Spin } from "antd";
import { Card, Col, Row, Space, Image } from "antd";
import { useInterval } from "usehooks-ts";
import Wave from "wave-visualizer";
import React, { useEffect, useRef, useState } from "react";
import type { Event } from "services/event";
import { useAppSelector } from "store/hooks";
import { selectEvents } from "state/event/eventSlice";
import { useGetEventsQuery } from "services/event";
import { Media } from "services/media";
import { useAuthenticate } from "./Auth";


const { Meta } = Card;
const { Title } = Typography;

export const Main = () => {
  const [visible, setVisible] = useState<number>(null);
  const [wave] = useState(new Wave());
  const [events, setEvents] = useState<Event[]>([]);
  const [event, setEvent] = useState<Event>(null);
  const [current, setCurrent] = useState<number>(0);
  const [resident, setResident] = useState<String>("123");
  const canvasEl = useRef(null);
  const { data: eventsQuery, isLoading } = useGetEventsQuery();
  const selectedEvents = useAppSelector(selectEvents);

  const { onLogout } = useAuthenticate()

  useEffect(() => {
    const filteredEvents = selectedEvents.filter(
      (ev) => ev.resident.residentId == resident
    );
    // console.log("Events: ", selectedEvents)
    setEvents(filteredEvents);
  }, [selectedEvents, resident]);
  
  // useInterval(() => {
  //   const size = event ? event.photos?.length : 0;
  //   console.log("Current: ", current)
  //   if (current < size -1 ) {
  //     setCurrent(current + 1)
  //   } else {
  //     setVisible(null)
  //     setCurrent(0)
  //     setEvent(null)
      
  //   }
  // }, 
  //   event ? 5000 : null,
  
  // )
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const size = event ? event.photos?.length : 0;
  //     // console.log("Work: ", event)
  //     if (current < size - 1) {
  //       console.log("Work: ", current)
        
  //       setCurrent((prevCurrent) => prevCurrent + 1);
  //     }
  //   }, 5000);
  //   return () => clearInterval(interval)
  // }, [event]);

  const renderImage = (photos: Media[] = []) => {
    return photos.map((photo) => {
      return (
        <Image width={400} src={`${photo.url}`} />
      );
    });
  };

  const renderView = (events: Event[] = []) => {
    return events.map((event) => {
      return (
        <Col span={6} style={{ paddingTop: 16, paddingLeft: 20 }}>
          <Card
            hoverable
            style={{ width: 240, height: 400 }}
            onClick={() => {
              setVisible(event.id);
              setEvent(event);
            }}
            cover={
              <Image
                width={240}
                height={320}
                preview={{ visible: false }}
                src={`${event.photos[0].url}`}
              />
            }
          >
            <Meta title={<Title level={2}>{event.title}</Title>} />
          </Card>
          <div style={{ display: "none" }}>
            <Image.PreviewGroup
              
              preview={{
                visible: visible == event.id,

                current,
                
                onVisibleChange: (vis) => {
                 
                  setVisible(null);
                  setEvent(null);
                  setCurrent(0);
                },
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
   
    if (isLoading) return <Spin style={{ textAlign: 'center'}}/>

    return (
      <Space
        direction="vertical"
        size="large"
        style={{ display: "flex", height: "100%", background: "#fff" }}
      >
        <Row gutter={16}>{renderView(events)}</Row>
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
        <Button onClick={() => onLogout()} key="2" type="primary">
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
