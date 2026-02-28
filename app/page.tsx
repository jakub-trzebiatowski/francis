import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold">Hello, Francis</h1>
      <ThemeSwitcher />
    </main>
  );
}
