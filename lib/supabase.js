// Add these functions to your existing lib/supabase.js file

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
  
      // Calculate analytics
      const analytics = {
        totalRequests: requests.length,
        byStatus: requests.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        }, {}),
        byPriority: requests.reduce((acc, r) => {
          acc[r.priority] = (acc[r.priority] || 0) + 1;
          return acc;
        }, {}),
        byType: requests.reduce((acc, r) => {
          acc[r.request_type] = (acc[r.request_type] || 0) + 1;
          return acc;
        }, {})
      };
  
      return {
        requests,
        analytics,
        error: null
      };
  
    } catch (error) {
      console.error('Error generating maintenance report:', error);
      return { requests: [], analytics: {}, error };
    }
  }
  
  // Advanced financial calculations
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
  
      return {
        levy: { data: levyData.data, analytics: levyAnalytics },
        maintenance: { data: maintenanceData.data, analytics: maintenanceAnalytics },
        units: { data: unitData.data },
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
    
    const overduePayments = levyData.filter(p => {
      return p.status !== 'paid' && new Date(p.due_date) < new Date();
    });
  
    return {
      totalLevied,
      totalCollected,
      totalOutstanding: totalLevied - totalCollected,
      collectionRate: totalLevied > 0 ? (totalCollected / totalLevied) * 100 : 0,
      overdueCount: overduePayments.length,
      overdueAmount: overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0)
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
      costByType: maintenanceData.reduce((acc, r) => {
        const type = r.request_type || 'Unknown';
        acc[type] = (acc[type] || 0) + (r.estimated_cost || 0);
        return acc;
      }, {})
    };
  }
  
  // Export functions for CSV generation
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
      'Request ID', 'Unit Number', 'Unit Type', 'Owner Name', 'Owner Email', 
      'Description', 'Status', 'Priority', 'Request Type', 'Created Date', 'Estimated Cost'
    ];
  
    const rows = data.map(request => [
      request.request_id,
      request.units?.unit_number || '',
      request.units?.unit_type || '',
      `${request.owners?.first_name || ''} ${request.owners?.last_name || ''}`.trim(),
      request.owners?.email || '',
      `"${(request.description || '').replace(/"/g, '""')}"`,
      request.status,
      request.priority,
      request.request_type,
      new Date(request.created_at).toLocaleDateString(),
      request.estimated_cost || ''
    ]);
  
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  function generateFinancialCSV(data) {
    if (!data.levy || !data.levy.data) return '';
    
    const headers = [
      'Unit Number', 'Unit Type', 'Owner Name', 'Quarter', 'Year',
      'Amount', 'Status', 'Due Date', 'Paid Date'
    ];
  
    const rows = data.levy.data.map(payment => [
      payment.units?.unit_number || '',
      payment.units?.unit_type || '',
      `${payment.owners?.first_name || ''} ${payment.owners?.last_name || ''}`.trim(),
      payment.quarter,
      payment.year,
      payment.amount,
      payment.status,
      new Date(payment.due_date).toLocaleDateString(),
      payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : ''
    ]);
  
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  function generateOccupancyCSV(data) {
    const headers = [
      'Unit Number', 'Unit Type', 'Size (m²)', 'Parking Spaces', 
      'Owner Name', 'Owner Email', 'Move In Date'
    ];
  
    const rows = data.map(unit => [
      unit.unit_number,
      unit.unit_type,
      unit.square_meters,
      unit.parking_spaces,
      unit.owners?.[0] ? `${unit.owners[0].first_name} ${unit.owners[0].last_name}` : 'Vacant',
      unit.owners?.[0]?.email || '',
      unit.owners?.[0]?.move_in_date ? new Date(unit.owners[0].move_in_date).toLocaleDateString() : ''
    ]);
  
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }