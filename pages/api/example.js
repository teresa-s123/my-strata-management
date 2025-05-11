/**
 * Example API handler demonstrating both GET and POST methods
 * This serves as an educational example to show the differences
 * between GET and POST requests
 */

import dbOperations from '../../lib/db';

export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGET(req, res);
    case 'POST':
      return handlePOST(req, res);
    default:
      // Method not allowed
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'This endpoint only supports GET and POST requests',
        allowedMethods: ['GET', 'POST']
      });
  }
}

/**
 * Handle GET requests - used for retrieving data
 *
 * Characteristics of GET requests:
 * - Parameters are sent in the URL query string
 * - Visible in browser history and server logs
 * - Can be cached by browsers
 * - Limited data size (URL length limitations)
 * - Should be idempotent (same request always returns same result)
 * - Should not modify server state
 */
async function handleGET(req, res) {
  try {
    // Get parameters from the URL query string
    const { category, limit } = req.query;
    
    // Validate parameters
    if (category && !['Insurance', 'Finance', 'Meeting Minutes', 'Maintenance', 'Compliance', 'Legal'].includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        message: 'Category must be one of: Insurance, Finance, Meeting Minutes, Maintenance, Compliance, Legal'
      });
    }
    
    // Parse limit parameter
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({
        error: 'Invalid limit',
        message: 'Limit must be a positive number'
      });
    }
    
    // Retrieve data based on parameters
    let documents;
    if (category) {
      documents = dbOperations.getDocumentsByCategory(category);
    } else {
      documents = dbOperations.getAllDocuments();
    }
    
    // Apply limit
    documents = documents.slice(0, parsedLimit);
    
    // Return the data
    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}

/**
 * Handle POST requests - used for creating or updating data
 *
 * Characteristics of POST requests:
 * - Data is sent in the request body
 * - Not visible in browser history or server logs
 * - Not cached by browsers
 * - No size limitations (other than server configuration)
 * - Not idempotent (same request may produce different results)
 * - Often modifies server state
 */
async function handlePOST(req, res) {
  try {
    // Get data from the request body
    const { name, category, file } = req.body;
    
    // Validate required fields
    if (!name || !category || !file) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, category, and file are required fields',
        requiredFields: ['name', 'category', 'file']
      });
    }
    
    // Validate category
    if (!['Insurance', 'Finance', 'Meeting Minutes', 'Maintenance', 'Compliance', 'Legal'].includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        message: 'Category must be one of: Insurance, Finance, Meeting Minutes, Maintenance, Compliance, Legal'
      });
    }
    
    // In a real application, we would:
    // 1. Save the file to storage
    // 2. Create a record in the database
    
    // Simulate creating a new document
    const newDocument = {
      id: Math.floor(1000 + Math.random() * 9000),
      name,
      category,
      date: new Date().toISOString().split('T')[0],
      file
    };
    
    // Return success response with the created document
    return res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: newDocument
    });
  } catch (error) {
    console.error('Error handling POST request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}