import { useEffect } from "react";

const SITE_NAME = "NUVORA";
const DEFAULT_DESCRIPTION =
  "NUVORA combines structured learning, personalized paths, practical projects, and an AI tutor that helps you understand what you're learning — not just consume it.";

function setMetaTag(name: string, content: string, attr: "name" | "property" = "name") {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Sets the page <title> and description/OG meta tags for the current
 * route. Public pages (landing, skill/path/course pages, public profiles)
 * should call this with real content so they're indexable and shareable;
 * authenticated app pages behind RequireAuth are already excluded from
 * indexing since there's nothing for a crawler to see without a session.
 */
export function usePageMeta(title: string, description: string = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
    document.title = fullTitle;
    setMetaTag("description", description);
    setMetaTag("og:title", fullTitle, "property");
    setMetaTag("og:description", description, "property");
  }, [title, description]);
}
