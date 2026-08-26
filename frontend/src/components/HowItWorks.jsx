import { useState } from "react";
import { STEPS } from "../data/homepage.js";
import useInView from "../hooks/useInView.js";
import SectionHeading from "./SectionHeading.jsx";

/**
 * Four-step flow with a clickable active step and animated progress line.
 */
export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [ref, visible] = useInView();
  const progress = ((active + 1) / STEPS.length) * 100;

  return (
    <section
      id="how-it-works"
      className="border-y border-mist bg-foam px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      aria-labelledby="how-heading"
    >
      <div ref={ref} className={`mx-auto max-w-6xl reveal ${visible ? "is-visible" : ""}`}>
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title="From a household listing to a recycling intake."
          description="Click each step to walk the loop. SWEEP replaces informal, untracked waste deals with a path every role can follow."
        />

        <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-5 hidden h-1 overflow-hidden rounded-full bg-sand md:block"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-leaf via-lime to-moss transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {STEPS.map((item, index) => {
            const selected = active === index;
            return (
              <li key={item.step} className="relative">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={selected}
                  className={`w-full rounded-3xl p-1 text-left transition-all duration-300 ${selected ? "-translate-y-1" : "hover:-translate-y-0.5"}`}
                >
                  <span
                    className={`relative z-10 grid h-10 w-10 place-items-center rounded-full font-display text-sm shadow-md transition-all ${
                      selected ? "scale-110 bg-forest text-lime shadow-leaf/40" : "bg-moss text-white shadow-leaf/40"
                    }`}
                  >
                    {item.step}
                  </span>
                  <div className="mt-4 overflow-hidden rounded-2xl">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className={`h-28 w-full object-cover transition-all duration-300 ${selected ? "scale-105" : "opacity-80"}`}
                    />
                  </div>
                  <h3 className="mt-4 font-display text-[1.2rem] leading-snug sm:text-xl">{item.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed transition-colors ${selected ? "text-ink" : "text-ink/65"}`}>
                    {item.text}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
