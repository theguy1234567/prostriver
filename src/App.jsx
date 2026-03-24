import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./App.css";
import color from "./assets/timber-bg.jpg";

function App() {
  const navigate = useNavigate();

  const targetTime = new Date("2026-04-01T00:00:00"); //launch time
  const getTime = () => {
    const total = targetTime - new Date();
    const seconds = Math.floor((total / 1000) % 60);
    const min = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    if (total <= 0) {
      return {
        total: 0,
        seconds: 0,
        min: 0,
        hours: 0,
        days: 0,
      };
    }

    return {
      total,
      seconds,
      min,
      hours,
      days,
    };
  };
  const [timeleft, setTimeleft] = useState(getTime());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeleft(getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="min-h-screen    flex flex-col items-center justify-center relative">
        <h1 className="text-5xl z-10 absolute top-0 font-garamound text-shadow-2xs mt-50"><i>Pro</i>Striver</h1>
        <img
          src={color}
          alt="background"
          className="absolute inset-0 w-full h-full object-scale-u z-0 "
        />
        <h1 className="z-10 font-garamound text-6xl ">Live in </h1>

        <div className="text-2xl   p-4 flex mb-10 relative z-10 border-1 rounded-sm">
          <TimeBox label="Days" value={timeleft.days} />{" "}
          <TimeBox label="hours" value={timeleft.hours} />{" "}
          <TimeBox label="Min" value={timeleft.min} />
          <TimeBox label="Sec" value={timeleft.seconds} />
        </div>
      </div>
    </>
  );
}
function TimeBox({ label, value }) {
  return (
    <>
      <div className="flex flex-col">
        <div className="text-8xl p-4 font-mono">
          {value < 10 ? `0${value}` : `${value}`}
        </div>
        <span className="p-4 text-center font-garamound">{label}</span>
      </div>
    </>
  );
}

export default App;
