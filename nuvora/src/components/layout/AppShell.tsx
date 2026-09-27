import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TopBar } from "./TopBar";

export function AppShell() {
  // Every authenticated page renders inside this shell — set noindex once
  // here rather than per-page, since none of it should be publicly indexed.
  useEffect(() => {
    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "robots");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", "noindex, nofollow");
    return () => {
      tag?.setAttribute("content", "index, follow");
    };
  }, []);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-nuvora-dark">
      <Sidebar />
      {/* h-full (not min-h-screen): this column is a fixed viewport-height
          frame — TopBar and MobileNav stay pinned, and only <main> scrolls,
          so a page like the AI Tutor can reliably fill exactly the space
          between them instead of guessing chrome heights with vh math. */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-5 pb-20 pt-6 sm:px-8 sm:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
