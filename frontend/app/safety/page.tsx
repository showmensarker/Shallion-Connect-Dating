import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const safetyFeatures = [
  ["Verified accounts", "Email and phone verification help reduce fake profiles and support safer first contact."],
  ["Report concerns", "Users can report profiles or messages with clear categories and optional context for moderators."],
  ["Block instantly", "Blocking is always available from profiles and conversations, supporting boundaries without confrontation."],
  ["Community guidelines", "Plain-language rules explain respectful behaviour, privacy, consent and inclusive communication."],
];

export default function SafetyPage() {
  return (
    <AppShell
      title="Safety"
      subtitle="A calmer, safer space where boundaries, dignity and privacy are protected."
    >
      <section className="clean-page-panel">
        <div className="grid-2 align-start">
          <article className="card hero-panel-card">
            <span className="eyebrow">Safe and inclusive space</span>
            <h2>Your safety matters.</h2>
            <p>
              Shallion Connections is designed for people who may need extra care, clarity and control when meeting new people online.
              Safety tools are visible, simple and available throughout the experience.
            </p>
            <div className="hero-actions">
              <Link href="/community-guidelines" className="btn btn-primary">Read guidelines</Link>
              <Link href="/settings" className="btn btn-secondary">Privacy settings</Link>
            </div>
          </article>

          <div className="safety-feature-list">
            {safetyFeatures.map(([title, text]) => (
              <article className="principle-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
