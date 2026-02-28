import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardServer } from "@/components/dashboard/DashboardServer";

async function getUserInfo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function ProtectedPage() {
  const user = await getUserInfo();
  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardServer />;
}


