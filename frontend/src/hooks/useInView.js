import { useEffect, useRef, useState } from "react";

/**
 * Reveals a node once when it enters the viewport.
 * @param {{ threshold?: number, rootMargin?: string }} [options]
 * @returns {[React.RefObject<HTMLElement>, boolean]}
 */
export default function useInView({ threshold = 0.18, rootMargin } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}
