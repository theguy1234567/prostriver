import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-20 px-4 sm:px-8 md:px-12 lg:px-16 pb-8">
      <div className="bg-gradient-to-br from-amber-100/70 via-white/60 to-orange-100/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2rem] p-6 sm:p-8 md:p-10">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="bg-white/40 rounded-[2rem] p-6 shadow-lg border border-white/30">
            <h1 className="font-averaiserif text-4xl sm:text-5xl">
              <i>Pro</i>
            </h1>
            <h1 className="font-garamound text-6xl sm:text-7xl md:text-8xl leading-none">
              Striver<span className="text-amber-300 font-averaiserif">.</span>
            </h1>
            <p className="mt-4 text-black/70 font-averaiserif text-sm sm:text-base">
              Build habits, stay consistent, and grow with beautifully
              structured challenges, revisions, and learnings.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-white/30 rounded-[2rem] p-6 shadow-lg border border-white/30">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-garamound">Product</h2>
              <a href="/" re className="hover:underline text-black/70">
                Home
              </a>
              <Link to="/login" className="hover:underline text-black/70">
                Login
              </Link>
              <Link to="/signin" className="hover:underline text-black/70">
                Signup
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-garamound">Who we are</h2>
              <Link to={"/about"} className="hover:underline text-black/70">
                Team
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-garamound">Support</h2>

              <Link to={"/feedback"} className="hover:underline text-black/70">
                Feedback
              </Link>
              
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-black/60">
          <p>© 2026 ProStriver. All rights reserved.</p>
          <p>Built for disciplined growth </p>
          <p>Issues? mail us at support@prostriver.me</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
