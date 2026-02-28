import Link from "next/link";
import { Button } from "./ui/button";
import { getSession } from "@/lib/firebase/session";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const session = await getSession();

  return session ? (
    <div className="flex items-center gap-4">
      Hey, {session.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
