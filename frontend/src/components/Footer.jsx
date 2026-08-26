import { Recycle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FOOTER_COLUMNS, homeHash } from "../data/homepage.js";

/**
 * Site footer with brand summary and in-page navigation.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const isHome = useLocation().pathname === "/";

  return (
    <footer className="border-t border-mist bg-foam px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="SWEEP home">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-moss text-white transition-transform duration-300 group-hover:rotate-180">
              <Recycle className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-display text-xl tracking-tight text-forest">SWEEP</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65">
            A web-based waste management and recycling platform connecting households, garbage collectors, and recycling companies for efficient collection, trading, and secure transactions.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{column.title}</p>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={homeHash(link.href, isHome)} className="text-sm text-ink/70 transition-all hover:translate-x-1 hover:text-forest">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-mist pt-6 text-xs text-forest/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} SWEEP. Academic software engineering laboratory project.</p>
        <p>Photos from Unsplash · Households · Collectors · Recyclers</p>
      </div>
    </footer>
  );
}
