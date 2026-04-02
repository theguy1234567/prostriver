import React, { useEffect, useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Feedback() {
  const [fadeIn, setFadeIn] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMail = () => {
    const subject = encodeURIComponent("Feedback for ProStriver");
    const body = encodeURIComponent(
      feedback || "Hi ProStriver Team,\n\nI would like to share my feedback:",
    );

    window.location.href = `mailto:support@prostriver.me?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4 py-6">
      <div
        className={`w-full max-w-6xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden grid md:grid-cols-2 transition-all duration-700 ease-out ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Left Branding Panel */}
        <div className="hidden md:flex flex-col justify-center px-10 lg:px-16 py-12 border-r border-zinc-200 dark:border-zinc-800 bg-amber-300 dark:bg-zinc-900">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-4">
            ProStriver
          </p>

          <h1 className="text-5xl lg:text-6xl font-garamound leading-tight text-zinc-900 dark:text-white">
            Your voice shapes <i>pro</i>striver
          </h1>

          <p className="mt-6 text-zinc-600 dark:text-zinc-400 text-lg leading-8">
            Every suggestion, bug report, and idea helps us make your learning
            journey smoother and more magical.
          </p>
          <Link
            to={"/"}
            className="bg-black w-20 mt-10 flex justify-center items-center text-amber-300 px-6 py-2 font-garamound rounded-full"
          >
            Home
          </Link>

          <div className="mt-10 flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
            <Mail size={18} />
            <span>support@prostriver.me</span>
          </div>
        </div>

        {/* Right Feedback Form */}
        <div
          className={`flex items-center justify-center px-6 sm:px-10 py-10 transition-all duration-700 delay-150 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-garamound text-zinc-900 dark:text-white md:hidden">
              Share Feedback
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 mt-2 mb-8 md:mt-0">
              Tell us what you love, what feels broken, or what magic you want
              next.
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-zinc-500 dark:text-zinc-400">
                  Your feedback
                </label>
                <div className="mt-2 relative">
                  <MessageSquare
                    size={18}
                    className="absolute left-4 top-5 text-zinc-400"
                  />
                  <textarea
                    rows="6"
                    placeholder="Write your thoughts here..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-12 pr-4 py-4 outline-none focus:border-zinc-500 text-zinc-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSendMail}
                className="w-full rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Send via Email
              </button>

              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 pt-2">
                Or directly mail us at{" "}
                <span className="font-medium text-zinc-900 dark:text-white">
                  support@prostriver.me
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
