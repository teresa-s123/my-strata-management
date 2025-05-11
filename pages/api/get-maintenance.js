export const config = {
    runtime: 'edge'
  };
  

  const sampleRequests = [
    {
      requestId: 'MR12345',
      unitNumber: '101',
      name: 'John Smith',
      email: 'john@example.com',
      requestType: 'repair',
      location: 'unit',
      description: 'Leaking faucet in bathroom',
      priority: 'normal',
      status: 'pending',
      timestamp: '2025-05-09T14:35:42Z'
    },
    {
      requestId: 'MR54321',
      unitNumber: '205',
      name: 'Emily Johnson',
      email: 'emily@example.com',
      requestType: 'inspection',
      location: 'common',
      description: 'Flickering lights in hallway',
      priority: 'high',
      status: 'in-progress',
      timestamp: '2025-05-08T10:22:15Z'
    }
  ];
  
  export default async function handler(req) {

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    try {

      const url = new URL(req.url);
      const requestId = url.searchParams.get('requestId');

      if (requestId) {
        const request = sampleRequests.find(req => req.requestId === requestId);
        
        if (!request) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Maintenance request not found'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          request
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      

      return new Response(JSON.stringify({
        success: true,
        count: sampleRequests.length,
        requests: sampleRequests
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Error retrieving maintenance requests' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }