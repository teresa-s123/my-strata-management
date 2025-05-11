// /api/maintenance-redirect.js
export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(req) {
    // Only accept GET requests
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  
    try {
      // Get URL object to parse query parameters
      const url = new URL(req.url);
      const requestId = url.searchParams.get('requestId');
      const destination = url.searchParams.get('destination') || '/maintenance-success';
      
      // This edge function demonstrates different redirect status codes
      // Default to 302 (temporary redirect)
      let statusCode = 302;
      
      // Check if permanent redirect is requested
      const redirectType = url.searchParams.get('type');
      if (redirectType === 'permanent') {
        statusCode = 301; // Permanent redirect
      }
      
      // Add the requestId to the destination URL if provided
      let redirectUrl = destination;
      if (requestId) {
        // Check if destination already has query parameters
        redirectUrl += redirectUrl.includes('?') ? `&requestId=${requestId}` : `?requestId=${requestId}`;
      }
      
      // Return a redirect response
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