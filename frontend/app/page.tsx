import Image from "next/image";
import Link from "next/link";
import { UKMap } from "@/components/UKMap";

const steps = [
  ["Create your profile", "Share a little about yourself and choose what you feel comfortable sharing."],
  ["Find people who understand", "Explore profiles based on interests, preferences and communication style."],
  ["Take your time", "Send messages safely and interact when you feel comfortable."],
];

export default function Home() {
  return (
    <>
      
      <main id="main">
      <section className="mountain-hero" aria-labelledby="hero-title">
  <Image
    src="/assets/membership-bg.jpg"
    alt=""
    fill
    priority
    sizes="100vw"
    className="hero-image"
  />

  <div className="hero-overlay" aria-hidden="true" />

  <div className="container mountain-content">
    <Image
      src="/assets/logo.avif"
      alt="Shallion logo"
      width={420}
      height={170}
      priority
      className="hero-logo"
    />

    <h1 id="hero-title" className="hero-title">
      SHALLION
    </h1>

    <p className="lead hero-lead">
      A safe and welcoming place for friendships and relationships
    </p>
  </div>
</section>

              
        <section className="section " id="pathways" aria-labelledby="pathways-title">
          <div className="container">
            <div className="section-head">
              <div>
                
                <h2 id="pathways-title">Friendship and relationships are treated equally</h2>
              </div>
              <p className="lead">Users can choose exactly what they are looking for, and those boundaries should be respected in search, matching and messaging</p>
            </div>
            <div className="grid-2">
              <article className="card pathway">
                <div className="card-icon" aria-hidden="true">🤝</div>
                <h3>Friendship pathway</h3>
                <p className="lead">Find online friendships, local friendships, male friends, female friends or mixed friendship groups without relationship pressur.</p>
                
              </article>
              <article className="card pathway">
                <div className="card-icon" aria-hidden="true">💚</div>
                <h3>Relationship pathway</h3>
                <p className="lead">Search for companionship, dating, long-term relationships or marriage-focused relationships in a slower, safer environment</p>
                
              </article>
            </div>
          </div>
        </section>

        
  <section className="section" id="how-it-works">
  <div className="container">
    <div className="section-head">
      <div>
      
        <h2> How to get started on Shallion Connections?</h2>
      </div>
    </div>

    <div className="steps-grid">
      {steps.map(([title,text], index) => (
        <article 
          className="step-card animate-step" 
          key={title}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <div className="step-number">{index + 1}</div>
          <h3>{title}</h3>
          <p className="lead">{text}</p>
        </article>
      ))}
    </div>

  </div>
</section>
<section className="section" id="membership">
  <div className="container">
    <div className="section-head">
      <div>
        <h2>Membership Structure</h2>
      </div>

      <p className="lead">
        Join Shallion from the very beginning and help build a safe, welcoming
        community for friendships and relationships.
      </p>
    </div>

    <div className="grid-2">
      <article className="card pathway">
        <div className="card-icon" aria-hidden="true">⭐</div>

        <h3>Founding Membership</h3>

        <p className="lead">
          The first <strong>100 members</strong> can join Shallion for just
          <strong> £10 per year</strong>. This special introductory membership
          is our way of thanking those who help build the community from the
          start.
        </p>
      </article>

      <article className="card pathway">
        <div className="card-icon" aria-hidden="true">💳</div>

        <h3>Standard Membership</h3>

        <p className="lead">
          After the first 100 memberships have been allocated, annual
          membership will be <strong>£35 per year</strong>, giving full access
          to all Shallion features and the growing community.
        </p>
      </article>
    </div>

    <div className="center-actions">
      <Link href="/register" className="btn btn-primary">
        Join Shallion Today
      </Link>
    </div>
  </div>
</section>




        <section className="section community-map-section">
          <div className="container">
            <div className="section-title-center">
           
              <h2>A growing community near and far</h2>
              <p className="lead">People are joining Shallion from all over the United Kingdom to build friendships, find support and discover companionship</p>
            </div>

            <UKMap />
          </div>
        </section>
      </main>
     
    </>
  );
}
