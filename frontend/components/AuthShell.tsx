import Image from "next/image";
import Link from "next/link";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main id="main" className="form-shell auth-bg">
      <section className="form-card" aria-labelledby="auth-title">
       
        <h1 id="auth-title" style={{fontSize:"2.25rem", marginTop:"26px"}}>{title}</h1>
        <p className="lead">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
