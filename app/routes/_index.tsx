import { IconCalendarEvent, IconPill, IconRefresh } from "@tabler/icons-react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Home · Everwell" },
    {
      name: "description",
      content: "Your daily health and wellness companion.",
    },
  ];
}

export default function HomeRoute() {
  return (
    <section className="wellness-home" aria-labelledby="home-title">
      <header className="welcome-heading">
        <p className="wellness-kicker">YOUR DAY, MADE SIMPLE</p>
        <h1 id="home-title">Welcome to Everwell</h1>
      </header>

      <section className="next-up-card" aria-labelledby="next-up-title">
        <div className="next-up-mark" aria-hidden="true">
          <IconCalendarEvent size={30} stroke={2} />
        </div>
        <div>
          <h2 id="next-up-title">Next up</h2>
          <p>Your next medicine or visit will appear here.</p>
        </div>
      </section>

      <section className="quick-actions" aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title">What would you like to do?</h2>
        <div className="action-grid">
          <Link className="action-link action-primary" to="/medicines">
            <IconPill size={32} stroke={2} aria-hidden="true" />
            <span>Take medicine</span>
          </Link>
          <Link className="action-link" to="/refill">
            <IconRefresh size={32} stroke={2} aria-hidden="true" />
            <span>Refill medicine</span>
          </Link>
          <Link className="action-link" to="/appointments">
            <IconCalendarEvent size={32} stroke={2} aria-hidden="true" />
            <span>Book a visit</span>
          </Link>
        </div>
      </section>
    </section>
  );
}
