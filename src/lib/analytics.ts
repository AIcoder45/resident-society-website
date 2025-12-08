/**
 * Google Analytics 4 event tracking helpers
 * Used to understand which pages and actions users take.
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type AnalyticsEventName =
  | "contact_form_submit"
  | "contact_form_submit_error"
  | "share_open"
  | "share_action"
  | "push_subscribe"
  | "push_unsubscribe"
  | "pwa_install_prompt_shown"
  | "pwa_install_accepted"
  | "pwa_install_dismissed";

interface AnalyticsEventParams {
  page_path?: string;
  section?: string;
  method?: string;
  platform?: string;
  error_message?: string;
  [key: string]: unknown;
}

function canTrack(): boolean {
  if (!GA_MEASUREMENT_ID) {
    return false;
  }
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return false;
  }
  return true;
}

export function trackEvent(
  eventName: AnalyticsEventName,
  params: AnalyticsEventParams = {}
): void {
  if (!canTrack()) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[Analytics] Skipping event (GA not ready):", {
        eventName,
        params,
      });
    }
    return;
  }

  const payload: AnalyticsEventParams = {
    ...params,
    page_path: params.page_path || window.location.pathname,
  };

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[Analytics] Event:", eventName, payload);
  }

  window.gtag?.("event", eventName, payload);
}


