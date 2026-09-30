import { defineAction, fail } from "@agent-native/core/action";
import { getRequestUserEmail } from "@agent-native/core/server/request-context";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description: "Delete one of the current user's medicine reminders.",
  schema: z.object({ id: z.string().min(1).describe("Reminder id") }),
  http: { method: "DELETE" },
  run: async ({ id }) => {
    const ownerEmail = getRequestUserEmail();
    if (!ownerEmail) fail("Sign in to remove a reminder.", { statusCode: 401 });
    const [reminder] = await getDb()
      .delete(schema.medicineReminders)
      .where(
        and(
          eq(schema.medicineReminders.id, id),
          eq(schema.medicineReminders.ownerEmail, ownerEmail),
        ),
      )
      .returning({ id: schema.medicineReminders.id });
    return reminder ?? null;
  },
});
