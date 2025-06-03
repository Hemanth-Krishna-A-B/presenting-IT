"use client";
import BigScreenDashboard from "../../components/large/BigScreenDashboard";
import MobileAdminDashboard from "../../components/small/MobileAdminDashboard";
import Loading from "../../loading";
import { useState, useEffect } from "react";



export default function AdminDashboard() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();

    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  if (isMobile === null) {
    return <Loading/>;
  }

  return isMobile ? <MobileAdminDashboard/> : <BigScreenDashboard/>
}
