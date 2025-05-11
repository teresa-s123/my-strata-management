// /api/log-maintenance.js
export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(req) {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    try {
      // Parse the request body
      const data = await req.json();
      
      // Validate required fields
      if (!data.unitNumber || !data.description || !data.requestType) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Generate a request ID
      const requestId = 'MR' + Math.floor(10000 + Math.random() * 90000);
      
      // Timestamp the request
      const timestamp = new Date().toISOString();
      
      // In a real implementation, you would store this in a database
      // For now, we'll just return the generated ID and confirmation
      
      // Determine priority level and expected response time
      let responseTime;
      switch (data.priority) {
        case 'emergency':
          responseTime = '2 hours';
          break;
        case 'high':
          responseTime = '24 hours';
          break;
        case 'normal':
          responseTime = '3 business days';
          break;
        default:
          responseTime = '5 business days';
      }
      
      return new Response(JSON.stringify({
        success: true,
        requestId: requestId,
        timestamp: timestamp,
        message: `Your maintenance request has been logged. Expected response time: ${responseTime}`,
        expectedResponse: responseTime
      }), {
        status: 201, // Created
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }