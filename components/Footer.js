import styles from './Footer.module.css';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h3>Oceanview Apartments</h3>
            <p>123 Beach Road</p>
            <p>Bondi Beach, NSW 2026</p>
            <p>Australia</p>
          </div>
          
          <div className={styles.column}>
            <h3>Quick Links</h3>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/documents">Documents</Link></li>
              <li><Link href="/maintenance">Maintenance</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h3>Legal</h3>
            <ul>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-of-use">Terms of Use</Link></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h3>Emergency Contact</h3>
            <p>Building Manager: (02) 9123 4567</p>
            <p>After Hours: 0400 123 456</p>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>© 2025 Oceanview Apartments Strata Management</p>
          <p>Managed under the NSW Strata Schemes Management Act (2015)</p>
        </div>
      </div>
    </footer>
  );
}