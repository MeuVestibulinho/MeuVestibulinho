// src/app/debug/auth/page.tsx
import { auth } from "~/server/auth";

export default async function AuthDebug() {
  const session = await auth();
  return (
    <pre className="p-4">{JSON.stringify(session, null, 2)}</pre>
  );
}
