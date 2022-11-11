import { PageContainer } from "@ant-design/pro-components";
import { Button, Input, Result, Tag, Typography, Spin } from "antd";
import { Card, Col, Row, Space, Image } from "antd";
import { useInterval } from "usehooks-ts";
import Wave from "wave-visualizer";
import React, { useEffect, useRef, useState } from "react";
import type { Event, EventResponse } from "services/event";
import type { Resident, ResidentResponses } from "services/resident";
import {
  ResidentResponse,
  useGetResidentQuery,
  useGetResidentsQuery,
} from "services/resident";
import { selectResidents } from "state/resident/residentSlice";
import { useAppSelector } from "store/hooks";
import { selectEvents } from "state/event/eventSlice";
import { useGetEventsQuery } from "services/event";
import { Media } from "services/media";
// import { RobotService } from "services/roboutils";
import { QiRoboService } from "services/QIService";
import { useAuthenticate } from "./Auth";
import wordsToNumbers from "words-to-numbers";
import { GraphQLClient, gql } from "graphql-request";

const { Meta } = Card;
const { Title } = Typography;
const sound = new Audio("click.ogg");
const memoryacc = new Audio("dreaming.m4a");

const endpoint = process.env.REACT_APP_API_URL;

const client = new GraphQLClient(endpoint, {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const query = gql`
  query GetEventsQluery {
    allEvents {
      id
      title
      resident {
        id
        residentId
        roomNo
      }
      description
      createdAt
      updatedAt
    }
  }
`;

export const Main = () => {
  const [visible, setVisible] = useState<number>(null);
  const [wave] = useState(new Wave());
  const [events, setEvents] = useState<Event[]>([]);
  const [event, setEvent] = useState<Event>(null);
  const [current, setCurrent] = useState<number>(0);
  const [resident, setResident] = useState<String>();
  const [selectedResidentId, setSelectedResidentId] = useState<String>()
  const [start, setStart] = useState<string>("initial");
  const [title, setTitle] = useState<string>();

  const { data: eventsQuery, isLoading, refetch } = useGetEventsQuery();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const selectedEvents = useAppSelector(selectEvents);

  //Residents
  const [residents, setResidents] = useState<Resident[]>([]);
  const { data: residentQuery } = useGetResidentsQuery();

  const selectedResidents = useAppSelector(selectResidents);

 

  useEffect(() => {
    setResidents(selectedResidents);
    if (selectedResidentId) {
      const resd = selectedResidents?.find(rd => rd.residentId === selectedResidentId)
      alert('REsident'+ resd.residentId)

      if(resd) {
        setResident(resd.residentId)
      } else {
        
        askResident("notfound")
      }
    }

  }, [selectedResidents, selectedResidentId]);

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
        const num = wordsToNumbers(data);
        setSelectedResidentId(String(num));
       
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

  useEffect(() => {
    askResident("start");
    setIsLoaded((loaded) => !loaded);
  }, [start]);

  useEffect(() => {
    setTimeout(() => {
      handleDialogueEvent();
      handleEventTitle();
      // handleReminEvent();
    }, 2);
  }, []);

  const { onLogout } = useAuthenticate();

  useEffect(() => {
    const filteredEvents = selectedEvents.filter(
      (ev) => ev.resident.residentId == resident
    );
    if (filteredEvents?.length > 0) {
      setEvents(filteredEvents);
    } else {
    }
  }, [selectedEvents, resident]);

  useInterval(
    () => {
      const size = event ? event.photos?.length : 0;

      if (current < size - 1) {
        setCurrent(current + 1);
      } else {
        setVisible(null);
        setCurrent(0);
        setEvent(null);
        memoryacc.pause();
        memoryacc.currentTime = 0;
        askResident("more");
      }
    },
    event ? 5000 : null
  );

  useEffect(() => {
    if (title) {
      const event = events?.find(
        (ev) => ev.title.toLowerCase() === title.toLowerCase()
      );
      if (event) {
        setVisible(event.id);
        setEvent(event);
        memoryacc.play();
      } else {
        askResident("sorry");
      }
    }
  }, [title]);

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
