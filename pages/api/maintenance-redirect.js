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
  
    try {

      const url = new URL(req.url);
      const requestId = url.searchParams.get('requestId');
      const destination = url.searchParams.get('destination') || '/maintenance-success';
      

      let statusCode = 302;
      

      const redirectType = url.searchParams.get('type');
      if (redirectType === 'permanent') {
        statusCode = 301; 
      }
      

      let redirectUrl = destination;
      if (requestId) {

        redirectUrl += redirectUrl.includes('?') ? `&requestId=${requestId}` : `?requestId=${requestId}`;
      }
      

      return new Response(null, {
        status: statusCode,
        headers: { 
          'Location': redirectUrl,
          'Content-Type': 'application/json'
        }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Error processing redirect' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }