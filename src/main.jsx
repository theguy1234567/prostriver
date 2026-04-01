import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import LandingLayout from "./Landing_layout.jsx";
import App_layout from "./App_layout.jsx";

import Home from "./pages/Landing/Home.jsx";
import Login from "./pages/Landing/Login.jsx";
import Signup from "./pages/Landing/Signup.jsx";

import ProtectedRoutes from "./ProtectedRoutes.jsx";

import AdminRoute from "./AdminRoute.jsx";
import AuthProvider from "./context/AuthContext";
import Admin from "./pages/app/Admin.jsx";
import { AnalyticsProvider } from "./context/AnalyticsContext";

// Pages
import Dashboard from "./pages/app/Dashboard.jsx";
import Profile from "./pages/app/Profile.jsx";
import Revisions from "./pages/app/Revisions.jsx";
import Topics from "./pages/app/Topics.jsx";
// import Challenges from "./pages/app/Challenges.jsx";
import ChangePassword from "./pages/app/ChangePassword.jsx";

import ThemeProvider from "./context/ThemeContext";
import Livein from "./Livein.jsx";
import Public from "./Public.jsx";
import { Toaster } from "react-hot-toast";
import Analytics from "./pages/app/Analytics.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Landing */}
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<Home />} />
      </Route>

      {/* Auth */}
      <Route element={<Public />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signup />} />
      </Route>

      <Route path="/howlong" element={<Livein />} />
      <Route path="/test" element={<App />} />
      {/* Protected (normal users) */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/app" element={<App_layout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="revisions" element={<Revisions />} />
          <Route path="topics" element={<Topics />} />
          <Route path="analytics" element={<Analytics />} />
          {/* <Route path="change-password" element={<ChangePassword />} /> */}
          <Route path="challenges" element={<Challenges />} />
        </Route>
      </Route>

      {/*  ADMIN Check admin routes  */}
      <Route element={<AdminRoute />}>
        <Route element={<ProtectedRoutes />}>
          <Route path="/admin" element={<App_layout />}>
            <Route index element={<Admin />} />
          </Route>
        </Route>
      </Route>
    </>,
  ),
);

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <AnalyticsProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AnalyticsProvider>
    </AuthProvider>
  </ThemeProvider>,
);
