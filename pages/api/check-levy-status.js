
export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(req) {

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  

    const { searchParams } = new URL(req.url);
    const unitNumber = searchParams.get('unit');
    
    if (!unitNumber) {
      return new Response(JSON.stringify({ error: 'Unit number is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    // In a real implementation, you would check a database
    // This is a mock implementation with hardcoded data
    const levyStatuses = {
      '101': { status: 'paid', lastPayment: '2025-03-15' },
      '102': { status: 'overdue', dueDate: '2025-03-15' },
      '201': { status: 'paid', lastPayment: '2025-04-01' },
      // Add more units as needed
    };
  
    // Check if the unit exists in our mock data
    if (levyStatuses[unitNumber]) {
      return new Response(JSON.stringify(levyStatuses[unitNumber]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=300, s-maxage=300' // Cache for 5 minutes
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Unit not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }