import { defineAction, fail } from "@agent-native/core/action";
import { getRequestUserEmail } from "@agent-native/core/server/request-context";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description:
    "List private medicine dose and refill reminders within a date range.",
  schema: z.object({
    startDate: z.iso
      .date()
      .describe("First reminder date to include (YYYY-MM-DD)"),
    endDate: z.iso
      .date()
      .describe("Last reminder date to include (YYYY-MM-DD)"),
  }),
  http: { method: "GET" },
  run: async ({ startDate, endDate }) => {
    const ownerEmail = getRequestUserEmail();
    if (!ownerEmail)
      fail("Sign in to view your reminders.", { statusCode: 401 });
    const db = getDb();
    return db
      .select({
        id: schema.medicineReminders.id,
        medicationName: schema.medicineReminders.medicationName,
        kind: schema.medicineReminders.kind,
        date: schema.medicineReminders.date,
        time: schema.medicineReminders.time,
      })
      .from(schema.medicineReminders)
      .where(
        and(
          eq(schema.medicineReminders.ownerEmail, ownerEmail),
          gte(schema.medicineReminders.date, startDate),
          lte(schema.medicineReminders.date, endDate),
        ),
      )
      .orderBy(
        asc(schema.medicineReminders.date),
        asc(schema.medicineReminders.time),
      );
  },
});
