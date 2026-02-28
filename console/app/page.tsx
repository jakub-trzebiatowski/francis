import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/protected");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Francis</h1>
        <p className="text-muted-foreground text-lg">Project & Session Management</p>
      </div>

      <div className="flex gap-4">
        <Link href="/auth/login">
          <Button>Sign In</Button>
        </Link>
        <Link href="/auth/sign-up">
          <Button variant="outline">Sign Up</Button>
        </Link>
      </div>

      <div className="absolute bottom-8 right-8">
        <ThemeSwitcher />
      </div>
    </main>
  );
}
