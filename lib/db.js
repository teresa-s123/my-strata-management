/**
 * Database configuration for the strata management application
 * 
 * In a real application, this would connect to a proper database
 * For this demo, we'll simulate database functionality with in-memory storage
 */

// Simulate database tables with JavaScript objects
const db = {
    users: [
      { id: 1, unitNumber: '101', name: 'John Smith', email: 'john.smith@example.com', phone: '0412 345 678', role: 'owner', password: 'password123' },
      { id: 2, unitNumber: '102', name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '0423 456 789', role: 'owner', password: 'password123' },
      { id: 3, unitNumber: '103', name: 'Michael Brown', email: 'michael.brown@example.com', phone: '0434 567 890', role: 'owner', password: 'password123' },
      { id: 4, username: 'admin', name: 'Admin User', email: 'admin@oceanviewapts.com.au', role: 'admin', password: 'password123' },
      { id: 5, username: 'committee', name: 'Committee Member', email: 'committee@oceanviewapts.com.au', role: 'committee', password: 'password123' }
    ],
    
    units: [
      { unitNumber: '101', entitlement: 10, floorArea: 120, bedrooms: 2, bathrooms: 2, carSpaces: 1 },
      { unitNumber: '102', entitlement: 8, floorArea: 95, bedrooms: 1, bathrooms: 1, carSpaces: 1 },
      { unitNumber: '103', entitlement: 10, floorArea: 120, bedrooms: 2, bathrooms: 2, carSpaces: 1 },
      // ... additional units would be here
    ],
    
    maintenanceRequests: [],
    
    levyNotices: [
      { 
        id: 1, 
        unitNumber: '101', 
        period: 'Q2 2025 (Apr-Jun)', 
        dueDate: '2025-04-15', 
        adminFund: 850.00, 
        capitalFund: 425.00, 
        total: 1275.00, 
        status: 'unpaid', 
        createdAt: '2025-03-15T00:00:00Z' 
      },
      { 
        id: 2, 
        unitNumber: '101', 
        period: 'Q1 2025 (Jan-Mar)', 
        dueDate: '2025-01-15', 
        adminFund: 850.00, 
        capitalFund: 425.00, 
        total: 1275.00, 
        status: 'paid', 
        paymentDate: '2025-01-10T00:00:00Z',
        createdAt: '2024-12-15T00:00:00Z' 
      },
      // ... additional levy notices would be here
    ],
    
    payments: [],
    
    documents: [
      { id: 1, name: 'Insurance Certificate 2025', category: 'Insurance', date: '2025-01-15', file: '/documents/insurance-certificate-2025.pdf' },
      { id: 2, name: 'Annual Financial Report 2024', category: 'Finance', date: '2024-12-10', file: '/documents/financial-report-2024.pdf' },
      { id: 3, name: 'AGM Minutes - March 2025', category: 'Meeting Minutes', date: '2025-03-22', file: '/documents/agm-minutes-mar-2025.pdf' },
      // ... additional documents would be here
    ],
    
    contactMessages: []
  };
  
  // Database operations
  const dbOperations = {
    // User operations
    getUser: (unitNumber, password) => {
      return db.users.find(user => user.unitNumber === unitNumber && user.password === password);
    },
    
    getUserById: (id) => {
      return db.users.find(user => user.id === id);
    },
    
    // Unit operations
    getUnitByNumber: (unitNumber) => {
      return db.units.find(unit => unit.unitNumber === unitNumber);
    },
    
    getAllUnits: () => {
      return [...db.units];
    },
    
    // Maintenance request operations
    createMaintenanceRequest: (requestData) => {
      const newRequest = {
        id: db.maintenanceRequests.length + 1,
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      db.maintenanceRequests.push(newRequest);
      return newRequest;
    },
    
    getMaintenanceRequestsByUnit: (unitNumber) => {
      return db.maintenanceRequests.filter(request => request.unitNumber === unitNumber);
    },
    
    // Levy notice operations
    getLevyNoticesByUnit: (unitNumber) => {
      return db.levyNotices.filter(notice => notice.unitNumber === unitNumber);
    },
    
    getLevyNoticeById: (id) => {
      return db.levyNotices.find(notice => notice.id === id);
    },
    
    // Payment operations
    createPayment: (paymentData) => {
      const newPayment = {
        id: db.payments.length + 1,
        ...paymentData,
        createdAt: new Date().toISOString()
      };
      
      db.payments.push(newPayment);
      
      // Update the levy notice status
      if (paymentData.levyId) {
        const levyNotice = db.levyNotices.find(notice => notice.id === paymentData.levyId);
        if (levyNotice) {
          levyNotice.status = 'paid';
          levyNotice.paymentDate = newPayment.createdAt;
        }
      }
      
      return newPayment;
    },
    
    // Document operations
    getAllDocuments: () => {
      return [...db.documents];
    },
    
    getDocumentsByCategory: (category) => {
      return db.documents.filter(doc => doc.category === category);
    },
    
    // Contact message operations
    createContactMessage: (messageData) => {
      const newMessage = {
        id: db.contactMessages.length + 1,
        ...messageData,
        status: 'unread',
        createdAt: new Date().toISOString()
      };
      
      db.contactMessages.push(newMessage);
      return newMessage;
    }
  };
  
  export default dbOperations;