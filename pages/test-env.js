export default function TestEnv() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>🔧 Environment Variables Test</h1>
        
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>NEXT_PUBLIC_SUPABASE_URL:</h3>
          <p style={{ 
            background: supabaseUrl ? '#d4edda' : '#f8d7da', 
            padding: '0.5rem', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {supabaseUrl || '❌ NOT SET'}
          </p>
        </div>
  
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>NEXT_PUBLIC_SUPABASE_ANON_KEY:</h3>
          <p style={{ 
            background: supabaseKey ? '#d4edda' : '#f8d7da', 
            padding: '0.5rem', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {supabaseKey ? `${supabaseKey.substring(0, 50)}...` : '❌ NOT SET'}
          </p>
        </div>
  
        <div style={{ background: '#e8f4f8', padding: '1rem', borderRadius: '8px' }}>
          <h3>📋 Status:</h3>
          {supabaseUrl && supabaseKey ? (
            <p style={{ color: 'green', fontWeight: 'bold' }}>
              ✅ Both environment variables are set correctly!
            </p>
          ) : (
            <div>
              <p style={{ color: 'red', fontWeight: 'bold' }}>
                ❌ Environment variables are missing!
              </p>
              <h4>To fix this:</h4>
              <ol>
                <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                <li>Add NEXT_PUBLIC_SUPABASE_URL = https://vhzcdccyckbnkilrnqgv.supabase.co</li>
                <li>Add NEXT_PUBLIC_SUPABASE_ANON_KEY = (your anon key)</li>
                <li>Redeploy your project</li>
              </ol>
            </div>
          )}
        </div>
  
        <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h4>🎯 Expected Values:</h4>
          <p><strong>URL:</strong> https://vhzcdccyckbnkilrnqgv.supabase.co</p>
          <p><strong>Key:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (long string)</p>
        </div>
  
        <div style={{ marginTop: '1rem' }}>
          <h4>🔗 Next Steps:</h4>
          <ul>
            <li><a href="/simple-test">Test Database Connection</a></li>
            <li><a href="/strata-roll">Try Strata Roll Page</a></li>
            <li><a href="/levies">Try Levy Payments Page</a></li>
          </ul>
        </div>
      </div>
    );
  }