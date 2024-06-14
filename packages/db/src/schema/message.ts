import { sql, relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./user";

export const message = sqliteTable(
  "message",
  {
    id: text("id").primaryKey(),
    question: text("question").notNull(),
    content: text("content").notNull(),
    receiverId: text("receiver_id").notNull(),
    senderId: text("sender_id"),
    createdAt: integer("created_at", { mode: "number" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").$onUpdate(() => sql`(unixepoch())`),
  },
  (t) => ({
    receiverIdIdx: index("receiver_id_idx").on(t.receiverId),
    senderIdIdx: index("sender_id_idx").on(t.senderId),
    createdAtIdIdx: index("created_at_id_idx").on(t.createdAt, t.id),
  }),
);

export const messageRelations = relations(message, ({ one }) => ({
  receiver: one(user, {
    fields: [message.receiverId],
    references: [user.id],
    relationName: "receiver",
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
    relationName: "sender",
  }),
}));

export type InsertMessage = typeof message.$inferInsert;
export type SelectMessage = typeof message.$inferSelect;
