import type { User } from "@clerk/backend";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { users } from "./schema";

function resolvePrimaryEmail(clerkUser: User) {
  if (!clerkUser.emailAddresses?.length) {
    return null;
  }

  const primary = clerkUser.emailAddresses.find(
    (address) => address.id === clerkUser.primaryEmailAddressId,
  );

  return (
    primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null
  );
}

export async function ensureUserForClerkAccount(clerkUser: User) {
  const email = resolvePrimaryEmail(clerkUser);

  const payload = {
    clerkId: clerkUser.id,
    email,
    firstName: clerkUser.firstName ?? null,
    lastName: clerkUser.lastName ?? null,
    username: clerkUser.username ?? null,
    imageUrl: clerkUser.imageUrl ?? null,
  };

  await db
    .insert(users)
    .values(payload)
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        imageUrl: payload.imageUrl,
        updatedAt: new Date(),
      },
    });

  const [record] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  return record;
}
