import React from "react";
import { Outlet } from "react-router-dom";

export default function Main_layout() {
  return (
    <>
      
      <Outlet />
    </>
  );
}
// this is for pages that have no header footer only the body
