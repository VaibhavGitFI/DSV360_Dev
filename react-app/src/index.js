import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HashRouter } from "react-router-dom";
import {Provider} from "react-redux";
import { rdxStore } from "./redux/rdxStore";
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <PrimeReactProvider>

  <Provider store={rdxStore}>
  <HashRouter>
    <App />
  </HashRouter>
  </Provider>
  </PrimeReactProvider>

);

reportWebVitals();
