// lib/supabase-advanced.js
import { supabase } from './supabase';

// Advanced query functions demonstrating Supabase capabilities

// Real-time subscription management
export class SupabaseRealTimeManager {
  constructor() {
    this.subscriptions = new Map();
  }

  // Subscribe to table changes with custom callback
  subscribeToTable(tableName, callback, filters = {}) {
    const channelName = `${tableName}_${Date.now()}`;
    
    let subscription = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
        ...filters
      }, callback);

    // Add additional event types if needed
    if (filters.includeInserts !== false) {
      subscription = subscription.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: tableName
      }, (payload) => callback({...payload, eventType: 'INSERT'}));
    }

    if (filters.includeUpdates !== false) {
      subscription = subscription.on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: tableName
      }, (payload) => callback({...payload, eventType: 'UPDATE'}));
    }

    if (filters.includeDeletes !== false) {
      subscription = subscription.on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: tableName
      }, (payload) => callback({...payload, eventType: 'DELETE'}));
    }

    subscription.subscribe();
    this.subscriptions.set(channelName, subscription);
    
    return channelName;
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, channelName) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }
}

// Advanced search functions with full-text search
export async function performAdvancedSearch(searchParams) {
  const { 
    table, 
    searchFields, 
    searchTerm, 
    filters = {}, 
    dateRange = {}, 
    orderBy = 'created_at',
    orderDirection = 'desc',
    limit = 50,
    includeRelations = []
  } = searchParams;

  let query = supabase.from(table);

  // Build select clause with relations
  let selectClause = '*';
  if (includeRelations.length > 0) {
    const relations = includeRelations.map(rel => {
      if (typeof rel === 'string') {
        return rel;
      } else if (typeof rel === 'object') {
        return `${rel.table} (${rel.fields.join(', ')})`;
      }
      return rel;
    }).join(', ');
    selectClause = `*, ${relations}`;
  }

  query = query.select(selectClause);

  // Full-text search across multiple fields
  if (searchTerm && searchFields && searchFields.length > 0) {
    const searchConditions = searchFields
      .map(field => `${field}.ilike.%${searchTerm}%`)
      .join(',');
    query = query.or(searchConditions);
  }

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (typeof value === 'object' && value.operator) {
        // Support for complex operators
        switch (value.operator) {
          case 'gte':
            query = query.gte(key, value.value);
            break;
          case 'lte':
            query = query.lte(key, value.value);
            break;
          case 'gt':
            query = query.gt(key, value.value);
            break;
          case 'lt':
            query = query.lt(key, value.value);
            break;
          case 'neq':
            query = query.neq(key, value.value);
            break;
          case 'like':
            query = query.like(key, `%${value.value}%`);
            break;
          case 'ilike':
            query = query.ilike(key, `%${value.value}%`);
            break;
          default:
            query = query.eq(key, value.value);
        }
      } else {
        query = query.eq(key, value);
      }
    }
  });

  // Date range filtering
  if (dateRange.startDate) {
    query = query.gte(dateRange.field || 'created_at', dateRange.startDate);
  }
  if (dateRange.endDate) {
    const endDate = dateRange.endDate.includes('T') ? 
      dateRange.endDate : dateRange.endDate + 'T23:59:59';
    query = query.lte(dateRange.field || 'created_at', endDate);
  }

  // Ordering and limiting
  query = query.order(orderBy, { ascending: orderDirection === 'asc' });
  
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Advanced search error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// Advanced aggregation functions
export async function getAggregatedData(tableName, aggregations, filters = {}) {
  let query = supabase.from(tableName);

  // Apply filters first
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query = query.eq(key, value);
    }
  });

  // For complex aggregations, we need to use RPC (Remote Procedure Call)
  // This would require custom PostgreSQL functions, but for demo purposes,
  // we'll fetch data and aggregate in JavaScript
  
  const { data, error } = await query.select('*');
  
  if (error) {
    return { data: null, error };
  }

  const result = {};

  aggregations.forEach(agg => {
    switch (agg.type) {
      case 'count':
        result[agg.field] = data.length;
        break;
      case 'sum':
        result[agg.field] = data.reduce((sum, item) => sum + (item[agg.field] || 0), 0);
        break;
      case 'avg':
        const values = data.map(item => item[agg.field]).filter(val => val !== null && val !== undefined);
        result[agg.field] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
        break;
      case 'min':
        const minValues = data.map(item => item[agg.field]).filter(val => val !== null && val !== undefined);
        result[agg.field] = minValues.length > 0 ? Math.min(...minValues) : null;
        break;
      case 'max':
        const maxValues = data.map(item => item[agg.field]).filter(val => val !== null && val !== undefined);
        result[agg.field] = maxValues.length > 0 ? Math.max(...maxValues) : null;
        break;
      case 'group_by':
        result[agg.field] = data.reduce((groups, item) => {
          const key = item[agg.field] || 'Unknown';
          groups[key] = (groups[key] || 0) + 1;
          return groups;
        }, {});
        break;
    }
  });

  return { data: result, error: null };
}

