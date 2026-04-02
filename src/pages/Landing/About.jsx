import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function About() {
  useEffect(() => {
    const cards = document.querySelectorAll(".fade-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-amber-300 relative px-4 sm:px-8 md:px-12 py-20 overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-14 fade-card">
        <p className="text-sm sm:text-base uppercase tracking-[0.3em] text-amber-200/70">
          Meet the Team
        </p>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-garamound mt-4">
          The Magicians
        </h1>
        <p className="text-amber-100/70 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
          The minds behind ProStriver — blending design, engineering, backend
          systems, and AI into one magical learning experience.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <div className="fade-card bg-amber-300 text-black rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-garamound">
            The Backend Wizard
          </h2>
          <h2 className="text-2xl sm:text-3xl font-garamound font-bold">
            Pranay Panakanti
          </h2>
          <a
            className="bg-black"
            target="_blank"
            href="https://www.linkedin.com/in/pranay-panakanti/"
          >
            <ArrowUpRight />
          </a>
          <p className="mt-3 text-black/70">
            Crafts secure APIs, scalable systems, and magical data flows that
            keep every challenge, streak, and revision running flawlessly.
          </p>
        </div>

        <div className="fade-card relative bg-amber-300 text-black rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-garamound">
            The AI Trainer
          </h2>
          <p className="text-amber-300 rounded-full px-6  bg-black  font-garamound absolute top-10 right-6">
            AI .comming soon
          </p>
          <h2 className="text-2xl sm:text-3xl font-garamound font-bold">
            Vidhi Srivastava
          </h2>
          <a
            className="bg-black"
            target="_blank"
            href="https://www.linkedin.com/in/vidhi-srivastava-a96aa4279/"
          >
            <ArrowUpRight />
          </a>
          <p className="mt-3 text-black/70">
            Shapes intelligent learning paths, smart revision timing, and
            adaptive challenge systems that make growth feel effortless.
          </p>
        </div>

        <div className="fade-card bg-amber-300 text-black rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-garamound">
            The Frontend Breaker
          </h2>
          <h2 className="text-2xl sm:text-3xl font-garamound font-bold">
            Kaushik Appannagari
          </h2>
          <a
            className="bg-black"
            href="https://www.linkedin.com/in/appannagari-kaushik-9107543ab/"
            target="_blank"
          >
            <ArrowUpRight />
          </a>

          <p className="mt-3 text-black/70">
            Turns ideas into beautiful interfaces with smooth animations,
            responsive layouts, and pixel-perfect interactions.
          </p>
        </div>

        <div className="fade-card bg-amber-300 text-black rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-garamound">
            The Design Intruder
          </h2>
          <h2 className="text-2xl sm:text-3xl font-garamound font-bold">
            Shreya Dutta
          </h2>
          <a
            className="bg-black"
            target="_blank"
            href="https://www.linkedin.com/in/shreyadutta18/"
          >
            <ArrowUpRight />
          </a>
          <p className="mt-3 text-black/70">
            Sneaks elegance into every screen through typography, motion,
            spacing, and immersive visual storytelling.
          </p>
        </div>
      </div>

      <div className="text-center mt-16 fade-card">
        <p className="text-lg sm:text-xl mb-10 text-amber-100/70 max-w-3xl mx-auto">
          “Magic is just discipline, beautifully designed.”
        </p>
        <Link
          to={"/"}
          className="bg-amber-300 text-sm font-garamound mt-10  text-black rounded-2xl px-10 py-2"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
