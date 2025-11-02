"use client";

export default function ScrollDownButton() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToContent}
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10 cursor-pointer hover:scale-110 transition-transform p-2"
      aria-label="Scroll down"
    >
      <svg className="w-6 h-6 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  );
}
