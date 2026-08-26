/**
 * Primary call-to-action used across the homepage.
 *
 * @param {{
 *   href: string,
 *   children: import("react").ReactNode,
 *   variant?: "lime" | "forest" | "ghost" | "ghost-dark",
 *   className?: string,
 * }} props
 */
export default function Button({ href, children, variant = "lime", className = "", ...props }) {
  const variants = {
    lime: "bg-lime !text-ink shadow-lg shadow-leaf/25 hover:bg-white hover:-translate-y-0.5",
    forest: "bg-forest !text-white shadow-lg shadow-forest/25 hover:bg-leaf hover:-translate-y-0.5",
    ghost:
      "border-2 border-white bg-white/20 !text-white backdrop-blur-sm hover:bg-white hover:!text-forest",
    "ghost-dark":
      "border-2 border-forest/40 bg-white !text-forest hover:border-forest hover:bg-lime",
  };

  return (
    <a
      href={href}
      className={`btn-shine group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
