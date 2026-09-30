import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconPill,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, useState, type FormEvent } from "react";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options).format(
    new Date(`${date}T00:00:00`),
  );
}

function todayKey() {
  return dateKey(new Date());
}

export default function MedicinesPage() {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [medicationName, setMedicationName] = useState("");
  const [kind, setKind] = useState<"dose" | "refill">("dose");
  const [reminderDate, setReminderDate] = useState(todayKey);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [status, setStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const createDisclosure = useRef<HTMLDetailsElement>(null);

  const monthStart = dateKey(month);
  const monthEnd = dateKey(
    new Date(month.getFullYear(), month.getMonth() + 1, 0),
  );
  const remindersQuery = useActionQuery("list-medicine-reminders", {
    startDate: monthStart,
    endDate: monthEnd,
  });
  const createReminder = useActionMutation("create-medicine-reminder");
  const deleteReminder = useActionMutation("delete-medicine-reminder");
  const reminders = remindersQuery.data ?? [];
  const remindersOnSelectedDate = reminders.filter(
    (reminder) => reminder.date === selectedDate,
  );

  const firstWeekday = month.getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const calendarCellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(month);

  function changeMonth(offset: number) {
    const nextMonth = new Date(
      month.getFullYear(),
      month.getMonth() + offset,
      1,
    );
    setMonth(nextMonth);
    const nextDate = dateKey(nextMonth);
    setSelectedDate(nextDate);
    setReminderDate(nextDate);
    setStatus("");
  }

  async function submitReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setFormError("");
    try {
      await createReminder.mutateAsync({
        medicationName,
        kind,
        date: reminderDate,
        time: reminderTime,
      });
      setSelectedDate(reminderDate);
      setMonth(
        new Date(
          Number(reminderDate.slice(0, 4)),
          Number(reminderDate.slice(5, 7)) - 1,
          1,
        ),
      );
      setMedicationName("");
      setKind("dose");
      setReminderTime("09:00");
      setStatus("Reminder saved.");
      createDisclosure.current?.removeAttribute("open");
    } catch {
      setFormError("We couldn’t save this reminder. Please try again.");
    }
  }

  async function removeReminder(id: string) {
    setStatus("");
    setPageError("");
    try {
      await deleteReminder.mutateAsync({ id });
      setStatus("Reminder removed.");
    } catch {
      setPageError("We couldn’t remove this reminder. Please try again.");
    }
  }

  return (
    <section className="medicine-page" aria-labelledby="medicine-title">
      <div className="medicine-heading-row">
        <div className="medicine-heading">
          <p className="wellness-kicker">YOUR MEDICINES</p>
          <h1 id="medicine-title">Medicine calendar</h1>
        </div>
        <details className="reminder-disclosure" ref={createDisclosure}>
          <summary className="reminder-add-button">
            <IconPlus aria-hidden="true" size={25} />
            <span>Add reminder</span>
          </summary>
          <form
            aria-labelledby="create-reminder-title"
            className="reminder-form"
            onSubmit={submitReminder}
          >
            <h2 id="create-reminder-title">Create a reminder</h2>
            <label className="medicine-field">
              <span>Medicine name</span>
              <input
                autoComplete="off"
                maxLength={120}
                onChange={(event) => setMedicationName(event.target.value)}
                required
                value={medicationName}
              />
            </label>
            <fieldset className="reminder-kind-field">
              <legend>Remind me to</legend>
              <label className="reminder-choice">
                <input
                  checked={kind === "dose"}
                  name="reminder-kind"
                  onChange={() => setKind("dose")}
                  type="radio"
                />
                <IconPill aria-hidden="true" size={24} />
                Take a dose
              </label>
              <label className="reminder-choice">
                <input
                  checked={kind === "refill"}
                  name="reminder-kind"
                  onChange={() => setKind("refill")}
                  type="radio"
                />
                <IconRefresh aria-hidden="true" size={24} />
                Refill medicine
              </label>
            </fieldset>
            <div className="medicine-field-grid">
              <label className="medicine-field">
                <span>Date</span>
                <input
                  min={todayKey()}
                  onChange={(event) => setReminderDate(event.target.value)}
                  required
                  type="date"
                  value={reminderDate}
                />
              </label>
              <label className="medicine-field">
                <span>Time</span>
                <input
                  onChange={(event) => setReminderTime(event.target.value)}
                  required
                  type="time"
                  value={reminderTime}
                />
              </label>
            </div>
            <p className="privacy-note">
              Your reminders are private to your account.
            </p>
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <button
              className="reminder-save-button"
              disabled={createReminder.isPending}
              type="submit"
            >
              {createReminder.isPending ? "Saving reminder…" : "Save reminder"}
            </button>
          </form>
        </details>
      </div>

      {status && (
        <p className="reminder-status" role="status">
          {status}
        </p>
      )}
      <section className="medicine-calendar" aria-labelledby="calendar-title">
        <div className="calendar-heading">
          <h2 id="calendar-title">{monthLabel}</h2>
          <div className="calendar-controls" aria-label="Change month">
            <button
              aria-label="Previous month"
              className="calendar-arrow"
              onClick={() => changeMonth(-1)}
              type="button"
            >
              <IconChevronLeft aria-hidden="true" size={24} />
              <span>Previous</span>
            </button>
            <button
              aria-label="Next month"
              className="calendar-arrow"
              onClick={() => changeMonth(1)}
              type="button"
            >
              <IconChevronRight aria-hidden="true" size={24} />
              <span>Next</span>
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div
          aria-label={`${monthLabel} calendar`}
          className="calendar-grid"
          role="group"
        >
          {Array.from({ length: calendarCellCount }, (_, index) => {
            const dayNumber = index - firstWeekday + 1;
            if (dayNumber < 1 || dayNumber > daysInMonth) {
              return (
                <span
                  aria-hidden="true"
                  className="calendar-empty"
                  key={`empty-${index}`}
                />
              );
            }
            const date = dateKey(
              new Date(month.getFullYear(), month.getMonth(), dayNumber),
            );
            const dayReminders = reminders.filter(
              (reminder) => reminder.date === date,
            );
            const chosen = date === selectedDate;
            const isToday = date === todayKey();
            return (
              <button
                aria-label={`${displayDate(date, { weekday: "long", month: "long", day: "numeric" })}${dayReminders.length ? `, ${dayReminders.length} reminders` : ""}${chosen ? ", selected" : ""}`}
                aria-pressed={chosen}
                className={`calendar-day${chosen ? " calendar-day-selected" : ""}${isToday ? " calendar-day-today" : ""}`}
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setReminderDate(date);
                  setStatus("");
                  setPageError("");
                }}
                type="button"
              >
                <span className="calendar-day-weekday">
                  {displayDate(date, { weekday: "short" })}
                </span>
                <span className="calendar-day-label">{dayNumber}</span>
                {dayReminders.length > 0 && (
                  <span className="calendar-reminder-count">
                    {dayReminders.length}{" "}
                    {dayReminders.length === 1 ? "reminder" : "reminders"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="day-reminders-title" className="day-reminders">
        <div className="day-reminders-heading">
          <h2 id="day-reminders-title">
            {displayDate(selectedDate, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <IconCalendarEvent aria-hidden="true" size={27} />
        </div>
        {pageError && (
          <p className="form-error" role="alert">
            {pageError}
          </p>
        )}
        {remindersQuery.isPending ? (
          <p aria-live="polite">Loading reminders…</p>
        ) : remindersQuery.isError ? (
          <div className="reminder-empty-state" role="alert">
            <p>We couldn’t load your reminders.</p>
            <button
              className="text-action"
              onClick={() => void remindersQuery.refetch()}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : remindersOnSelectedDate.length === 0 ? (
          <p className="reminder-empty-state">No reminders for this day.</p>
        ) : (
          <ul className="reminder-list">
            {remindersOnSelectedDate.map((reminder) => (
              <li className="reminder-item" key={reminder.id}>
                <span className="reminder-item-icon" aria-hidden="true">
                  {reminder.kind === "refill" ? (
                    <IconRefresh size={26} />
                  ) : (
                    <IconPill size={26} />
                  )}
                </span>
                <div className="reminder-item-copy">
                  <p>{reminder.kind === "refill" ? "Refill" : "Take a dose"}</p>
                  <h3>{reminder.medicationName}</h3>
                </div>
                <time
                  className="reminder-time"
                  dateTime={`${reminder.date}T${reminder.time}`}
                >
                  {new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(`2000-01-01T${reminder.time}`))}
                </time>
                <button
                  aria-label={`Remove ${reminder.kind === "refill" ? "refill" : "dose"} reminder for ${reminder.medicationName}`}
                  className="reminder-remove"
                  onClick={() => void removeReminder(reminder.id)}
                  type="button"
                >
                  <IconTrash aria-hidden="true" size={22} />
                  <span>Remove</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p aria-live="polite" className="sr-only">
        {formError}
      </p>
      <p className="reminder-delivery-note">
        Saved reminders appear here. Push notifications are not connected yet.
      </p>
    </section>
  );
}
