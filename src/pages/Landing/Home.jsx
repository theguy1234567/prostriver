import bgimg from "../../assets/timber-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import img1 from "../../assets/Dashboard_preview_img.jpeg";
import img2 from "../../assets/Challenge_preview_img.jpeg";
import img3 from "../../assets/Revisions_preview_img.jpeg";
import img4 from "../../assets/Dashboard2_preview_img.jpeg";

import mobileTopic from "../../assets/mobile_dashboard.png";
import mobileRevision from "../../assets/mobile_revision.png";

import { Plus, Shell } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const images = [
    {
      desktop: img2,
      mobile: img2,
    },
    {
      desktop: img1,
      mobile: mobileTopic,
    },
    {
      desktop: img3,
      mobile: mobileRevision,
    },
  ];

  useEffect(() => {
    const sections = document.querySelectorAll(".reveal-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.15 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className=" ">
        <div
          className="rounded-b-full sm:rounded-b-2xl relative min-h-screen bg-cover bg-center rounded-b-4xl bg-no-repeat overflow-x-hidden reveal-section"
          style={{ backgroundImage: `url(${bgimg})` }}
        >
          {/* HERO */}
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6">
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

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 fade-up [animation-delay:0.6s] opacity-0">
              <button
                onClick={() => navigate("/login")}
                className="font-garamound bg-amber-300/50 px-6 py-3 rounded-lg text-lg sm:text-xl hover:bg-amber-300 shadow-lg transition hover:-translate-y-1"
              >
                Get started
              </button>
            </div>

            {/* HERO SLIDER (UNCHANGED) */}
            <div className="w-full md:w-[85%] relative mt-10 md:mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl fade-up [animation-delay:0.8s] opacity-0">
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

              <div className="w-full h-64 sm:h-80 md:h-[500px] overflow-hidden rounded-xl flex items-center rounded-2xl justify-center fade-up [animation-delay:1.2s] opacity-0">
                <div
                  className="flex rounded-2xl transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${index * 100}%)` }}
                >
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="w-full h-64 sm:h-80 md:h-96 rounded-2xl flex-shrink-0 overflow-hidden"
                    >
                      <picture>
                        <source
                          media="(max-width: 640px)"
                          srcSet={img.mobile}
                        />
                        <img
                          src={img.desktop}
                          alt={`Preview ${i}`}
                          className="w-full h-full object-cover object-top sm:object-center scale-90 sm:scale-100 transition-all duration-500"
                        />
                      </picture>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block absolute top-[60%] right-4 md:right-10 text-sky-300 hover:rotate-90 transition duration-500 fade-up [animation-delay:1.8s] opacity-0">
            <Plus size={40} />
          </div>

          <div className="hidden sm:block absolute top-[75%] left-4 md:left-10 text-pink-300 hover:rotate-45 transition duration-300 fade-up [animation-delay:2s] opacity-0">
            <Shell size={40} />
          </div>
        </div>

        {/* PRODUCT SHOWCASE */}
        <div className="mx-4 sm:mx-8 md:mx-12 lg:mx-16 mt-12 mb-16">
          <div className="bg-gradient-to-br from-amber-100/70 via-white/60 to-orange-100/70 backdrop-blur-xl border border-amber-300/40 shadow-sm rounded-[2rem] p-6 sm:p-8 md:p-10 space-y-8">
            {/* TOP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 reveal-section">
              <div className="bg-white/40 rounded-[2rem] p-6 sm:p-8 shadow-sm  border border-white/30 flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-garamound leading-tight">
                  All your learnings <br /> in one peaceful place
                </h1>
                <p className="mt-4 text-base sm:text-lg text-black/70 font-averaiserif">
                  Organize your topics, revisions, and challenges beautifully
                  while staying in your flow state.
                </p>
              </div>

              {/* HIDDEN ONLY ON MOBILE */}
              <div className="hidden md:block bg-gradient-to-br from-sky-200/60 to-indigo-200/50 rounded-[2rem] overflow-hidden shadow-sm border border-white/30 min-h-[300px]">
                <img
                  src={img4}
                  alt="Dashboard preview"
                  className="w-full h-full object-contain sm:object-cover p-2 sm:p-0 transition-all duration-500"
                />
              </div>
            </div>

            {/* MIDDLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="hidden md:block bg-gradient-to-br from-emerald-100/70 to-teal-100/60 rounded-[2rem] overflow-hidden shadow-xl border border-white/30 min-h-[280px] reveal-section">
                <img
                  src={img3}
                  alt="Revision preview"
                  className="w-full h-full object-contain sm:object-cover p-2 sm:p-0 transition-all duration-500"
                />
              </div>

              <div className="bg-amber-300 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-white/30 flex flex-col justify-center reveal-section">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-garamound leading-tight">
                  Never Forget With <br /> Smart Revisions
                </h2>
                <p className="text-black/70 font-averaiserif text-lg">
                  Revisit concepts at the perfect time so your memory compounds
                  over time and every study session becomes more effective.
                </p>
              </div>

              <div className="bg-gradient-to-br from-rose-100/70 to-orange-100/60 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-white/30 flex flex-col justify-center reveal-section">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-garamound leading-tight">
                  Keep Striving with <br /> Challenges
                </h2>
                <p className="text-black/70 font-averaiserif text-lg">
                  Stay consistent with structured challenges designed to build
                  unstoppable momentum.
                </p>
              </div>

              <div className="hidden md:block bg-gradient-to-br from-rose-100/70 to-orange-100/60 rounded-[2rem] overflow-hidden shadow-xl border border-white/30 min-h-[280px] reveal-section">
                <img
                  className="w-full h-full object-contain sm:object-cover p-2 sm:p-0 transition-all duration-500"
                  src={img2}
                  alt="Challenge preview"
                />
              </div>
            </div>

            {/* BOTTOM */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-purple-100/70 to-pink-100/60 rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl border border-white/30 text-center sm:text-left reveal-section">
              <div className="bg-amber-300 rounded-full h-14 w-14 flex items-center justify-center text-2xl shadow-md">
                ✦
              </div>

              <div className="flex flex-col justify-center items-center">
                <h2 className="text-3xl sm:text-4xl font-garamound">
                  Build unstoppable momentum
                </h2>
                <p className="mt-4 text-center text-black/70 font-averaiserif text-lg max-w-3xl">
                  Turn daily consistency into visible growth with challenges,
                  streaks, revisions, and a beautifully structured dashboard
                  that keeps you in your flow state.
                </p>
              </div>

              <div className="bg-amber-300 rounded-full h-14 w-14 flex items-center justify-center text-2xl shadow-md">
                ✦
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
