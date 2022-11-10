import { Avatar, Button, Empty, Input, Result, Tag, Modal } from "antd";
import { PageContainer, ProLayout } from "@ant-design/pro-components";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProForm, ProFormText } from "@ant-design/pro-components";
import { message } from "antd";
import { useCreateResidentMutation } from "services/resident";
import { MemberList } from "./memberList";

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const Resident = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [residents, setResidents] = useState<String[]>(['1']);
  const [createResident, { data, error }] = useCreateResidentMutation();
  const [residentId, setResidentId] = useState<string>();
  const [roomNo, setRoomNo] = useState<string>();

  const handleSubmit = async () => {
    if (residentId && roomNo) {
      try {
        const response = await createResident({
          ResidentId: residentId,
          RoomNo: roomNo,
        }).unwrap();
        console.log(response);
       
      } catch (error) {
        console.log("Error: ", error);
      }
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderResidents = (residents = []) => {
    if(residents.length) {
        return <MemberList onOpen={() => setIsModalVisible(true)} />
    }
    return (
        <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
              height: 60,
            }}
            description={<span>No Residents Found</span>}
          >
            <Button type="primary" onClick={showModal}>
              <PlusOutlined />
              Add New Resident
            </Button>
          </Empty>

    )
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
          

          {renderResidents(residents)}
                
          <ModalForm<{
            name: string;
            company: string;
          }>
            title="Add Resident"
            visible={isModalVisible}
            autoFocusFirstInput
            onVisibleChange={setIsModalVisible}
            
            onFinish={async (values) => {
              handleSubmit()
              // await waitTime(2000);
              // console.log(values.name);
              message.success("Submit");
              return true;
            }}
          >
            <ProForm.Group>
              <ProFormText
                width="md"
                name="name"
                fieldProps={{
                  onChange: event => setResidentId(event.target.value),
                  value: residentId
                }}
                label="Resident Id"
                tooltip="Resident Id"
                placeholder="Enter Resident Id"
              />

              <ProFormText
                width="md"
                name="room_no"
                fieldProps={{
                  onChange: event => setRoomNo(event.target.value),
                  value: roomNo
                }}
                label="Room Number"
                placeholder="Enter Room Number"
              />
            </ProForm.Group>
          </ModalForm>
        </div>
      </PageContainer>
    </div>
  );
};
