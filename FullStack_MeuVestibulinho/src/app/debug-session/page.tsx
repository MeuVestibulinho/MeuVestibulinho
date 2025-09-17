// app/debug-session/page.tsx
import type { Session } from "next-auth";
import { auth, swallowSessionTokenError } from "~/server/auth";

export default async function Page() {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (error) {
    if (!swallowSessionTokenError(error)) {
      throw error;
    }
  }

  return <pre>{JSON.stringify(session, null, 2)}</pre>;
}
