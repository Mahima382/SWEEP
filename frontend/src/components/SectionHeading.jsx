/**
 * Consistent section heading block.
 *
 * @param {{
 *   eyebrow: string,
 *   title: string,
 *   description?: string,
 *   light?: boolean,
 *   id?: string,
 * }} props
 */
export default function SectionHeading({ eyebrow, title, description, light = false, id }) {
  return (
    <div className="max-w-2xl">
      <p
        className={`text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${light ? "text-lime" : "text-leaf"}`}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-3 font-display text-[1.85rem] leading-[1.15] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] ${light ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-xl text-base leading-[1.7] sm:text-[1.0625rem] ${light ? "text-white/85" : "text-ink/65"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
