import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "../data/homepage.js";
import useInView from "../hooks/useInView.js";
import SectionHeading from "./SectionHeading.jsx";

/**
 * Accordion FAQ for the SWEEP marketplace.
 */
export default function Faq() {
  const [open, setOpen] = useState(0);
  const [ref, visible] = useInView();

  return (
    <section id="faq" className="bg-foam px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="faq-heading">
      <div ref={ref} className={`mx-auto max-w-6xl reveal ${visible ? "is-visible" : ""}`}>
        <SectionHeading
          id="faq-heading"
          eyebrow="Questions"
          title="Frequently asked questions."
          description="Straight answers about roles, listings, payments, and how SWEEP tracks what actually gets recycled."
        />

        <div className="mt-12 space-y-3">
          {FAQS.map((item, index) => {
            const expanded = open === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <article
                key={item.question}
                className={`overflow-hidden rounded-[1.5rem] border transition-colors ${
                  expanded ? "border-leaf bg-white shadow-md shadow-leaf/10" : "border-mist bg-white hover:border-moss"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className="font-display text-[1.15rem] leading-snug text-ink sm:text-xl">{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-leaf transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-all duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <p className="overflow-hidden px-5 pb-0 text-sm leading-relaxed text-ink/70 sm:px-6">
                    <span className={`block pb-5 ${expanded ? "pt-0" : ""}`}>{item.answer}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
