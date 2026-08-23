import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { STATS } from "../data/homepage.js";
import useInView from "../hooks/useInView.js";
import SectionHeading from "./SectionHeading.jsx";

/**
 * Animates a numeric stat when the impact section enters view.
 * @param {{ value: string }} props
 */
function CountUp({ value }) {
  const target = Number(value);
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView({ threshold: 0.4 });

  useEffect(() => {
    if (!visible || Number.isNaN(target)) return undefined;
    const start = performance.now();
    let frame = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / 900, 1);
      setCount(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, target]);

  return <span ref={ref}>{Number.isNaN(target) ? value : count}</span>;
}

/**
 * Impact band describing the environmental purpose of the marketplace.
 */
export default function Impact() {
  const [ref, visible] = useInView();

  return (
    <section
      id="impact"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#15803d_0%,#16a34a_100%)] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
      aria-labelledby="impact-heading"
    >
      <div className="pointer-events-none absolute -left-10 top-8 h-48 w-48 rounded-full bg-lime/30 blur-3xl animate-pulse-soft" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-8 bottom-0 h-56 w-56 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
      <div ref={ref} className={`relative mx-auto max-w-6xl reveal ${visible ? "is-visible" : ""}`}>
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              id="impact-heading"
              light
              eyebrow="Environmental purpose"
              title="Less landfill. More material back in circulation."
              description="SWEEP exists so recyclable waste is traded and processed instead of dumped. Every completed collection is a measurable diversion from the informal dump path."
            />
          </div>
          <p className="flex items-start gap-3 text-sm leading-relaxed text-white/85 lg:col-span-5">
            <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-lime" aria-hidden="true" />
            The platform does not invent impact numbers. It records what actually moved: listings closed, kilograms collected, and intakes confirmed by recycling partners.
          </p>
        </div>

        <dl className="mt-14 grid gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] border border-white/20 bg-white/10 px-6 py-8 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:bg-white/20"
            >
              <dt className="text-sm text-white/75">{stat.label}</dt>
              <dd className="mt-3 font-display text-[2.75rem] leading-none text-lime sm:text-5xl">
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
