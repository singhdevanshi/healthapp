import { IconArrowLeft } from "@tabler/icons-react";
import { Link, useParams } from "react-router";

import MedicinesPage from "@/components/medicines";

const sectionNames: Record<string, string> = {
  medicines: "Medicines",
  refill: "Medicine refill",
  appointments: "Appointments",
  plan: "My Plan",
};

export function meta({ params }: { params: { section?: string } }) {
  const title = sectionNames[params.section ?? ""] ?? "Everwell";
  return [{ title: `${title} · Everwell` }];
}

export default function SectionPlaceholder() {
  const { section = "" } = useParams();
  if (section === "medicines") return <MedicinesPage />;

  const title = sectionNames[section] ?? "This page";

  return (
    <section className="placeholder-page" aria-labelledby="placeholder-title">
      <Link className="back-link" to="/">
        <IconArrowLeft aria-hidden="true" size={24} />
        <span>Back home</span>
      </Link>
      <div className="placeholder-content">
        <p className="wellness-kicker">EVERWELL</p>
        <h1 id="placeholder-title">{title}</h1>
        <p>This page is ready for its next step.</p>
        <p>
          Ask to build the {title.toLowerCase()} experience when you’re ready.
        </p>
      </div>
    </section>
  );
}
