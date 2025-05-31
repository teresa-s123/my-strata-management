import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/PHPMaintenance.module.css';

export default function PHPMaintenance() {
  const [requestId, setRequestId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requestId.trim()) {
      window.location.href = `/api/maintenance-php.php?requestId=${requestId.trim()}`;
    }
  };

  return (
    <Layout title="Maintenance Status - PHP Portal">
      <div className={styles.container}>
        <div className={styles.main}>
          <h1 className={styles.heading}>🏢 Oceanview Apartments - Maintenance Status Portal</h1>
          <span className={styles.phpBadge}>Powered by PHP on Vercel</span>
          
          <div className={styles.instructions}>
            <h2>🔍 Check Your Maintenance Request Status</h2>
            <p>Enter your request ID to view the current status and details of your maintenance request. This system is powered by PHP running on Vercel's serverless platform.</p>
          </div>
          
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="requestId">Request ID:</label>
                <input 
                  type="text" 
                  id="requestId" 
                  name="requestId" 
                  className={styles.formControl}
                  placeholder="Enter your request ID (e.g., MR12345)"
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className={styles.btn}>Check Status</button>
            </form>
          </div>
          
          {/* Stats Section */}
          <div className={styles.statsSection}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>24</div>
              <div>Total Requests</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>8</div>
              <div>Pending</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>12</div>
              <div>In Progress</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>4</div>
              <div>Completed Today</div>
            </div>
          </div>
          
          <h2 className={styles.sectionHeading}>📋 Recent Maintenance Requests</h2>
          
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Unit</th>
                <th>Issue Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => window.location.href='/api/maintenance-php.php?requestId=MR12345'} className={styles.clickableRow}>
                <td><strong>MR12345</strong></td>
                <td>Unit 101</td>
                <td>Plumbing Repair</td>
                <td><span className={styles.priorityNormal}>Normal</span></td>
                <td>Pending Review</td>
                <td>2 hours ago</td>
              </tr>
              <tr onClick={() => window.location.href='/api/maintenance-php.php?requestId=MR54321'} className={styles.clickableRow}>
                <td><strong>MR54321</strong></td>
                <td>Unit 205</td>
                <td>Electrical Inspection</td>
                <td><span className={styles.priorityHigh}>High</span></td>
                <td>In Progress</td>
                <td>1 day ago</td>
              </tr>
              <tr onClick={() => window.location.href='/api/maintenance-php.php?requestId=MR99887'} className={styles.clickableRow}>
                <td><strong>MR99887</strong></td>
                <td>Unit 103</td>
                <td>AC Repair</td>
                <td><span className={styles.priorityHigh}>High</span></td>
                <td>✅ Completed</td>
                <td>3 days ago</td>
              </tr>
              <tr onClick={() => window.location.href='/api/maintenance-php.php?requestId=MR11223'} className={styles.clickableRow}>
                <td><strong>MR11223</strong></td>
                <td>Unit 302</td>
                <td>Equipment Safety</td>
                <td><span className={styles.priorityEmergency}>Emergency</span></td>
                <td>🚨 Scheduled Today</td>
                <td>30 minutes ago</td>
              </tr>
            </tbody>
          </table>
          
          <div className={styles.alert}>
            <h3>💡 PHP Integration Demonstration</h3>
            <p><strong>What this page demonstrates:</strong> This maintenance status portal is built with PHP running on Vercel's serverless platform, showing how PHP can complement your existing Next.js application.</p>
            <p><strong>Technical implementation:</strong> The status checker uses PHP for server-side processing while maintaining design consistency with your existing maintenance request system.</p>
            <p><strong>Try it:</strong> Click on any request ID in the table above or use the search form to see detailed PHP-generated status pages.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}