// Complex reporting queries
export async function generateMaintenanceReport(dateRange) {
  try {
    // Main query with multiple joins
    const { data: requests, error: requestsError } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        units!inner (
          unit_number,
          unit_type,
          square_meters,
          floor_level,
          parking_spaces
        ),
        owners!inner (
          first_name,
          last_name,
          email,
          phone,
          move_in_date
        )
      `)
      .gte('created_at', dateRange.startDate)
      .lte('created_at', dateRange.endDate + 'T23:59:59')
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    // Additional analytics queries
    const [statusStats, priorityStats, typeStats] = await Promise.all([
      getAggregatedData('maintenance_requests', [
        { type: 'group_by', field: 'status' }
      ], { 
        created_at: { operator: 'gte', value: dateRange.startDate }
      }),
      getAggregatedData('maintenance_requests', [
        { type: 'group_by', field: 'priority' }
      ], { 
        created_at: { operator: 'gte', value: dateRange.startDate }
      }),
      getAggregatedData('maintenance_requests', [
        { type: 'group_by', field: 'request_type' }
      ], { 
        created_at: { operator: 'gte', value: dateRange.startDate }
      })
    ]);

    return {
      requests,
      analytics: {
        byStatus: statusStats.data?.status || {},
        byPriority: priorityStats.data?.priority || {},
        byType: typeStats.data?.request_type || {},
        totalRequests: requests.length
      },
      error: null
    };

  } catch (error) {
    console.error('Error generating maintenance report:', error);
    return { requests: [], analytics: {}, error };
  }
}

// Advanced financial calculations with cross-table analysis
export async function generateFinancialAnalysis(dateRange) {
  try {
    // Complex query combining levy payments and maintenance costs
    const [levyData, maintenanceData, unitData] = await Promise.all([
      supabase
        .from('levy_payments')
        .select(`
          *,
          units!inner (
            unit_number,
            unit_type,
            square_meters
          ),
          owners!inner (
            first_name,
            last_name,
            email
          )
        `)
        .gte('due_date', dateRange.startDate)
        .lte('due_date', dateRange.endDate),

      supabase
        .from('maintenance_requests')
        .select(`
          *,
          units!inner (unit_number, unit_type)
        `)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate)
        .not('estimated_cost', 'is', null),

      supabase
        .from('units')
        .select(`
          *,
          owners (first_name, last_name, move_in_date)
        `)
    ]);

    if (levyData.error) throw levyData.error;
    if (maintenanceData.error) throw maintenanceData.error;
    if (unitData.error) throw unitData.error;

    // Calculate financial metrics
    const levyAnalytics = calculateLevyMetrics(levyData.data);
    const maintenanceAnalytics = calculateMaintenanceMetrics(maintenanceData.data);
    const crossAnalysis = performCrossAnalysis(levyData.data, maintenanceData.data, unitData.data);

    return {
      levy: { data: levyData.data, analytics: levyAnalytics },
      maintenance: { data: maintenanceData.data, analytics: maintenanceAnalytics },
      units: { data: unitData.data },
      crossAnalysis,
      summary: {
        totalIncome: levyAnalytics.totalCollected,
        totalExpenses: maintenanceAnalytics.totalEstimated,
        netPosition: levyAnalytics.totalCollected - maintenanceAnalytics.totalEstimated,
        collectionEfficiency: levyAnalytics.collectionRate
      },
      error: null
    };

  } catch (error) {
    console.error('Error generating financial analysis:', error);
    return { error };
  }
}

// Helper functions for financial calculations
function calculateLevyMetrics(levyData) {
  const totalLevied = levyData.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCollected = levyData.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstanding = totalLevied - totalCollected;
  
  const overduePayments = levyData.filter(p => {
    return p.status !== 'paid' && new Date(p.due_date) < new Date();
  });

  return {
    totalLevied,
    totalCollected,
    totalOutstanding,
    collectionRate: totalLevied > 0 ? (totalCollected / totalLevied) * 100 : 0,
    overdueCount: overduePayments.length,
    overdueAmount: overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    byQuarter: groupByQuarter(levyData),
    unitPerformance: calculateUnitPaymentPerformance(levyData)
  };
}

function calculateMaintenanceMetrics(maintenanceData) {
  const totalEstimated = maintenanceData.reduce((sum, r) => sum + (r.estimated_cost || 0), 0);
  const emergencyCosts = maintenanceData
    .filter(r => r.priority === 'emergency')
    .reduce((sum, r) => sum + (r.estimated_cost || 0), 0);

  return {
    totalEstimated,
    averageCost: maintenanceData.length > 0 ? totalEstimated / maintenanceData.length : 0,
    emergencyCosts,
    costByType: groupAndSum(maintenanceData, 'request_type', 'estimated_cost'),
    costByPriority: groupAndSum(maintenanceData, 'priority', 'estimated_cost')
  };
}

function performCrossAnalysis(levyData, maintenanceData, unitData) {
  // Analyze correlation between maintenance requests and payment behavior
  const unitMaintenanceCount = maintenanceData.reduce((acc, req) => {
    const unitNumber = req.units?.unit_number;
    if (unitNumber) {
      acc[unitNumber] = (acc[unitNumber] || 0) + 1;
    }
    return acc;
  }, {});

  const unitPaymentPerformance = levyData.reduce((acc, payment) => {
    const unitNumber = payment.units?.unit_number;
    if (unitNumber) {
      if (!acc[unitNumber]) {
        acc[unitNumber] = { total: 0, paid: 0, onTime: 0 };
      }
      acc[unitNumber].total++;
      if (payment.status === 'paid') {
        acc[unitNumber].paid++;
        // Check if paid on time
        if (payment.paid_date && new Date(payment.paid_date) <= new Date(payment.due_date)) {
          acc[unitNumber].onTime++;
        }
      }
    }
    return acc;
  }, {});

  // Calculate correlation metrics
  const correlationData = Object.keys(unitMaintenanceCount).map(unitNumber => {
    const maintenanceCount = unitMaintenanceCount[unitNumber] || 0;
    const paymentData = unitPaymentPerformance[unitNumber] || { total: 0, paid: 0, onTime: 0 };
    const paymentRate = paymentData.total > 0 ? paymentData.paid / paymentData.total : 0;
    
    return {
      unitNumber,
      maintenanceCount,
      paymentRate,
      onTimeRate: paymentData.total > 0 ? paymentData.onTime / paymentData.total : 0
    };
  });

  return {
    unitCorrelation: correlationData,
    highMaintenanceUnits: correlationData.filter(unit => unit.maintenanceCount > 3),
    lowPaymentUnits: correlationData.filter(unit => unit.paymentRate < 0.8),
    riskUnits: correlationData.filter(unit => unit.maintenanceCount > 2 && unit.paymentRate < 0.9)
  };
}

// Utility functions
function groupByQuarter(data) {
  return data.reduce((groups, item) => {
    const quarter = `Q${item.quarter}/${item.year}`;
    if (!groups[quarter]) {
      groups[quarter] = { count: 0, amount: 0, paid: 0 };
    }
    groups[quarter].count++;
    groups[quarter].amount += item.amount || 0;
    if (item.status === 'paid') {
      groups[quarter].paid++;
    }
    return groups;
  }, {});
}

function groupAndSum(array, groupKey, sumKey) {
  return array.reduce((groups, item) => {
    const group = item[groupKey] || 'Unknown';
    groups[group] = (groups[group] || 0) + (item[sumKey] || 0);
    return groups;
  }, {});
}

function calculateUnitPaymentPerformance(levyData) {
  return levyData.reduce((performance, payment) => {
    const unitNumber = payment.units?.unit_number;
    if (unitNumber) {
      if (!performance[unitNumber]) {
        performance[unitNumber] = {
          total: 0,
          paid: 0,
          amount: 0,
          paidAmount: 0,
          averageDaysLate: 0,
          latePayments: 0
        };
      }
      
      const unit = performance[unitNumber];
      unit.total++;
      unit.amount += payment.amount || 0;
      
      if (payment.status === 'paid') {
        unit.paid++;
        unit.paidAmount += payment.amount || 0;
        
        // Calculate days late if applicable
        if (payment.paid_date && payment.due_date) {
          const dueDate = new Date(payment.due_date);
          const paidDate = new Date(payment.paid_date);
          const daysLate = Math.max(0, Math.floor((paidDate - dueDate) / (1000 * 60 * 60 * 24)));
          
          if (daysLate > 0) {
            unit.latePayments++;
            unit.averageDaysLate = ((unit.averageDaysLate * (unit.latePayments - 1)) + daysLate) / unit.latePayments;
          }
        }
      }
      
      // Calculate payment rate
      unit.paymentRate = unit.total > 0 ? (unit.paid / unit.total) * 100 : 0;
    }
    return performance;
  }, {});
}

// Export functions for CSV/PDF generation
export function generateCSVContent(data, type) {
  switch (type) {
    case 'maintenance':
      return generateMaintenanceCSV(data);
    case 'financial':
      return generateFinancialCSV(data);
    case 'occupancy':
      return generateOccupancyCSV(data);
    default:
      return '';
  }
}

function generateMaintenanceCSV(data) {
  const headers = [
    'Request ID', 'Unit Number', 'Unit Type', 'Owner Name', 'Owner Email', 'Owner Phone',
    'Description', 'Status', 'Priority', 'Request Type', 'Location', 'Created Date',
    'Completed Date', 'Estimated Cost', 'Response Time (Hours)'
  ];

  const rows = data.map(request => {
    const responseTime = request.completed_at ? 
      Math.round((new Date(request.completed_at) - new Date(request.created_at)) / (1000 * 60 * 60)) : '';
    
    return [
      request.request_id,
      request.units?.unit_number || '',
      request.units?.unit_type || '',
      `${request.owners?.first_name || ''} ${request.owners?.last_name || ''}`.trim(),
      request.owners?.email || '',
      request.owners?.phone || '',
      `"${(request.description || '').replace(/"/g, '""')}"`,
      request.status,
      request.priority,
      request.request_type,
      request.location,
      new Date(request.created_at).toLocaleDateString(),
      request.completed_at ? new Date(request.completed_at).toLocaleDateString() : '',
      request.estimated_cost || '',
      responseTime
    ];
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateFinancialCSV(data) {
  const headers = [
    'Unit Number', 'Unit Type', 'Owner Name', 'Owner Email', 'Quarter', 'Year',
    'Amount', 'Status', 'Due Date', 'Paid Date', 'Late Fee', 'Days Late'
  ];

  const rows = data.levy.data.map(payment => {
    const daysLate = payment.paid_date && payment.due_date ? 
      Math.max(0, Math.floor((new Date(payment.paid_date) - new Date(payment.due_date)) / (1000 * 60 * 60 * 24))) : '';
    
    return [
      payment.units?.unit_number || '',
      payment.units?.unit_type || '',
      `${payment.owners?.first_name || ''} ${payment.owners?.last_name || ''}`.trim(),
      payment.owners?.email || '',
      payment.quarter,
      payment.year,
      payment.amount,
      payment.status,
      new Date(payment.due_date).toLocaleDateString(),
      payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : '',
      payment.late_fee || 0,
      daysLate
    ];
  });

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateOccupancyCSV(data) {
  const headers = [
    'Unit Number', 'Unit Type', 'Floor Level', 'Size (m²)', 'Parking Spaces', 'Storage Unit',
    'Owner Name', 'Owner Email', 'Owner Phone', 'Move In Date', 'Balcony Size (m²)'
  ];

  const rows = data.map(unit => [
    unit.unit_number,
    unit.unit_type,
    unit.floor_level,
    unit.square_meters,
    unit.parking_spaces,
    unit.storage_unit ? 'Yes' : 'No',
    unit.owners?.[0] ? `${unit.owners[0].first_name} ${unit.owners[0].last_name}` : 'Vacant',
    unit.owners?.[0]?.email || '',
    unit.owners?.[0]?.phone || '',
    unit.owners?.[0]?.move_in_date ? new Date(unit.owners[0].move_in_date).toLocaleDateString() : '',
    unit.balcony_size || ''
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Database health and performance monitoring
export async function getDatabaseHealth() {
  try {
    const startTime = Date.now();
    
    // Test basic connectivity and response time
    const { data, error } = await supabase
      .from('units')
      .select('count(*)')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) throw error;

    // Get table sizes and row counts
    const [unitsCount, maintenanceCount, levyCount, ownersCount] = await Promise.all([
      supabase.from('units').select('*', { count: 'exact', head: true }),
      supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }),
      supabase.from('levy_payments').select('*', { count: 'exact', head: true }),
      supabase.from('owners').select('*', { count: 'exact', head: true })
    ]);

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      tables: {
        units: unitsCount.count || 0,
        maintenance_requests: maintenanceCount.count || 0,
        levy_payments: levyCount.count || 0,
        owners: ownersCount.count || 0
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}