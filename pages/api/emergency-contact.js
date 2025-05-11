// /api/emergency-contact.js
export const config = {
    runtime: 'edge'
  };
  
  export default function handler(req) {
    // Get user's location from headers if available
    const countryCode = req.headers.get('x-vercel-ip-country') || 'AU';
    
    // Different emergency services based on location
    const emergencyContacts = {
      'AU': {
        'phone': '000',
        'buildingManager': '0400 123 456'
      },
      'default': {
        'phone': '000',
        'buildingManager': '0400 123 456'
      }
    };
  
    // Get the appropriate contact info
    const contactInfo = emergencyContacts[countryCode] || emergencyContacts['default'];
    
    // Return emergency contact JSON
    return new Response(
      JSON.stringify({
        emergencyServices: contactInfo.phone,
        buildingManager: contactInfo.buildingManager,
        message: "For life-threatening emergencies, call emergency services. For building emergencies, call the building manager."
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=60, s-maxage=60' // Cache for 1 minute
        }
      }
    );
  }