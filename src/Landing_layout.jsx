import { Outlet } from "react-router-dom";
import React from "react";
import Navbar from "./components/landing_components/Navbar";
import Footer from "./components/landing_components/Footer";

export default function LandingLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer/>
    </>
  );
}
