import { sql } from "drizzle-orm";
import {
  date,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  username: text("username"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type MemoryAsset = {
  key: string;
  thumbnailKey?: string;
  url?: string;
  caption?: string;
  alt?: string;
};

export const memories = pgTable(
  "memories",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    clerkId: text("clerk_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    occurredOn: date("occurred_on"),
    location: text("location"),
    mood: text("mood"),
    coverImageKey: text("cover_image_key"),
    coverImageUrl: text("cover_image_url"),
    media: jsonb("media")
      .$type<MemoryAsset[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("memories_clerk_idx").on(table.clerkId),
    foreignKey({
      columns: [table.clerkId],
      foreignColumns: [users.clerkId],
      name: "memories_users_clerk_fk",
    }),
  ]
);
