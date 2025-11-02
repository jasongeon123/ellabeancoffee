"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SmoothLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function SmoothLink({ href, children, className = "", onClick }: SmoothLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith("#")) return; // Allow anchor links to work normally

    e.preventDefault();
    setIsNavigating(true);

    if (onClick) onClick();

    setTimeout(() => {
      router.push(href);
    }, 150);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`${className} ${isNavigating ? "opacity-70" : ""}`}
    >
      {children}
    </Link>
  );
}
