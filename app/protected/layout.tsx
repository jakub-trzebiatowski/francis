import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ProjectListServer } from "@/components/projects/ProjectListServer";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navbar */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-card">
        <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
          <Link href={"/"} className="font-semibold">
            Francis
          </Link>
          <div className="flex gap-4 items-center">
            <ThemeSwitcher />
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>

      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-r-foreground/10 bg-card overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">Projects</h2>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              <ProjectListServer />
            </Suspense>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
