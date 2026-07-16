"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact Us" },
];

type CurrentUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function updateAuthState() {
      const accessToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("current_user");

      setIsLoggedIn(Boolean(accessToken));

      if (!storedUser) {
        setCurrentUser(null);
        return;
      }

      try {
        setCurrentUser(JSON.parse(storedUser) as CurrentUser);
      } catch {
        localStorage.removeItem("current_user");
        setCurrentUser(null);
      }
    }

    updateAuthState();

    window.addEventListener("auth-changed", updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener("auth-changed", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");

    setIsLoggedIn(false);
    setCurrentUser(null);
    setMenuOpen(false);

    window.dispatchEvent(new Event("auth-changed"));

    router.replace("/login");
    router.refresh();
  }

  const dashboardLabel = currentUser?.first_name
    ? `Hi, ${currentUser.first_name}`
    : "Dashboard";

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner">
        <Link
          className="navbar__brand"
          href="/"
          aria-label="Shallion Connections home"
        >
          <Image
            src="/assets/shallion-logo.jpg"
            alt="Shallion logo"
            width={138}
            height={54}
            priority
            className="navbar__logo"
          />
        </Link>

        <nav className="navbar__links" aria-label="Main navigation">
          <ul className="navbar__menu" role="list">
            {primaryLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`navbar__item ${
                    pathname === href ? "navbar__item--active" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar__sep" aria-hidden="true" />

          <ul className="navbar__menu navbar__menu--auth" role="list">
            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    className="navbar__btn"
                    href="/dashboard"
                  >
                    {dashboardLabel}
                  </Link>
                </li>

                <li>
                  <button
                    className="navbar__btn navbar__btn--ghost"
                    type="button"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    className="navbar__btn"
                    href="/user-registration"
                  >
                    Register
                  </Link>
                </li>

                <li>
                  <Link
                    className="navbar__btn navbar__btn--ghost"
                    href="/login"
                  >
                    Log in
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <button
          className={`navbar__hamburger ${
            menuOpen ? "navbar__hamburger--open" : ""
          }`}
          type="button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="navbar-mobile-menu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="navbar__hamburger-icon" />
          <span className="navbar__hamburger-icon" />
          <span className="navbar__hamburger-icon" />
        </button>
      </div>

      <div
        id="navbar-mobile-menu"
        className={`navbar__mobile ${
          menuOpen ? "navbar__mobile--open" : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <ul className="navbar__mobile-menu" role="list">
          {primaryLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`navbar__mobile-item ${
                  pathname === href
                    ? "navbar__mobile-item--active"
                    : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}

          {isLoggedIn ? (
            <>
              <li>
                <Link
                  className="navbar__mobile-btn"
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  {dashboardLabel}
                </Link>
              </li>

              <li>
                <button
                  className="navbar__mobile-btn navbar__mobile-btn--ghost"
                  type="button"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  className="navbar__mobile-btn"
                  href="/user-registration"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </li>

              <li>
                <Link
                  className="navbar__mobile-btn navbar__mobile-btn--ghost"
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}