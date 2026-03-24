function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold">Prostriver</h2>
          <p className="text-gray-400 text-sm mt-2">
            Turn procrastination into progress 🚀
          </p>
        </div>

        {/* Middle Links */}
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition">
            About
          </a>
          <a href="#" className="hover:text-white transition">
            Features
          </a>
          <a href="#" className="hover:text-white transition">
            Contact
          </a>
        </div>

        {/* Right */}
        <div className="text-gray-500 text-sm text-center md:text-right">
          © {new Date().getFullYear()} Prostriver. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
