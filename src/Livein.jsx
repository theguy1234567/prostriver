import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./App.css";
import color from "./assets/timber-bg.jpg";

/* 🔥 ICONS */
import { Sparkles, Zap, Camera } from "lucide-react";

function Livein() {
  const navigate = useNavigate();

  const targetTime = new Date("2026-04-02T00:00:00");

  const getTime = () => {
    const total = targetTime - new Date();
    const seconds = Math.floor((total / 1000) % 60);
    const min = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    if (total <= 0) {
      return { total: 0, seconds: 0, min: 0, hours: 0, days: 0 };
    }

    return { total, seconds, min, hours, days };
  };

  const [timeleft, setTimeleft] = useState(getTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeleft(getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 overflow-hidden">
      {/* 🔥 ICONS (Responsive Positions) */}
      <div className="absolute left-4 md:left-10 top-1/3 z-10 opacity-0 hover:rotate-45 transition duration-500 fade-up [animation-delay:0.6s]">
        <Sparkles size={24} className="md:size-[28px]" />
      </div>

      <div className="absolute right-6 md:right-16 bottom-1/4 z-10 opacity-0 hover:rotate-90 transition duration-500 fade-up [animation-delay:0.8s]">
        <Camera size={26} className="md:size-[30px]" />
      </div>

      <div className="absolute right-4 md:right-10 bottom-1/3 z-10 opacity-0 hover:rotate-90 transition duration-500 fade-up [animation-delay:1s]">
        <Zap size={26} className="md:size-[30px]" />
      </div>

      <div className="absolute left-6 md:left-20 bottom-1/2 z-10 opacity-0 hover:rotate-90 transition duration-500 fade-up [animation-delay:1.2s]">
        <Zap size={22} className="md:size-[28px]" />
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl z-10 absolute top-6 md:top-10 font-garamound fade-up [animation-delay:0.2s] opacity-0">
        <i>Pro</i>Striver
      </h1>

      {/* Background */}
      <img
        src={color}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Heading */}
      <h1 className="z-10 font-garamound text-4xl md:text-6xl fade-up [animation-delay:0.4s] opacity-0">
        Live in
      </h1>

      {/* Timer */}
      <div className="flex flex-wrap justify-center text-center text-lg md:text-2xl p-4 mb-10 relative z-10 border rounded-t-lg backdrop-blur-lg fade-up [animation-delay:0.6s] opacity-0">
        <TimeBox label="Days" value={timeleft.days} delay="0.8s" />
        <TimeBox label="Hours" value={timeleft.hours} delay="1s" />
        <TimeBox label="Min" value={timeleft.min} delay="1.2s" />
        <TimeBox label="Sec" value={timeleft.seconds} delay="1.4s" />
      </div>
      <button
        onClick={() => {
          navigate("/");
        }}
        className="z-10 bg-sky-400/20 px-6 py-2 rounded-lg text-xl hover:bg-sky-200  transition hover:-translate-y-1"
      >
        Home
      </button>
    </div>
  );
}

function TimeBox({ label, value, delay }) {
  return (
    <div
      className="flex flex-col items-center fade-up opacity-0 px-2 md:px-4"
      style={{ animationDelay: delay }}
    >
      <div className="text-4xl md:text-8xl font-mono">
        {value < 10 ? `0${value}` : `${value}`}
      </div>
      <span className="text-sm md:text-base font-garamound">{label}</span>
    </div>
  );
}

export default Livein;
