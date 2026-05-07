export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-sm text-slate-500">
      &copy; {new Date().getFullYear()} My CMS Site &mdash; Built with Optimizely CMS + Next.js
    </footer>
  )
}
