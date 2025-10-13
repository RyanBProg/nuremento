import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const payload = await req.json();
  const eventType = payload?.type;
  const data = payload?.data ?? {};
  console.log("webhook data: ", data);

  const clerkId = typeof data?.id === "string" ? data.id : null;

  const primaryEmail =
    Array.isArray(data?.email_addresses) && data.email_addresses.length > 0
      ? data.email_addresses.find(
          (item: { email_address?: string | null; id?: string | null }) =>
            Boolean(item?.email_address)
        )?.email_address ?? null
      : null;

  switch (eventType) {
    case "user.created": {
      if (!clerkId) {
        console.error("Clerk webhook user.created missing user id");
        break;
      }

      try {
        await db.insert(users).values({
          clerkId,
          email: primaryEmail,
          firstName: data.first_name ?? null,
          lastName: data.last_name ?? null,
        });
      } catch (error) {
        console.error("Error inserting user from Clerk webhook", error);
      }
      break;
    }

    case "user.updated": {
      if (!clerkId) {
        console.error("Clerk webhook user.updated missing user id");
        break;
      }

      try {
        await db
          .update(users)
          .set({
            email: primaryEmail,
            firstName: data.first_name ?? null,
            lastName: data.last_name ?? null,
          })
          .where(eq(users.clerkId, clerkId));
      } catch (error) {
        console.error("Error updating user from Clerk webhook", error);
      }
      break;
    }

    case "user.deleted": {
      if (!clerkId) {
        console.error("Clerk webhook user.deleted missing user id");
        break;
      }

      try {
        // [Todo] find and delete all s3 images for this account
        await db.delete(users).where(eq(users.clerkId, clerkId));
      } catch (error) {
        console.error("Error deleting user from Clerk webhook", error);
      }
      break;
    }

    default:
      break;
  }

  return new Response("ok", { status: 200 });
}
