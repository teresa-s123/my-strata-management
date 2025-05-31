import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SimpleTest() {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testDatabase() {
      try {
        console.log('Testing Supabase connection...');
        
        // Test basic connection
        const { data: units, error: dbError } = await supabase
          .from('units')
          .select('*')
          .limit(3);

        console.log('Query result:', { data: units, error: dbError });

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`);
        }

        setData(units);
        setStatus('✅ Connection successful!');
        
      } catch (err) {
        console.error('Connection failed:', err);
        setError(err.message);
        setStatus('❌ Connection failed');
      }
    }

    testDatabase();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔬 Simple Database Connection Test</h1>
      
      <div style={{ 
        background: error ? '#f8d7da' : '#d4edda', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '1rem',
        border: `2px solid ${error ? '#dc3545' : '#28a745'}`
      }}>
        <h3>{status}</h3>
        {error && (
          <div>
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
      </div>

      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
        <h4>Environment Check:</h4>
        <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
      </div>

      {data && (
        <div style={{ background: '#e8f4f8', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h4>Sample Data Retrieved:</h4>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <h4>🔗 Navigation:</h4>
        <ul>
          <li><a href="/">Homepage</a></li>
          <li><a href="/strata-roll">Strata Roll (Real Page)</a></li>
          <li><a href="/levies">Levy Payments (Real Page)</a></li>
          <li><a href="/maintenance">Maintenance Form (Real Page)</a></li>
        </ul>
      </div>
    </div>
  );
}