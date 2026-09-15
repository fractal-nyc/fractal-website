import { useEffect } from "react";

/**
 * Sets the document title (and optional robots meta) for a route, then
 * restores the previous title when the page unmounts.
 */
export function useDocumentMeta({
  title,
  robots,
}: {
  title: string;
  robots?: string;
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    let meta: HTMLMetaElement | undefined;
    let created = false;
    if (robots) {
      const existing = document.querySelector<HTMLMetaElement>(
        'meta[name="robots"]',
      );
      if (existing) {
        meta = existing;
        meta.content = robots;
      } else {
        meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = robots;
        document.head.appendChild(meta);
        created = true;
      }
    }

    return () => {
      document.title = previousTitle;
      if (created && meta) {
        meta.remove();
      }
    };
  }, [title, robots]);
}
