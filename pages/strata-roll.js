import { useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/StrataRoll.module.css';

export default function StrataRoll() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');


  const owners = [
    { unitNumber: '101', name: 'John Smith', email: 'john.smith@example.com', phone: '0412 345 678', entitlement: 10 },
    { unitNumber: '102', name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '0423 456 789', entitlement: 8 },
    { unitNumber: '103', name: 'Michael Brown', email: 'michael.brown@example.com', phone: '0434 567 890', entitlement: 10 },
    { unitNumber: '201', name: 'Emma Wilson', email: 'emma.w@example.com', phone: '0445 678 901', entitlement: 10 },
    { unitNumber: '202', name: 'David Lee', email: 'david.lee@example.com', phone: '0456 789 012', entitlement: 8 },
    { unitNumber: '203', name: 'Jennifer Wong', email: 'jennifer.w@example.com', phone: '0467 890 123', entitlement: 10 },
    { unitNumber: '301', name: 'Robert Chen', email: 'robert.c@example.com', phone: '0478 901 234', entitlement: 12 },
    { unitNumber: '302', name: 'Lisa Taylor', email: 'lisa.t@example.com', phone: '0489 012 345', entitlement: 12 },
    { unitNumber: '303', name: 'James Martinez', email: 'james.m@example.com', phone: '0490 123 456', entitlement: 12 },
    { unitNumber: '401', name: 'Patricia Garcia', email: 'patricia.g@example.com', phone: '0491 234 567', entitlement: 15 },
    { unitNumber: '402', name: 'Thomas Anderson', email: 'thomas.a@example.com', phone: '0492 345 678', entitlement: 15 },
    { unitNumber: '403', name: 'Elizabeth White', email: 'elizabeth.w@example.com', phone: '0493 456 789', entitlement: 15 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // This is a simple mock authentication
    // In a real app, this would validate against a secure database
    if (loginData.username === 'admin' && loginData.password === 'password123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
  };


  const filteredOwners = owners.filter(owner => 
    owner.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Strata Roll">
      <div className={styles.container}>
        <h1 className={styles.heading}>Strata Roll</h1>
        
        {!isLoggedIn ? (
          <div className={styles.loginContainer}>
            <div className={styles.card}>
              <h2>Committee Access Only</h2>
              <p>Please log in with your committee credentials to access the strata roll.</p>
              
              {error && <div className={styles.error}>{error}</div>}
              
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginData.username}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Enter your username"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Enter your password"
                  />
                </div>
                
                <button type="submit" className={styles.button}>
                  Login to Access Strata Roll
                </button>
              </form>
              
              <div className={styles.helpText}>
                <p>Note: The strata roll contains personal information and is only accessible to authorized committee members.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.rollContainer}>
            <div className={styles.rollHeader}>
              <p>Logged in as Committee Member: {loginData.username}</p>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
            
            <div className={styles.info}>
              <p>The strata roll contains information about all lot owners in the building as required by the NSW Strata Schemes Management Act (2015).</p>
            </div>
            
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by unit, name or email..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Owner Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Unit Entitlement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwners.map(owner => (
                    <tr key={owner.unitNumber}>
                      <td>{owner.unitNumber}</td>
                      <td>{owner.name}</td>
                      <td>{owner.email}</td>
                      <td>{owner.phone}</td>
                      <td>{owner.entitlement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={styles.summary}>
              <h3>Summary</h3>
              <p>Total Units: {owners.length}</p>
              <p>Total Unit Entitlements: {owners.reduce((sum, owner) => sum + owner.entitlement, 0)}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}