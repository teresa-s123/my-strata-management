import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Oceanview Apartments - Strata Management</title>
        <meta name="description" content="Strata management portal for Oceanview Apartments" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Oceanview Apartments
        </h1>

        <div className={styles.buildingImage}>
          <Image
            src="/images/building.jpg"
            alt="Oceanview Apartments Building"
            width={800}
            height={500}
            priority
          />
        </div>

        <div className={styles.description}>
          <h2>Building Overview</h2>
          <p>
            Oceanview Apartments is a luxury strata-titled property located in the heart of Bondi Beach,
            Sydney, New South Wales. Built in 2018, our 12-storey complex features 48 residential units with
            stunning ocean views, a heated pool, fitness center, and landscaped communal gardens.
          </p>
          <p>
            The property is managed by an elected Strata Committee under the Strata Schemes Management Act (2015).
            This portal provides residents and owners with easy access to important information, documents,
            and services related to our building.
          </p>
        </div>

        <div className={styles.grid}>
          <a href="/documents" className={styles.card}>
            <h2>Documents &rarr;</h2>
            <p>Access important strata documents including meeting minutes and reports.</p>
          </a>

          <a href="/maintenance" className={styles.card}>
            <h2>Submit Request &rarr;</h2>
            <p>Submit maintenance requests for your unit or common areas.</p>
          </a>

          {/* PHP STATUS CHECK CARD - SHOULD BE VISIBLE */}
          <Link href="/php-maintenance">
            <a className={styles.card} style={{
              border: '3px solid #8e44ad',
              background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
              position: 'relative'
            }}>
              <h2>🔥 PHP Status Check &rarr;</h2>
              <p>Check maintenance request status using server-side processing</p>
              <span style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#8e44ad',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                SERVER-SIDE
              </span>
            </a>
          </Link>

          <a href="/levies" className={styles.card}>
            <h2>Levy Notices &rarr;</h2>
            <p>View and pay your quarterly strata levies.</p>
          </a>

          <a href="/strata-roll" className={styles.card}>
            <h2>Strata Roll &rarr;</h2>
            <p>Access the strata roll with owner information and entitlements.</p>
          </a>

          <a href="/budgets" className={styles.card}>
            <h2>Budgets &rarr;</h2>
            <p>View building financial overview and budget information.</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Oceanview Apartments Strata Management</p>
        <p style={{ fontSize: '0.8em', marginTop: '0.5rem', opacity: '0.7' }}>
          ✅ Server-side processing functionality added
        </p>
      </footer>
    </div>
  );
}