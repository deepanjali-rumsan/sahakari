import { Menu } from "lucide-react";

import { useSidebar } from "./sidebar-context";

interface AppHeaderProps {
  title?: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
}

export function AppHeader({ title, children, right }: AppHeaderProps) {
  const { openSidebar } = useSidebar();

  return (
    <header className="border-outline-variant/20 bg-surface/95 sticky top-0 z-40 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl">
      {/* Hamburger Menu - Mobile Only */}
      <button
        onClick={openSidebar}
        className="text-on-surface hover:bg-surface-container-low flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors active:scale-95 md:hidden"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Left/Center Content */}
      {title ? (
        <h1 className="font-headline text-on-surface flex-1 text-xl font-bold">
          {title}
        </h1>
      ) : (
        <div className="flex flex-1 items-center gap-3">{children}</div>
      )}

      {/* Right Content */}
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}
