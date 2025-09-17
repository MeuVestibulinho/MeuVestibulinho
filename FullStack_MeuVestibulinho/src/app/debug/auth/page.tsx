// src/app/debug/auth/page.tsx
import type { Session } from "next-auth";
import { auth, swallowSessionTokenError } from "~/server/auth";

export default async function AuthDebug() {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (error) {
    if (!swallowSessionTokenError(error)) {
      throw error;
    }
  }

  return (
    <pre className="p-4">{JSON.stringify(session, null, 2)}</pre>
  );
}
