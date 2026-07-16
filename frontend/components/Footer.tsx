import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">

      {/* Accent stripe matching navbar border */}
      <div className="footer__stripe" aria-hidden="true" />

      <div className="footer__main">
        <div className="footer__inner">

          {/* Left — brand block */}
          <div className="footer__brand">
            <Image
              src="/assets/shallion-logo.jpg"
              alt="Shallion Connections"
              width={136}
              height={54}
              className="footer__logo"
            />
            <p className="footer__desc">
              An accessible friendship and relationship platform for people living with chronic illness,
              functional conditions, neurodiversity and autism.
            </p>
          </div>

          {/* Right — original link groups */}
          <div className="footer__cols">

            <div className="footer__col">
              <p className="footer__col-head">Community</p>
              <ul className="footer__list" role="list">
                <li><Link className="footer__ln" href="/community-guidelines">Community Guidelines</Link></li>
                <li><Link className="footer__ln" href="/safety">Safety</Link></li>
              </ul>
            </div>

            <div className="footer__col">
              <p className="footer__col-head">Support</p>
              <ul className="footer__list" role="list">
                <li><Link className="footer__ln" href="/forgot-password">Help Centre</Link></li>
                <li><Link className="footer__ln" href="/login">Member Login</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bar">
        <div className="footer__bar-inner">
          <p className="footer__copy">
            &copy; {new Date().getFullYear()} Shallion Connections &mdash; Built for safe, meaningful connection.
          </p>
          <nav className="footer__legal" aria-label="Legal">
            <Link className="footer__legal-ln" href="/privacy">Privacy</Link>
            <span className="footer__dot" aria-hidden="true" />
            <Link className="footer__legal-ln" href="/terms">Terms</Link>
            <span className="footer__dot" aria-hidden="true" />
            <Link className="footer__legal-ln" href="/cookies">Cookies</Link>
          </nav>
        </div>
      </div>

    </footer>
  );
}
