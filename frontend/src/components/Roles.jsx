import { useState } from "react";
import { ArrowRight, Factory, House, Truck } from "lucide-react";
import { ROLES } from "../data/homepage.js";
import useInView from "../hooks/useInView.js";
import SectionHeading from "./SectionHeading.jsx";

const ICONS = {
  households: House,
  collectors: Truck,
  recyclers: Factory,
};

/**
 * Three-sided marketplace roles with a selectable card state.
 */
export default function Roles() {
  const [selected, setSelected] = useState("households");
  const [ref, visible] = useInView();

  return (
    <section id="roles" className="relative overflow-hidden bg-cream px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="roles-heading">
      <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-lime/40 blur-3xl" aria-hidden="true" />
      <div ref={ref} className={`mx-auto max-w-6xl reveal ${visible ? "is-visible" : ""}`}>
        <SectionHeading
          id="roles-heading"
          eyebrow="Who SWEEP serves"
          title="One platform. Three roles. One circular loop."
          description="Tap a role to see how you would join. Households generate recyclable material. Collectors move it. Recycling companies process it."
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {ROLES.map((role, index) => {
            const Icon = ICONS[role.id];
            const active = selected === role.id;
            return (
              <li key={role.id} style={{ transitionDelay: visible ? `${index * 90}ms` : "0ms" }}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  onClick={() => setSelected(role.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(role.id);
                    }
                  }}
                  className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border text-left shadow-[0_18px_50px_-28px_rgba(21,128,61,0.45)] transition-all duration-300 hover:-translate-y-1.5 ${
                    active
                      ? "border-leaf bg-lime/40 ring-2 ring-leaf/40"
                      : "border-mist bg-white hover:border-moss"
                  }`}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={role.image}
                      alt={role.imageAlt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className={`absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-2xl text-white shadow-md shadow-leaf/30 ${active ? "bg-forest" : "bg-moss"}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="absolute right-4 top-3 font-display text-3xl text-white/80">0{index + 1}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">
                    {role.kicker}
                  </p>
                  <h3 className="mt-2 font-display text-[1.45rem] leading-snug sm:text-2xl">{role.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{role.description}</p>
                  <ul className="mt-6 space-y-2 text-sm text-ink/80">
                    {role.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#signup"
                    className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-all ${
                      active ? "translate-x-0 text-forest opacity-100" : "translate-x-0 text-leaf opacity-70 group-hover:opacity-100"
                    }`}
                  >
                    Join as {role.title.toLowerCase()}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
