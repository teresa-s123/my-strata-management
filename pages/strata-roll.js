import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function StrataRoll() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUnits() {
      try {
        console.log('Loading units from database...');
        
        const { data, error } = await supabase
          .from('units')
          .select(`
            *,
            owners (
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .order('unit_number');

        console.log('Database result:', { data, error });

        if (error) {
          throw error;
        }

        setUnits(data || []);
      } catch (err) {
        console.error('Error loading units:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUnits();
  }, []);

  if (loading) {
    return (
      <Layout title="Strata Roll">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading Strata Roll...</h2>
          <p>Fetching data from Supabase database...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Strata Roll">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>❌ Error Loading Data</h2>
          <p>{error}</p>
          <button className="btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Strata Roll">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <h1 style={{ color: '#003366', textAlign: 'center', marginBottom: '2rem' }}>
          📋 Strata Roll - Unit Owners Directory
        </h1>
        
        <div className="alert alert-info" style={{ 
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <strong>🗄️ Database Integration:</strong> Real-time data from Supabase database ({units.length} units loaded)
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Units</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#003366' }}>
              {units.length}
            </div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Occupied</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#003366' }}>
              {units.filter(u => u.owners && u.owners.length > 0).length}
            </div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Floor Area</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#003366' }}>
              {units.reduce((total, unit) => total + (unit.square_meters || 0), 0).toFixed(0)} m²
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          overflow: 'hidden',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#003366', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Unit</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Owner</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Contact</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Size</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Parking</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit, index) => {
                  const owner = unit.owners && unit.owners[0];
                  return (
                    <tr key={unit.id} style={{ 
                      borderBottom: '1px solid #eee',
                      background: index % 2 === 0 ? '#f8f9fa' : 'white'
                    }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: '#003366' }}>
                        {unit.unit_number}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: '#e3f2fd', 
                          color: '#1976d2', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {unit.unit_type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {owner ? (
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {owner.first_name} {owner.last_name}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#dc3545', fontStyle: 'italic' }}>Vacant</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                        {owner ? (
                          <div>
                            <div style={{ color: '#0070f3' }}>{owner.email}</div>
                            {owner.phone && <div style={{ color: '#666' }}>{owner.phone}</div>}
                          </div>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{unit.square_meters} m²</div>
                        {unit.balcony_size && (
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            Balcony: {unit.balcony_size} m²
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div>{unit.parking_spaces} spaces</div>
                        {unit.storage_unit && (
                          <div style={{ fontSize: '0.8rem', color: '#28a745', fontWeight: 'bold' }}>
                            + Storage
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {units.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No units found</h3>
            <p>The database might be empty or there's a connection issue.</p>
          </div>
        )}

        <div className="alert alert-info" style={{ 
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          <strong>Live Database Integration:</strong> Data loaded from Supabase • Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </Layout>
  );
}