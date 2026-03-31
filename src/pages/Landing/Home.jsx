import bgimg from "../../assets/timber-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import img1 from "../../assets/test1.jpg";
import img2 from "../../assets/test2.jpg";
import img3 from "../../assets/test3.jpg";

import { TrendingUp, BookOpen, Plus, Shell } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const images = [img1, img2, img3];

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-x-hidden"
      style={{ backgroundImage: `url(${bgimg})` }}
    >
      {/* HERO */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6">
        {/* Title */}
        <div className="w-full md:w-[70%] mt-20 md:mt-32 fade-up [animation-delay:0.2s] opacity-0">
          <span className="text-[40px] sm:text-[60px] md:text-[70px] lg:text-[100px] flex flex-col font-garamound leading-none select-none text-shadow-lg">
            <p>Build habits. Grow fast</p>
            <p>
              Be &#123;<i>Pro</i>Striver&#125;.
            </p>
          </span>
        </div>

        <p className="mt-4 sm:mt-6 mb-8 md:mb-10 text-lg sm:text-2xl md:text-4xl font-averaiserif fade-up [animation-delay:0.4s] opacity-0">
          Your Flow state Begins here
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 fade-up [animation-delay:0.6s] opacity-0">
          <button
            onClick={() => navigate("/login")}
            className="bg-sky-400/50 px-6 py-3 rounded-lg text-lg sm:text-xl hover:bg-sky-200 shadow-lg transition hover:-translate-y-1"
          >
            Get started
          </button>

          <button
            onClick={() => navigate("/howlong")}
            className="flex items-center justify-center gap-2 bg-red-200/40 px-6 py-3 rounded-lg text-lg sm:text-xl hover:bg-red-200 shadow-lg transition hover:-translate-y-1"
          >
            <span className="live-dot"></span>
            Live in
          </button>
        </div>

        {/* BELOW HERO */}
        <div className="w-full md:w-[85%] relative mt-10 md:mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl fade-up [animation-delay:0.8s] opacity-0">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-4 md:mb-6 fade-up [animation-delay:1s] opacity-0">
            {["Challenges", "Topics", "Revisions"].map((tab, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`px-3 md:px-4 py-2 rounded-full text-sm md:text-base transition ${
                  index === i
                    ? "bg-white/30 text-black font-semibold"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Slider (UNCHANGED HEIGHT) */}
          <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-xl fade-up [animation-delay:1.2s] opacity-0">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  className="w-full h-96 flex-shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${img})` }}
                />
              ))}
            </div>
          </div>

          {/* CONSISTENCY */}
          <div className="hidden sm:flex absolute top-3/4 left-2 md:left-0 -translate-y-1/2 items-center gap-2 md:gap-3 text-sm md:text-2xl px-3 md:px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md fade-up [animation-delay:1.4s] opacity-0">
            <TrendingUp className="text-green-400" size={24} />
            <span>Your Consistency</span>
          </div>

          {/* LEARNINGS */}
          <div className="hidden sm:flex absolute top-10 right-2 md:right-0 items-center gap-2 md:gap-3 text-sm md:text-2xl px-3 md:px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md fade-up [animation-delay:1.6s] opacity-0">
            <BookOpen className="text-blue-400" size={24} />
            <span>Your Learnings</span>
          </div>
        </div>
      </div>

      {/* FLOATING ICONS */}
      <div className="hidden sm:block absolute top-[60%] right-4 md:right-10 text-sky-300 hover:rotate-90 transition duration-500 fade-up [animation-delay:1.8s] opacity-0">
        <Plus size={40} />
      </div>

      <div className="hidden sm:block absolute top-[75%] left-4 md:left-10 text-pink-300 hover:rotate-45 transition duration-300 fade-up [animation-delay:2s] opacity-0">
        <Shell size={40} />
      </div>
    </div>
  );
}

export default Home;
