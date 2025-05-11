// Edge function for authentication
export const config = {
    runtime: 'edge'
  };
  
  // Mock user database (in a real app, this would be in a database)
  const users = [
    { unitNumber: '101', password: 'password123', role: 'owner' },
    { unitNumber: '102', password: 'password123', role: 'owner' },
    { unitNumber: '103', password: 'password123', role: 'owner' },
    { username: 'admin', password: 'password123', role: 'admin' },
    { username: 'committee', password: 'password123', role: 'committee' }
  ];
  
  export default async function handler(req) {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  
    try {
      // Get the request data
      const data = await req.json();
      const { unitNumber, username, password } = data;
  
      // Validate login credentials
      let user;
      
      if (unitNumber) {
        // Unit owner login
        user = users.find(u => u.unitNumber === unitNumber && u.password === password);
      } else if (username) {
        // Admin or committee login
        user = users.find(u => u.username === username && u.password === password);
      }
  
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
  
      // Create a session token (in a real app, this would be a JWT)
      const token = btoa(JSON.stringify({
        id: user.unitNumber || user.username,
        role: user.role,
        exp: Date.now() + 3600000 // 1 hour expiry
      }));
  
      // Return success response with the token
      return new Response(
        JSON.stringify({
          success: true,
          token,
          user: {
            id: user.unitNumber || user.username,
            role: user.role
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
    } catch (error) {
      console.error('Authentication error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }