export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand */}
        <div className="text-center md:text-left">
          <p className="text-white font-extrabold text-lg">Sharath<span className="text-blue-500">.</span></p>
          <p className="text-sm mt-1">Full Stack Developer · React · Next.js · CMS</p>
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm">
          <a href="https://github.com/SHARATHKM2004" target="_blank" rel="noopener noreferrer"
            className="hover:text-white transition">GitHub</a>
          <a href="https://www.linkedin.com/in/sharath-km-422707296/" target="_blank" rel="noopener noreferrer"
            className="hover:text-white transition">LinkedIn</a>
          <a href="mailto:kmsharath@ieee.org" className="hover:text-white transition">Email</a>
        </div>

        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Sharath Kori · Built with{' '}
          <span className="text-slate-400">Optimizely CMS + Next.js</span>
        </p>
      </div>
    </footer>
  )
}
