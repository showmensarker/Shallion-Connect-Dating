import Image from "next/image";
import Link from "next/link";

const links = [
  ["Dashboard", "/dashboard"], ["Discover", "/discover"], ["Matches", "/matches"],
  ["Messages", "/messages"], ["Membership", "/membership"], ["Profile", "/profile"], ["Settings", "/settings"]
];

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <><header className="app-topbar"><Link href="/" className="brand"><Image src="/assets/shallion-logo.jpg" alt="Shallion logo" width={140} height={54}/><span className="brand-text">Connections</span></Link></header>
    <main id="main" className="app-layout"><aside className="sidebar" aria-label="Application navigation">{links.map(([label, href]) => <Link key={href} href={href} className="side-link">{label}</Link>)}<Link href="/safety" className="side-link">Safety</Link><Link href="/admin" className="side-link">Admin</Link></aside>
    <section className="app-content"><div className="page-heading"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{children}</section></main></>
  );
}
