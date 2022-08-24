import React from "react";
import { useLocation } from "react-router-dom";
import logo from "./logo.svg";
import { Event } from "containers/Event";
import { Resident } from "containers/Resident";
import { Home } from "containers/home";
import { Signin } from "containers/Signin";
import { Songs } from "containers/Songs";
import { CrownOutlined, SmileOutlined, UserOutlined } from "@ant-design/icons";
import { PageContainer, ProLayout } from "@ant-design/pro-components";
import { Avatar, Button, Input, Result, Tag } from "antd";
import { useState } from "react";
import { Spin } from "antd";
import { Link, To } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "containers/Auth";
import { useAuth } from "store/useAuth";

import { useGetCurrentUserQuery } from "services/auth";

import "./App.css";
import { Main } from "containers/main";

const NavPages = {
  "#/signin": Signin,
  "#/songs": Songs,
  "#/home": Main,
  "#/events": Event,
  "#/residents": Resident,
};
const defaultProps = {
  routes: [
    {
      path: "#/",
      name: "Memories",
      icon: <CrownOutlined />,
      // component: "./Welcome",
    },
    {
      path: "#/songs",
      name: "Songs",
      icon: <SmileOutlined />,
      // component: "./Welcome",
    },
    {
      path: "#/events",
      name: "Events",
      icon: <UserOutlined />,
      // component: "./Welcome",
    },
    {
      path: "#/residents",
      name: "Residents",
      icon: <SmileOutlined />,
      // component: "./Welcome",
    },
  ],
};

const MainPage = (props) => {
  // const [ searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const [pathname, setPathname] = useState("#/welcome");
  const { user } = useAuth()
  const {data: userQuery, isLoading} = useGetCurrentUserQuery()

  
  
  const Page = NavPages[hash] || NavPages["#/home"];

  if (isLoading) return <Spin style={{ textAlign: 'center'}}/>

  if (hash == "#/signin") {
    return <Page {...props} />;
  }
  return (
    <ProtectedRoute>
      <ProLayout
        route={defaultProps}
        location={{
          pathname,
        }}
        navTheme="light"
        fixSiderbar = {false}
        headerRender={false}
        onMenuHeaderClick={(e) => console.log(e)}
        menuItemRender={(item, dom) => (
          <Link
          to={item.path}
          onClick={() => {
            setPathname(item.path || "#/welcome");
          }}
        >
          {dom}
        </Link>
        ) }
        rightContentRender={() => (
          <div>
            <Avatar shape="square" size="small" icon={<UserOutlined />} />
          </div>
        )}
      >
        <Page {...props} />
      </ProLayout>
    </ProtectedRoute>
  );
};



const App = () => {
 
  return (
    <div className="App">
      <MainPage />
    </div>
  );
};

export default App;
