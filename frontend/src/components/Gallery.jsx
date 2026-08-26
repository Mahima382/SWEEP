import { GALLERY } from "../data/homepage.js";
import useInView from "../hooks/useInView.js";
import SectionHeading from "./SectionHeading.jsx";

/**
 * Photo gallery of real waste-collection and recycling scenes.
 */
export default function Gallery() {
  const [ref, visible] = useInView();

  return (
    <section id="gallery" className="bg-cream px-4 py-20 sm:px-6 lg:px-8 lg:py-28" aria-labelledby="gallery-heading">
      <div ref={ref} className={`mx-auto max-w-6xl reveal ${visible ? "is-visible" : ""}`}>
        <SectionHeading
          id="gallery-heading"
          eyebrow="On the ground"
          title="From sorted bins to facility intake."
          description="Real collection and recycling scenes — the loop SWEEP is built to organize, trade, and record."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((item, index) => (
            <li
              key={item.src}
              className={`group overflow-hidden rounded-[1.75rem] ${index === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
            >
              <figure className="relative h-56 overflow-hidden sm:h-64 lg:h-72">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-5 py-4 text-sm font-semibold text-white">
                  {item.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
