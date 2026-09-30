import { index, now, table, text } from "@agent-native/core/db/schema";

export const medicineReminders = table(
  "medicine_reminders",
  {
    id: text("id").primaryKey(),
    ownerEmail: text("owner_email").notNull(),
    medicationName: text("medication_name").notNull(),
    kind: text("kind").notNull(),
    date: text("date").notNull(),
    time: text("time").notNull(),
    createdAt: text("created_at").notNull().default(now()),
  },
  (reminder) => [
    index("medicine_reminders_owner_date_idx").on(
      reminder.ownerEmail,
      reminder.date,
      reminder.time,
    ),
  ],
);
