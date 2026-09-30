import { defineAction, fail } from "@agent-native/core/action";
import { getRequestUserEmail } from "@agent-native/core/server/request-context";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Create a private medicine dose or refill reminder.",
  schema: z.object({
    medicationName: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .describe("Medication name"),
    kind: z
      .enum(["dose", "refill"])
      .describe('Reminder kind: "dose" or "refill"'),
    date: z.iso.date().describe("Reminder date (YYYY-MM-DD)"),
    time: z.iso.time({ precision: -1 }).describe("Reminder time (HH:MM)"),
  }),
  run: async ({ medicationName, kind, date, time }) => {
    const ownerEmail = getRequestUserEmail();
    if (!ownerEmail) fail("Sign in to save a reminder.", { statusCode: 401 });
    const [reminder] = await getDb()
      .insert(schema.medicineReminders)
      .values({
        id: crypto.randomUUID(),
        ownerEmail,
        medicationName,
        kind,
        date,
        time,
      })
      .returning({
        id: schema.medicineReminders.id,
        medicationName: schema.medicineReminders.medicationName,
        kind: schema.medicineReminders.kind,
        date: schema.medicineReminders.date,
        time: schema.medicineReminders.time,
      });
    return reminder;
  },
});
