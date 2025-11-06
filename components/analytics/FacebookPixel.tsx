"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!FB_PIXEL_ID) return;

    // Track page views
    window.fbq?.("track", "PageView");
  }, [pathname, searchParams]);

  if (!FB_PIXEL_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Helper function to track custom events
export const trackFBEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (!FB_PIXEL_ID) return;

  window.fbq?.("track", eventName, eventParams);
};

// E-commerce event helpers
export const trackFBPurchase = (value: number, currency = "USD") => {
  trackFBEvent("Purchase", { value, currency });
};

export const trackFBAddToCart = (
  contentName: string,
  contentId: string,
  value: number,
  currency = "USD"
) => {
  trackFBEvent("AddToCart", {
    content_name: contentName,
    content_ids: [contentId],
    content_type: "product",
    value,
    currency,
  });
};

export const trackFBInitiateCheckout = (value: number, currency = "USD") => {
  trackFBEvent("InitiateCheckout", { value, currency });
};

export const trackFBViewContent = (
  contentName: string,
  contentId: string,
  value: number,
  currency = "USD"
) => {
  trackFBEvent("ViewContent", {
    content_name: contentName,
    content_ids: [contentId],
    content_type: "product",
    value,
    currency,
  });
};

export const trackFBSearch = (searchString: string) => {
  trackFBEvent("Search", { search_string: searchString });
};

export const trackFBCompleteRegistration = (method?: string) => {
  trackFBEvent("CompleteRegistration", { method: method || "email" });
};

export const trackFBLead = () => {
  trackFBEvent("Lead");
};

// Extend Window interface for fbq
declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}
