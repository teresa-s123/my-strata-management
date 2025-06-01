import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import { isLoggedIn, getUserSession } from '../lib/cookies';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check login status when component mounts or route changes
    if (isLoggedIn()) {
      setUser(getUserSession());
    } else {
      setUser(null);
    }
  }, [router.pathname]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <span>Oceanview Apartments</span>
        </Link>
        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className={`${styles.navMenu} ${isOpen ? styles.active : ''}`}>
          <ul>
            <li>
              <Link href="/" className={router.pathname === '/' ? styles.active : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/documents" className={router.pathname === '/documents' ? styles.active : ''}>
                Documents
              </Link>
            </li>
            <li>
              <Link href="/strata-roll" className={router.pathname === '/strata-roll' ? styles.active : ''}>
                Strata Roll
              </Link>
            </li>
            <li>
              <Link href="/maintenance" className={router.pathname === '/maintenance' ? styles.active : ''}>
                Maintenance
              </Link>
            </li>
            <li>
              <Link href="/budgets" className={router.pathname === '/budgets' ? styles.active : ''}>
                Budgets
              </Link>
            </li>
            <li>
              <Link href="/levies" className={router.pathname === '/levies' ? styles.active : ''}>
                Levies
              </Link>
            </li>
            <li>
              <Link href="/contact" className={router.pathname === '/contact' ? styles.active : ''}>
                Contact
              </Link>
            </li>
            
            {/* Cookie Authentication Links */}
            {user ? (
              <li>
                <Link href="/dashboard" className={router.pathname === '/dashboard' ? styles.active : ''}>
                  Dashboard ({user.unitNumber})
                </Link>
              </li>
            ) : (
              <li>
                <Link href="/login" className={router.pathname === '/login' ? styles.active : ''}>
                  Login 🍪
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}