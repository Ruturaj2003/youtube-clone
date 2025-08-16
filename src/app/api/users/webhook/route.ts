import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Missing CLERK_WEBHOOK_SIGNING_SECRET in environment variables"
    );
  }
  // Verify the webhook signature
  const wh = new Webhook(SIGNING_SECRET);

  // Get the headers Clerk sends
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  // Get the request body as string
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;
  console.log(`Received webhook: ${eventType}`, evt.data);

  // Example: react to a user creation event
  if (eventType === "user.created") {
    const data = evt.data;
    console.log("New user:", evt.data);
    // Your logic here
    await db.insert(users).values({
      clerkId: data.id,
      name: `${data.first_name} ${data.last_name}`,
      imageUrl: data.image_url,
    });
  }

  if (eventType === "user.deleted") {
    const data = evt.data;
    if (!data.id) {
      return new Response("No User Id Provided", { status: 401 });
    }
    await db.delete(users).where(eq(users.clerkId, data.id));
  }

  if (eventType === "user.updated") {
    const data = evt.data;
    await db
      .update(users)
      .set({
        name: `${data.first_name} ${data.last_name}`,
        imageUrl: data.image_url,
      })
      .where(eq(users.clerkId, data.id));
  }

  return new Response("Webhook received", { status: 200 });
}
