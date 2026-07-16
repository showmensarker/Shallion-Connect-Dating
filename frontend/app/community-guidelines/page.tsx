import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function GuidelinesPage() {
  return (
    <><Nav /><main id="main" className="section"><div className="container"><span className="eyebrow">Safety</span><h1>Community guidelines and safeguarding.</h1><div className="grid-3"><article className="card"><h3>Respect privacy</h3><p>Members choose what health and neurodiversity information to share.</p></article><article className="card"><h3>Report concerns</h3><p>Profile and message reporting should feed an admin moderation queue.</p></article><article className="card"><h3>Block quickly</h3><p>Blocking should be available from profile and message views.</p></article></div></div></main><Footer /></>
  );
}
