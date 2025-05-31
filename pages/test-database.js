import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TestDatabase() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { data: units, error } = await supabase
          .from('units')
          .select('*')
          .limit(5);

        if (error) {
          setError(error.message);
        } else {
          setData(units);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🗄️ Database Connection Test</h1>
      
      {error ? (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '5px',
          marginBottom: '1rem'
        }}>
          <h3>❌ Database Connection Error:</h3>
          <p>{error}</p>
          <p><strong>Check:</strong></p>
          <ul>
            <li>Environment variables are set correctly</li>
            <li>Supabase project is running</li>
            <li>Database tables were created</li>
          </ul>
        </div>
      ) : (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '1rem', 
          borderRadius: '5px',
          marginBottom: '1rem'
        }}>
          <h3>✅ Database Connected Successfully!</h3>
          <p>Found {data?.length || 0} units in the database.</p>
        </div>
      )}

      {data && (
        <div>
          <h3>Sample Units Data:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Unit Number</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Floor</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Type</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Size (m²)</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Parking</th>
              </tr>
            </thead>
            <tbody>
              {data.map((unit) => (
                <tr key={unit.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{unit.unit_number}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{unit.floor_level}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{unit.unit_type}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{unit.square_meters}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{unit.parking_spaces}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ 
        background: '#e8f4f8', 
        padding: '1rem', 
        borderRadius: '5px',
        marginTop: '2rem'
      }}>
        <h4>💡 Next Steps:</h4>
        <p>If the connection is successful, we can now integrate the database with your:</p>
        <ul>
          <li>Maintenance request system</li>
          <li>Strata roll page</li>
          <li>Levy payment tracking</li>
          <li>Document management</li>
        </ul>
      </div>
    </div>
  );
}