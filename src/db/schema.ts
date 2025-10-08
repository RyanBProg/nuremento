import { sql } from "drizzle-orm";
import {
  date,
  foreignKey,
  index,
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
    imageKey: text("image_key"),
    imageThumbnailKey: text("image_thumbnail_key"),
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

export const timeCapsules = pgTable(
  "time_capsules",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    clerkId: text("clerk_id").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    openOn: date("open_on").notNull(),
    openedAt: date("opened_at"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("time_capsules_clerk_idx").on(table.clerkId),
    index("time_capsules_open_on_idx").on(table.openOn),
    foreignKey({
      columns: [table.clerkId],
      foreignColumns: [users.clerkId],
      name: "time_capsules_users_clerk_fk",
    }),
  ]
);
