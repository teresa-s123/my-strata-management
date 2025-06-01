// pages/api/log-maintenance.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      unitNumber,
      name,
      email,
      phone,
      requestType,
      location,
      description,
      preferredDate,
      accessInstructions,
      priority
    } = req.body;

    // Validate required fields
    if (!unitNumber || !name || !email || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: unitNumber, name, email, description' 
      });
    }

    // Generate unique request ID
    const requestId = 'MR' + Math.floor(10000 + Math.random() * 90000);

    // In a real implementation, you would save this to your database
    // For now, we'll just simulate the process
    const requestData = {
      request_id: requestId,
      unit_number: unitNumber,
      contact_name: name,
      contact_email: email,
      contact_phone: phone || null,
      request_type: requestType || 'repair',
      location: location || 'unit',
      description,
      priority: priority || 'normal',
      status: 'pending',
      preferred_date: preferredDate || null,
      access_instructions: accessInstructions || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Calculate expected response time based on priority
    const getExpectedResponse = (priority) => {
      switch (priority) {
        case 'emergency': return '24 hours';
        case 'high': return '2-3 business days';
        case 'normal': return '5-7 business days';
        case 'low': return '10-14 business days';
        default: return '5-7 business days';
      }
    };

    // Simulate saving to database (you would replace this with actual database save)
    console.log('Maintenance request received:', requestData);

    const response = {
      success: true,
      requestId: requestId,
      message: `Your maintenance request has been submitted successfully. Request ID: ${requestId}`,
      expectedResponse: getExpectedResponse(priority),
      data: {
        requestId: requestId,
        status: 'pending',
        priority: priority || 'normal',
        createdAt: requestData.created_at
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Unexpected error in maintenance API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}