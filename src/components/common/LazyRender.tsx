import React, { useEffect, useRef, useState } from "react";

type LazyRenderProps = {
  children: React.ReactNode;
  className?: string;
  placeholder?: React.ReactNode;
  minHeight?: number | string;
  rootMargin?: string;
  once?: boolean;
};

export default function LazyRender({
  children,
  className,
  placeholder,
  minHeight = 120,
  rootMargin = "300px 0px",
  once = true,
}: LazyRenderProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible && once) return;

    const anchor = anchorRef.current;
    if (!anchor) return;

    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setVisible(true);
        if (once) observer.disconnect();
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01,
      },
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [once, rootMargin, visible]);

  return (
    <div ref={anchorRef} className={className}>
      {visible ? (
        children
      ) : (
        placeholder ?? (
          <div style={{ minHeight }} aria-hidden="true" className="w-full" />
        )
      )}
    </div>
  );
}
