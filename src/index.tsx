import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import enUS from "antd/es/locale/en_US";
import "antd/dist/antd.min.css";
import "@ant-design/pro-components/dist/components.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import { store } from "store";
import { AuthProvider } from "containers/Auth";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider>
          <ConfigProvider locale={enUS}>
            <App />
          </ConfigProvider>
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
