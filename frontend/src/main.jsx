import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { CourseProvider } from "./context/CourseContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import { SiteSettingsProvider } from "./context/SiteSettingsContext.jsx";
import { UserPreferencesProvider } from "./context/UserPreferencesContext.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SiteSettingsProvider>
      <UserPreferencesProvider>
        <UserProvider>
          <CourseProvider>
            <AdminProvider>
              <App />
            </AdminProvider>
          </CourseProvider>
        </UserProvider>
      </UserPreferencesProvider>
    </SiteSettingsProvider>
  </React.StrictMode>
);