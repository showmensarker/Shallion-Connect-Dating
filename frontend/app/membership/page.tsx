import { AppShell } from "@/components/AppShell";

export default function Membership() {
  return (
    <AppShell
      title="Membership"
      subtitle="PayPal membership payments support the Shallion community without removing essential access."
    >
      <section className="clean-page-panel">
        <div className="section-title-center membership-intro-clean">
          <span className="eyebrow">No hidden paywall</span>
          <h2>Support the platform without restricting connection.</h2>
          <p className="lead">
            Membership helps Shallion Connections remain sustainable while keeping essential friendship, relationship and safety features clear and fair.
          </p>
        </div>

        <div className="grid-2 membership-cards">
          <article className="price-card">
            <span className="eyebrow">Founding Member</span>
            <h2>£10 / year</h2>
            <p>First 100 users. Includes membership confirmation and transaction history.</p>
            <button className="btn btn-primary">Continue with PayPal</button>
          </article>

          <article className="price-card">
            <span className="eyebrow">Standard Member</span>
            <h2>£35 / year</h2>
            <p>Annual membership for ongoing sustainability and platform support.</p>
            <button className="btn btn-secondary">Choose standard</button>
          </article>
        </div>

        <article className="card payment-flow-card">
          <h2>Payment flow</h2>
          <p>Create payment transaction → Confirm PayPal payment → Subscribe membership → View membership status.</p>
        </article>
      </section>
    </AppShell>
  );
}
