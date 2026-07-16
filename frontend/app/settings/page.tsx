import { AppShell } from "@/components/AppShell";
const settings=['Account security','Privacy and visibility','Notifications and quiet hours','Accessibility preferences','Blocked users','Membership and payments'];
export default function Settings(){return <AppShell title="Settings" subtitle="Personalise privacy, pace, accessibility and account controls."><div className="card settings-list">{settings.map(s=><button key={s} className="settings-row">{s}<span>›</span></button>)}</div></AppShell>}
