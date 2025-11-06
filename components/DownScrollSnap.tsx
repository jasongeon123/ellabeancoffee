"use client";

import { useEffect, useRef } from "react";

export default function DownScrollSnap() {
  const lastScrollTop = useRef(0);
  const isSnapping = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (isSnapping.current) return;

      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollingDown = currentScrollTop > lastScrollTop.current;

      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Only snap when scrolling down
      if (scrollingDown) {
        scrollTimeout.current = setTimeout(() => {
          const sections = document.querySelectorAll("main > section, main > div > section");
          const navbarHeight = 80; // Adjust based on your navbar height

          let targetSection: Element | null = null;
          let minDistance = Infinity;

          sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.pageYOffset - navbarHeight;
            const distance = sectionTop - currentScrollTop;

            // Find the closest section that is below current position
            if (distance > 0 && distance < minDistance) {
              minDistance = distance;
              targetSection = section;
            }
          });

          // Snap to the target section if it's close enough
          if (targetSection && minDistance < window.innerHeight * 0.5) {
            isSnapping.current = true;
            const rect = (targetSection as Element).getBoundingClientRect();
            const targetPosition = rect.top + window.pageYOffset - navbarHeight;

            window.scrollTo({
              top: targetPosition,
              behavior: "smooth",
            });

            // Reset snapping flag after animation
            setTimeout(() => {
              isSnapping.current = false;
            }, 800);
          }
        }, 150); // Delay before snapping
      }

      lastScrollTop.current = currentScrollTop <= 0 ? 0 : currentScrollTop;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return null;
}
