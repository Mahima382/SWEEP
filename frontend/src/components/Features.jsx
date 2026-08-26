import { useState } from "react";
import { BadgeCheck, BarChart3, CalendarClock, Handshake, ShieldCheck } from "lucide-react";
import { FEATURES } from "../data/homepage.js";
import useInView from "../hooks/useInView.js";
import SectionHeading from "./SectionHeading.jsx";

const ICONS = {
  trading: Handshake,
  collection: CalendarClock,
  payments: ShieldCheck,
  records: BadgeCheck,
  impact: BarChart3,
};

/**
 * Feature bento with a spotlight on the hovered or focused card.
 */
export default function Features() {
  const [spotlight, setSpotlight] = useState("trading");
  const [ref, visible] = useInView();

  return (
    <section id="features" className="bg-cream px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="features-heading">
      <div ref={ref} className={`mx-auto max-w-6xl reveal ${visible ? "is-visible" : ""}`}>
        <SectionHeading
          id="features-heading"
          eyebrow="Platform capabilities"
          title="Built for trading, collection, and accountability."
          description="Hover a card to spotlight it. Behind the homepage, SWEEP is designed as a complete waste marketplace."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.id];
            const featured = feature.id === "trading";
            const active = spotlight === feature.id;
            return (
              <article
                key={feature.id}
                onMouseEnter={() => setSpotlight(feature.id)}
                onFocus={() => setSpotlight(feature.id)}
                tabIndex={0}
                className={`cursor-pointer rounded-[1.75rem] border p-6 outline-none transition-all duration-300 hover:-translate-y-1 ${feature.className} ${
                  featured
                    ? "border-transparent bg-[linear-gradient(145deg,#16a34a_0%,#22c55e_55%,#84cc16_100%)] text-white shadow-lg shadow-leaf/30"
                    : active
                      ? "border-leaf bg-lime/40 shadow-lg shadow-leaf/15"
                      : "border-mist bg-white hover:border-moss hover:bg-foam"
                }`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-300 ${active ? "scale-110 rotate-6" : ""} ${featured ? "bg-lime text-forest" : "bg-mist text-forest"}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                  <h3 className={`mt-6 font-display text-[1.45rem] leading-snug sm:text-2xl ${featured ? "text-white" : "text-ink"}`}>
                  {feature.title}
                </h3>
                <p className={`mt-3 max-w-lg text-sm leading-relaxed ${featured ? "text-white/90" : "text-ink/65"}`}>
                  {feature.description}
                </p>
                {featured ? (
                  <p className="mt-8 text-sm font-medium text-lime">
                    Households list · Collectors claim · Recyclers buy
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
