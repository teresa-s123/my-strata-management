// This is a serverless function to handle maintenance requests
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      // Get the request data
      const { unitNumber, name, email, phone, requestType, location, description, preferredDate, accessInstructions, priority } = req.body;
  
      // Validate required fields
      if (!unitNumber || !name || !email || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // In a real app, we would:
      // 1. Store the maintenance request in a database
      // 2. Send an email notification to the building manager
      // 3. Send a confirmation email to the unit owner
  
      // Generate a request ID (in a real app, this would be from the database)
      const requestId = 'MR' + Math.floor(10000 + Math.random() * 90000);
  
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 500));
  
      // Return success response with the request ID
      return res.status(200).json({
        success: true,
        message: 'Maintenance request submitted successfully',
        requestId,
        data: {
          unitNumber,
          name,
          email,
          requestType,
          location,
          priority,
          submitted: new Date().toISOString()
        }
      });
  
    } catch (error) {
      console.error('Error processing maintenance request:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }