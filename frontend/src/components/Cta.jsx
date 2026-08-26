import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { JOIN_ROLES } from "../data/homepage.js";
import Button from "./Button.jsx";

const COPY = {
  household: {
    title: "Start as a household.",
    text: "List recyclable materials, pick a collection window, and complete a secure handover.",
  },
  collector: {
    title: "Start as a collector.",
    text: "Claim nearby pickups, deliver to recycling partners, and get paid after confirmation.",
  },
  recycler: {
    title: "Start as a recycling partner.",
    text: "Source sorted feedstock with a chain of custody from household listing to facility intake.",
  },
};

/**
 * Closing call-to-action with a role picker.
 */
export default function Cta() {
  const [role, setRole] = useState("household");
  const copy = COPY[role];

  return (
    <section id="signup" className="bg-cream px-4 py-20 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="cta-heading">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#c8f04d_0%,#86efac_48%,#4ade80_100%)] px-6 py-12 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-16">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl animate-float-slow" aria-hidden="true" />
        <div className="relative max-w-xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-forest">Join the loop</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {JOIN_ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={role === item.id}
                onClick={() => setRole(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  role === item.id ? "bg-forest text-white shadow-md" : "bg-white/50 text-forest hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <h2 key={role} id="cta-heading" className="animate-pop-in mt-4 font-display text-[1.85rem] leading-[1.15] text-ink sm:text-4xl">
            {copy.title}
          </h2>
          <p key={`${role}-text`} className="animate-pop-in mt-4 text-base leading-[1.7] text-forest/80">
            {copy.text}
          </p>
        </div>
        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
          <Button href="/register" variant="forest" className="px-6">
            Create {role} account
            <ArrowRight className="h-4 w-4 text-current" strokeWidth={2.5} aria-hidden="true" />
          </Button>
          <Button href="#how-it-works" variant="ghost-dark">
            Review the flow
          </Button>
        </div>
      </div>
    </section>
  );
}
