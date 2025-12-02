import Image from "next/image";

interface PageLoaderProps {
  message?: string;
}

/**
 * Full-page loader with Greenwood logo
 * Shown while server components/Strapi data are loading.
 */
export function PageLoader({ message = "Loading latest updates..." }: PageLoaderProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white text-emerald-900"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="relative mb-6 h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
        <div className="absolute inset-0 animate-ping rounded-full border-4 border-emerald-400/40" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-lg">
          <Image
            src="/logo.png"
            alt="Greenwood City logo"
            width={64}
            height={64}
            className="h-14 w-14 rounded-full object-contain"
            priority
          />
        </div>
      </div>

      <p className="mb-1 text-sm font-semibold tracking-wide text-emerald-800">
        Greenwood City Block C
      </p>
      <p className="text-xs text-emerald-500">{message}</p>
    </div>
  );
}


