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
// import { RobotService } from "services/roboutils";
import { QiRoboService } from "services/QIService";
import { useAuthenticate } from "./Auth";

const { Meta } = Card;
const { Title } = Typography;
const sound = new Audio("click.ogg");

export const Main = () => {
  const [visible, setVisible] = useState<number>(null);
  const [wave] = useState(new Wave());
  const [events, setEvents] = useState<Event[]>([]);
  const [event, setEvent] = useState<Event>(null);
  const [current, setCurrent] = useState<number>(0);
  const [resident, setResident] = useState<String>();
  const [title, setTitle] = useState<string>();
  const canvasEl = useRef(null);
  const { data: eventsQuery, isLoading } = useGetEventsQuery();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const selectedEvents = useAppSelector(selectEvents);

 

  const askResident = (text) => {
    setTimeout(() => {
      QiRoboService.onService(
        "ALMemory",
        (ALMemory) => {
          ALMemory.raiseEvent("yield", "audio_tour," + text);
        },
        1
      );
    });
  };

  const handleDialogueEvent = () => {
    QiRoboService.subscribeToALMemoryEvent(
      "KhanTherapy/Resident",
      (data) => {
        setResident(data);
      },
      null
    );
  };


  const handleEventTitle = () => {
    QiRoboService.subscribeToALMemoryEvent(
      "KhanTherapy/Event",
      (data) => {
        setTitle(data);
      },
      null
    );
  };

  // const handleReminEvent = () => {
  //   QiRoboService.subscribeToALMemoryEvent(
  //     "KhanTherapy/Reminiscence",
  //     (data) => {
  //       setTimeout(() => {
  //         QiRoboService.onService(
  //           "ALMemory",
  //           (ALMemory) => {
  //             ALMemory.raiseEvent("yield", "audio_tour," + data);
  //           },
  //           1
  //         );
  //       });
  //     },
  //     null
  //   );
  // };
  useEffect(() => {
    askResident("start");
    setIsLoaded((loaded) => !loaded);

  }, []);


  useEffect(() => {
    setTimeout(() => {
      handleDialogueEvent();
      handleEventTitle();
      // handleReminEvent();
    }, 2)
  }, [])

  const { onLogout } = useAuthenticate();

  useEffect(() => {
    const filteredEvents = selectedEvents.filter(
      (ev) => ev.resident.residentId == resident
    );
   
    setEvents(filteredEvents);
  }, [selectedEvents, resident]);

  useInterval(() => {
    const size = event ? event.photos?.length : 0;
   
    if (current < size -1 ) {
      setCurrent(current + 1)
    } else {
      setVisible(null)
      setCurrent(0)
      setEvent(null)

    }
  },
    event ? 5000 : null,

  )


  useEffect(() => {
    if(title) {
      const event = events?.find(ev => ev.title.toLowerCase() === title.toLowerCase())
      setEvent(event)
    }
  }, [title])
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

  const handleImageLoad = (index) => {
    if (index === events.length - 1) {
      setIsLoaded(true);
    }
  };
  const renderImage = (photos: Media[] = []) => {
    return photos.map((photo, index) => {
      return <Image width={400} src={`${photo.url}`} />;
    });
  };

  const renderView = (events: Event[] = []) => {
    return events.map((event, index) => {
      return (
        <Col span={6} style={{ paddingTop: 16, paddingLeft: 20 }}>
          <Card
            hoverable
            style={{ width: 240, height: 400 }}
            onTouchStart={() => {
              setTimeout(function () {
                sound.play();
              }, 1);
              setVisible(event.id);
              setEvent(event);
            }}
            // onClick={() => {
            //   setVisible(event.id);
            //   setEvent(event);
            // }}
            cover={
              <Image
                width={240}
                height={320}
                preview={{ visible: false }}
                src={`${event.photos[0].url}`}
                onLoad={() => handleImageLoad(index)}
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
    if (isLoading || !resident) return <Spin style={{ textAlign: "center" }} />;

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
  // console.log("Resident: ", resident)
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
