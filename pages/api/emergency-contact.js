export const config = {
    runtime: 'edge'
  };
  
  export default function handler(req) {

    const countryCode = req.headers.get('x-vercel-ip-country') || 'AU';
    

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
  

    const contactInfo = emergencyContacts[countryCode] || emergencyContacts['default'];
    

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
          'Cache-Control': 'max-age=60, s-maxage=60' 
        }
      }
    );
  }