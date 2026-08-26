import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, MapPin, Recycle, ShieldCheck, Sparkles } from "lucide-react";
import { MATERIAL_SAMPLES, MATERIALS } from "../data/homepage.js";
import Button from "./Button.jsx";

/**
 * Full-viewport hero with a live material sample and claimable listing card.
 */
export default function Hero() {
  const [material, setMaterial] = useState("Plastic");
  const [claimed, setClaimed] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const sample = MATERIAL_SAMPLES[material];

  const onMove = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: y * 10 });
  };

  const onLeave = () => setTilt({ x: 0, y: 0 });

  const claimPickup = () => {
    setClaimed(true);
    window.setTimeout(() => setClaimed(false), 2600);
  };

  return (
    <section
      id="top"
      className="relative overflow-hidden text-white"
      aria-labelledby="hero-heading"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(160deg,#0f9d58_0%,#16c260_46%,#7be35a_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-lime/50 blur-3xl animate-pulse-soft"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[-4rem] top-32 h-72 w-72 rounded-full bg-white/25 blur-3xl animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-8 left-1/3 h-40 w-40 rounded-full bg-lime/40 blur-2xl animate-float-delayed"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-24 lg:pt-36">
        <div className="lg:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-lime backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Fresh waste marketplace
          </p>
          <h1
            id="hero-heading"
            className="mt-5 font-display text-[2.35rem] leading-[1.12] sm:text-[3rem] lg:text-[3.35rem] lg:leading-[1.08]"
          >
            Waste has value. Stop treating it like trash.
          </h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-[1.7] text-white/90 sm:text-[1.125rem]">
            SWEEP connects households, garbage collectors, and recycling companies so materials
            can be listed, collected, traded, and processed — with a record you can trust.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/register" variant="forest" className="px-6 py-3.5">
              Get started
              <ArrowRight className="h-4 w-4 text-current" strokeWidth={2.5} aria-hidden="true" />
            </Button>
            <Button href="#how-it-works" variant="ghost" className="px-6 py-3.5">
              See how it works
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-white/25 pt-6">
            {[
              { href: "#roles", label: "Households", value: "List waste" },
              { href: "#roles", label: "Collectors", value: "Run pickups" },
              { href: "#roles", label: "Recyclers", value: "Source material" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-2xl p-2 transition-colors hover:bg-white/15"
              >
                <dt className="text-xs uppercase tracking-wider text-white/70">{item.label}</dt>
                <dd className="mt-1 text-sm font-semibold">{item.value}</dd>
              </a>
            ))}
          </dl>
        </div>

        <div className="relative lg:col-span-6">
          <div
            className="relative mx-auto max-w-lg lg:max-w-none"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            <div
              className="overflow-hidden rounded-[2rem] border-4 border-white/50 bg-white shadow-2xl shadow-leaf/30 transition-transform duration-200"
              style={{ transform: `perspective(900px) rotateX(${tilt.y * -0.6}deg) rotateY(${tilt.x}deg)` }}
            >
              <img
                key={material}
                src={sample.image}
                alt={`${sample.title} ready for collection`}
                className="h-72 w-full object-cover object-center transition-transform duration-500 hover:scale-105 sm:h-80 lg:h-[26rem]"
              />
            </div>

            <article
              key={material}
              className="animate-pop-in absolute -bottom-6 left-3 right-3 rounded-2xl border border-mist bg-white p-4 text-ink shadow-xl shadow-leaf/20 sm:left-6 sm:right-auto sm:w-80"
            >
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-leaf">
                <Recycle className="h-3.5 w-3.5" aria-hidden="true" />
                Open listing · {material}
              </p>
              <h2 className="mt-1 font-display text-lg text-ink">{sample.title}</h2>
              <p className="mt-1 text-sm text-forest/70">{sample.meta}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-ink/80">
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-moss" aria-hidden="true" />
                  {sample.window}
                </li>
                <li className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 text-moss" aria-hidden="true" />
                  Collector matched nearby
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-moss" aria-hidden="true" />
                  Payment held until delivery
                </li>
              </ul>
              <button
                type="button"
                onClick={claimPickup}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-leaf hover:shadow-md"
              >
                {claimed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Collector notified
                  </>
                ) : (
                  <>
                    Claim this pickup
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </article>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/25 bg-forest/20 backdrop-blur-sm">
        <p className="sr-only">Choose a material to preview a listing</p>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
          <span className="mr-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
            Try a material
          </span>
          {MATERIALS.map((item) => {
            const selected = item === material;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMaterial(item);
                  setClaimed(false);
                }}
                aria-pressed={selected}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  selected
                    ? "border-lime bg-lime text-ink shadow-sm"
                    : "border-white/30 bg-white/15 text-white hover:bg-white hover:text-forest"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
