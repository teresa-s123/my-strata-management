// Edge function for geolocation-based content
export const config = {
    runtime: 'edge'
  };
  
  export default async function handler(req) {
    // Get client IP and geo information
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // In a real application, we would use the client's IP to:
    // 1. Determine their location using a geolocation service
    // 2. Return location-specific content (weather, local contacts, etc.)
    
    // For this demo, we'll use the country from the request headers (if available)
    const country = req.headers.get('x-vercel-ip-country') || 'AU'; // Default to Australia
    const city = req.headers.get('x-vercel-ip-city') || 'Sydney';
    const region = req.headers.get('x-vercel-ip-country-region') || 'NSW';
    
    // Get current time in user's timezone
    const now = new Date();
    let timezone = 'Australia/Sydney'; // Default timezone
    
    // Adjust timezone based on country/region (simplified for demo)
    if (country === 'US') {
      timezone = 'America/New_York';
    } else if (country === 'UK' || country === 'GB') {
      timezone = 'Europe/London';
    }
    
    // Format the time for the user's location
    const localTime = now.toLocaleString('en-AU', { timeZone: timezone });
    
    // Weather information based on location (mock data for demo)
    let weatherInfo = {
      location: `${city}, ${region}, ${country}`,
      temperature: 22, // in Celsius
      condition: 'Sunny',
      forecast: [
        { day: 'Today', temp: 22, condition: 'Sunny' },
        { day: 'Tomorrow', temp: 24, condition: 'Partly Cloudy' },
        { day: 'Monday', temp: 20, condition: 'Showers' }
      ]
    };
    
    // Location-specific emergency contacts
    const emergencyContacts = {
      'AU': {
        emergency: '000',
        police: '131 444',
        health: '1800 022 222'
      },
      'US': {
        emergency: '911',
        police: '911',
        health: '211'
      },
      'UK': {
        emergency: '999',
        police: '101',
        health: '111'
      }
    };
    
    // Get the emergency contacts for the user's country
    const contacts = emergencyContacts[country] || emergencyContacts['AU'];
    
    // Return the location-based information
    return new Response(
      JSON.stringify({
        success: true,
        ip,
        location: {
          country,
          region,
          city
        },
        localTime,
        weather: weatherInfo,
        emergencyContacts: contacts
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60' // Cache for 1 minute
        }
      }
    );
  }