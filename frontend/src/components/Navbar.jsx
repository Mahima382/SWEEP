import { useEffect, useState } from "react";
import { Menu, Recycle, X } from "lucide-react";
import { NAV_LINKS } from "../data/homepage.js";
import Button from "./Button.jsx";

/**
 * Site header with scroll progress, active section highlighting, and an animated mobile drawer.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("#top");

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (window.scrollY / height) * 100 : 0);
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["top", ...NAV_LINKS.map((link) => link.href.slice(1))];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onHero = !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        onHero ? "bg-transparent text-white" : "bg-cream/90 text-ink shadow-sm shadow-leaf/10 backdrop-blur-md"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="group flex items-center gap-2.5" aria-label="SWEEP home">
          <span
            className={`grid h-9 w-9 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-180 ${onHero ? "bg-lime text-forest" : "bg-moss text-white"}`}
          >
            <Recycle className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="font-display text-xl tracking-tight">SWEEP</span>
        </a>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-2 transition-all duration-200 ${
                  isActive
                    ? onHero
                      ? "bg-white/20 text-white"
                      : "bg-lime text-ink shadow-sm"
                    : onHero
                      ? "text-white/85 hover:bg-white/10 hover:text-white"
                      : "text-forest/75 hover:bg-sand hover:text-forest"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button href="#signup" variant={onHero ? "ghost" : "ghost-dark"}>
            Sign in
          </Button>
          <Button href="#signup" variant={onHero ? "lime" : "forest"}>
            Join SWEEP
          </Button>
        </div>

        <button
          type="button"
          className={`grid h-11 w-11 place-items-center rounded-full transition-transform duration-200 hover:scale-105 md:hidden ${onHero ? "bg-white/20" : "bg-mist"}`}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-mist bg-cream text-ink transition-all duration-300 md:hidden ${
          open ? "max-h-[28rem] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
                active === link.href ? "bg-lime text-ink" : "hover:bg-sand"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2 px-1 pb-2">
            <Button href="#signup" variant="ghost-dark" className="w-full" onClick={() => setOpen(false)}>
              Sign in
            </Button>
            <Button href="#signup" variant="forest" className="w-full" onClick={() => setOpen(false)}>
              Join SWEEP
            </Button>
          </div>
        </nav>
      </div>

      <div className="h-0.5 w-full bg-white/10" aria-hidden="true">
        <div className="h-full bg-lime transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}
