import { Button, Input, Result, Tag, Modal } from "antd";
import {
  PageContainer,
  ProFormTextArea,
  ProFormGroup,
} from "@ant-design/pro-components";
import { useState } from "react";
import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormSelect,
} from "@ant-design/pro-components";
import type { UploadFile } from "antd/es/upload";
import { selectResidents } from "state/resident/residentSlice";
import { useGetResidentsQuery } from "services/resident";
import { useCreateEventMutation } from "services/event";
import type { Resident } from "services/resident";

import axios from "axios";
import { useAppSelector } from "store/hooks";
import { useGetEventsQuery } from "services/event";
import React from "react";
import { message } from "antd";
import { EventList } from "./eventList";
import { UploadPhotos } from "./UploadPhotos";
import { UploadSongs } from "./UploadSongs";
import { Typography } from "antd";
import { useSaveMediaMutation } from "services/media";

const axiosInstance = axios.create({ baseURL: process.env.REACT_APP_STRAPI_URL, headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}})
export const Event = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: residentQuery } = useGetResidentsQuery();
  const { data: eventsQuery, refetch } = useGetEventsQuery();
  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [resident, setResident] = useState<number>();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [options, setOptions] = useState<Record<string, any>>();
  const [songs, setSongs] = useState<UploadFile[]>([]);
  const [photos, setPhotos] = useState<UploadFile[]>([]);
  const [playing, setPlaying] = useState<boolean>(true);

  const selectedResidents = useAppSelector(selectResidents);

  const [saveMedia, { data: mediaData, error }] = useSaveMediaMutation();
  const [createEvent] = useCreateEventMutation();

  const submitEvent = async () => {
    if (title) {
      try {
        const response = await createEvent({
          Title: title,
          resident: Number(resident),
          Description: description,
        }).unwrap();
        if (photos.length) {
        
          const formData = new FormData()
          formData.append("ref", "api::event.event");
          formData.append("refId", `${response.id}`);
          formData.append("field", "Photos");
          const result = await handleUpload(photos, formData);
        }
        if (songs.length) {
          const formData = new FormData()
          formData.append("ref", "api::event.event");
          formData.append("refId", `${response.id}`);
          formData.append("field", "Songs");

          const result = await handleUpload(songs, formData);
        }

        refetch();
      } catch (error) {
        console.log("Error: ", error);
      }
    }
  };
  const handleUpload = async (files: UploadFile[], formData: FormData) => {
    Array.from(files).forEach((file) =>
      formData.append("files", file.originFileObj)
    );
    console.log("FormData: ", formData)

    try {
      await axiosInstance.post("/api/upload", formData)
      // console.log(response);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  React.useEffect(() => {
    setResidents(selectedResidents);
    const obj = {};
    selectedResidents.forEach((ele) => {
      obj[ele.id] = ele.residentId;
    });
    setOptions(obj);
  }, [selectedResidents]);

  const renderResidentEvents = (residents = []) => {
    return <EventList onOpen={() => setIsModalVisible(true)} />;
  };

  return (
    <div>
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

          <Button key="2" type="primary">
            Log Out
          </Button>,
        ]}
      >
        <div
          style={{
            height: "180vh",
          }}
        >
          {renderResidentEvents(residents)}

          <ModalForm<{
            name: string;
            company: string;
          }>
            title="Add Event"
            visible={isModalVisible}
            autoFocusFirstInput
            onVisibleChange={setIsModalVisible}
            onFinish={async (values) => {
              submitEvent();
              message.success("Submit");
              return true;
            }}
          >
            <ProFormGroup>
              <ProFormSelect
                name="Resident"
                fieldProps={{
                  onChange: (value) => setResident(Number(value)),
                }}
                label=" Resident "
                valueEnum={options}
                placeholder=" Please select a resident "
                rules={[
                  { required: true, message: "Please select a resident" },
                ]}
              />
            </ProFormGroup>
            <ProForm.Group>
              <ProFormText
                width="md"
                name="name"
                label="Event Title"
                fieldProps={{
                  onChange: (event) => setTitle(event.target.value),
                  value: title,
                }}
                tooltip="Event Title"
                placeholder="Enter Resident Id"
              />

              <ProFormTextArea
                width={"xl"}
                label=" Description "
                name=" Description "
                fieldProps={{
                  onChange: (event) => setDescription(event.target.value),
                  value: description,
                }}
                placeholder="Enter the description of the event"
              />
            </ProForm.Group>

            <div
              style={{
                paddingBottom: 10,
              }}
            >
              {" "}
              Upload Photos{" "}
            </div>

            <UploadPhotos handleMedia={setPhotos} />

            <div
              style={{
                paddingBottom: 10,
              }}
            >
              {" "}
              Upload Songs{" "}
            </div>

            <UploadSongs handleMedia={setSongs} />
          </ModalForm>
        </div>
      </PageContainer>
    </div>
  );
};
