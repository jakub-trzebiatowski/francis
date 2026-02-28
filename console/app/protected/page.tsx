import { redirect } from "next/navigation";
import { getSession } from "@/lib/firebase/session";

export default async function ProtectedPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Select a project</h2>
        <p className="text-muted-foreground">
          Choose a project from the sidebar, or create a new one to get started.
        </p>
      </div>
    </div>
  );
}
