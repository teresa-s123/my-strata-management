export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(req) {

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    try {
 
      const data = await req.json();
      

      if (!data.unitNumber || !data.description || !data.requestType) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      

      const requestId = 'MR' + Math.floor(10000 + Math.random() * 90000);
      

      const timestamp = new Date().toISOString();

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
        status: 201, 
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }