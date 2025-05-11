// This is a serverless function to handle contact form submissions
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      // Get the request data
      const { name, email, unitNumber, subject, message, category } = req.body;
  
      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // In a real app, we would:
      // 1. Store the contact submission in a database
      // 2. Send an email to the appropriate department based on the category
      // 3. Send a confirmation email to the user
  
      // Generate a reference number (in a real app, this would be from the database)
      const referenceNumber = 'REF' + Math.floor(100000 + Math.random() * 900000);
  
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 500));
  
      // Return success response with the reference number
      return res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully',
        referenceNumber,
        data: {
          name,
          email,
          unitNumber,
          category,
          subject,
          submitted: new Date().toISOString()
        }
      });
  
    } catch (error) {
      console.error('Error processing contact form:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }