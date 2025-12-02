import type { ReactNode } from "react";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { MaintenancePage } from "@/components/shared/MaintenancePage";
import { getTheme } from "@/lib/api";
import { StrapiApiError } from "@/lib/strapi";

interface ThemeLayoutServerProps {
  children: ReactNode;
}

/**
 * Server component responsible for fetching theme data from Strapi.
 * Kept separate from RootLayout so that route-level loading UI can show
 * while this data is being fetched.
 */
export async function ThemeLayoutServer({ children }: ThemeLayoutServerProps) {
  let theme = null;
  let showMaintenance = false;

  try {
    theme = await getTheme();
  } catch (error) {
    if (error instanceof StrapiApiError) {
      console.error("❌ [ThemeLayoutServer] Strapi API unavailable after retries:", error);
      showMaintenance = true;
    } else {
      console.error("❌ [ThemeLayoutServer] Error fetching theme:", error);
    }
  }

  if (showMaintenance) {
    return <MaintenancePage />;
  }

  return <ClientLayout theme={theme}>{children}</ClientLayout>;
}


