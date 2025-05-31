import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/StrataRoll.module.css';
import { getUnitsWithOwners } from '../lib/supabase';

export default function StrataRoll() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('unit');

  useEffect(() => {
    async function loadStrataRoll() {
      try {
        setLoading(true);
        const { data, error } = await getUnitsWithOwners();
        
        if (error) {
          throw new Error(error.message);
        }
        
        setUnits(data || []);
      } catch (err) {
        console.error('Error loading strata roll:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStrataRoll();
  }, []);

  // Filter and sort units
  const filteredAndSortedUnits = units
    .filter(unit => {
      const matchesSearch = 
        unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (unit.owners[0] && 
          `${unit.owners[0].first_name} ${unit.owners[0].last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesFilter = 
        filterType === 'all' || 
        unit.unit_type.toLowerCase().includes(filterType.toLowerCase());
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'unit':
          return a.unit_number.localeCompare(b.unit_number);
        case 'floor':
          return a.floor_level - b.floor_level;
        case 'owner':
          const ownerA = a.owners[0] ? `${a.owners[0].last_name}, ${a.owners[0].first_name}` : '';
          const ownerB = b.owners[0] ? `${b.owners[0].last_name}, ${b.owners[0].first_name}` : '';
          return ownerA.localeCompare(ownerB);
        case 'size':
          return b.square_meters - a.square_meters;
        default:
          return 0;
      }
    });

  const calculateTotalEntitlements = () => {
    return units.reduce((total, unit) => total + (unit.square_meters || 0), 0);
  };

  const getUnitTypeStats = () => {
    const stats = {};
    units.forEach(unit => {
      stats[unit.unit_type] = (stats[unit.unit_type] || 0) + 1;
    });
    return stats;
  };

  if (loading) {
    return (
      <Layout title="Strata Roll">
        <div className={styles.container}>
          <div className={styles.loading}>
            <h2>Loading Strata Roll...</h2>
            <p>Fetching unit and owner information from database...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Strata Roll">
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>❌ Error Loading Strata Roll</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Strata Roll">
      <div className={styles.container}>
        <h1 className={styles.heading}>Strata Roll</h1>
        
        <div className={styles.instructions}>
          <h2>Unit Owners & Entitlements</h2>
          <p>Complete listing of all unit owners, contact details, and unit entitlements for Oceanview Apartments.</p>
          <div className={styles.dbBadge}>
            🗄️ Real-time data from Supabase database
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Units</h3>
            <div className={styles.statNumber}>{units.length}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Total Floor Area</h3>
            <div className={styles.statNumber}>{calculateTotalEntitlements().toFixed(0)} m²</div>
          </div>
          <div className={styles.statCard}>
            <h3>Occupied Units</h3>
            <div className={styles.statNumber}>{units.filter(u => u.owners.length > 0).length}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Avg Unit Size</h3>
            <div className={styles.statNumber}>
              {units.length > 0 ? (calculateTotalEntitlements() / units.length).toFixed(0) : 0} m²
            </div>
          </div>
        </div>

        {/* Unit Type Breakdown */}
        <div className={styles.typeBreakdown}>
          <h3>Unit Type Distribution</h3>
          <div className={styles.typeGrid}>
            {Object.entries(getUnitTypeStats()).map(([type, count]) => (
              <div key={type} className={styles.typeCard}>
                <div className={styles.typeLabel}>{type}</div>
                <div className={styles.typeCount}>{count} units</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className={styles.controls}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="Search by unit number or owner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Unit Types</option>
              <option value="1br">1 Bedroom</option>
              <option value="2br">2 Bedroom</option>
              <option value="3br">3 Bedroom</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>
          
          <div className={styles.sortGroup}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="unit">Sort by Unit Number</option>
              <option value="floor">Sort by Floor Level</option>
              <option value="owner">Sort by Owner Name</option>
              <option value="size">Sort by Unit Size</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className={styles.resultsInfo}>
          Showing {filteredAndSortedUnits.length} of {units.length} units
        </div>

        {/* Strata Roll Table */}
        <div className={styles.tableContainer}>
          <table className={styles.strataTable}>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Owner Name</th>
                <th>Contact Details</th>
                <th>Unit Size</th>
                <th>Entitlement %</th>
                <th>Parking</th>
                <th>Move-in Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUnits.map((unit) => {
                const owner = unit.owners[0]; // Primary owner
                const entitlementPercent = calculateTotalEntitlements() > 0 
                  ? ((unit.square_meters / calculateTotalEntitlements()) * 100).toFixed(2)
                  : '0.00';
                
                return (
                  <tr key={unit.id}>
                    <td className={styles.unitNumber}>{unit.unit_number}</td>
                    <td>{unit.floor_level}</td>
                    <td>
                      <span className={`${styles.unitType} ${styles[unit.unit_type.toLowerCase().replace(/\s+/g, '')]}`}>
                        {unit.unit_type}
                      </span>
                    </td>
                    <td>
                      {owner ? (
                        <div className={styles.ownerInfo}>
                          <div className={styles.ownerName}>
                            {owner.first_name} {owner.last_name}
                          </div>
                          {owner.is_primary_contact && (
                            <span className={styles.primaryBadge}>Primary Contact</span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.vacant}>Vacant</span>
                      )}
                    </td>
                    <td>
                      {owner ? (
                        <div className={styles.contactInfo}>
                          <div className={styles.email}>{owner.email}</div>
                          {owner.phone && <div className={styles.phone}>{owner.phone}</div>}
                          {owner.emergency_contact_name && (
                            <div className={styles.emergency}>
                              Emergency: {owner.emergency_contact_name}
                              {owner.emergency_contact_phone && ` (${owner.emergency_contact_phone})`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={styles.noContact}>-</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.sizeInfo}>
                        <div className={styles.totalSize}>{unit.square_meters} m²</div>
                        {unit.balcony_size && (
                          <div className={styles.balconySize}>Balcony: {unit.balcony_size} m²</div>
                        )}
                      </div>
                    </td>
                    <td className={styles.entitlement}>{entitlementPercent}%</td>
                    <td>
                      <div className={styles.amenities}>
                        <div>{unit.parking_spaces} spaces</div>
                        {unit.storage_unit && <div className={styles.storage}>+ Storage</div>}
                      </div>
                    </td>
                    <td>
                      {owner?.move_in_date ? (
                        new Date(owner.move_in_date).toLocaleDateString('en-AU')
                      ) : (
                        <span className={styles.noDate}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSortedUnits.length === 0 && (
          <div className={styles.noResults}>
            <h3>No units found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <p><strong>Data Source:</strong> Live data from Supabase database</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleString('en-AU')}</p>
            <p><strong>Total Entitlements:</strong> {calculateTotalEntitlements().toFixed(2)} m² (100%)</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}