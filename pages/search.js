// pages/search.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function AdvancedSearch() {
  const [searchType, setSearchType] = useState('maintenance');
  const [filters, setFilters] = useState({
    // Common filters
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    
    // Maintenance specific
    status: '',
    priority: '',
    requestType: '',
    
    // Levy specific
    paymentStatus: '',
    quarter: '',
    year: '',
    
    // Unit specific
    unitType: '',
    hasOwner: '',
    minSize: '',
    maxSize: ''
  });
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchStats, setSearchStats] = useState({});

  // Advanced search function with complex queries
  const performSearch = async () => {
    setLoading(true);
    
    try {
      let query;
      let countQuery;
      
      switch (searchType) {
        case 'maintenance':
          // Complex maintenance search with full-text search and filters
          query = supabase
            .from('maintenance_requests')
            .select(`
              *,
              units (
                unit_number,
                unit_type,
                square_meters
              ),
              owners (
                first_name,
                last_name,
                email,
                phone
              )
            `);
          
          countQuery = supabase
            .from('maintenance_requests')
            .select('*', { count: 'exact', head: true });
          
          // Text search across multiple fields
          if (filters.searchTerm) {
            query = query.or(`description.ilike.%${filters.searchTerm}%,request_id.ilike.%${filters.searchTerm}%,location.ilike.%${filters.searchTerm}%`);
            countQuery = countQuery.or(`description.ilike.%${filters.searchTerm}%,request_id.ilike.%${filters.searchTerm}%,location.ilike.%${filters.searchTerm}%`);
          }
          
          // Status filter
          if (filters.status) {
            query = query.eq('status', filters.status);
            countQuery = countQuery.eq('status', filters.status);
          }
          
          // Priority filter
          if (filters.priority) {
            query = query.eq('priority', filters.priority);
            countQuery = countQuery.eq('priority', filters.priority);
          }
          
          // Request type filter
          if (filters.requestType) {
            query = query.eq('request_type', filters.requestType);
            countQuery = countQuery.eq('request_type', filters.requestType);
          }
          
          // Date range filter
          if (filters.dateFrom) {
            query = query.gte('created_at', filters.dateFrom);
            countQuery = countQuery.gte('created_at', filters.dateFrom);
          }
          if (filters.dateTo) {
            query = query.lte('created_at', filters.dateTo + 'T23:59:59');
            countQuery = countQuery.lte('created_at', filters.dateTo + 'T23:59:59');
          }
          
          break;
          
        case 'levy':
          // Advanced levy payment search
          query = supabase
            .from('levy_payments')
            .select(`
              *,
              units (
                unit_number,
                unit_type
              ),
              owners (
                first_name,
                last_name,
                email
              )
            `);
          
          countQuery = supabase
            .from('levy_payments')
            .select('*', { count: 'exact', head: true });
          
          // Payment status filter
          if (filters.paymentStatus) {
            query = query.eq('status', filters.paymentStatus);
            countQuery = countQuery.eq('status', filters.paymentStatus);
          }
          
          // Quarter and year filters
          if (filters.quarter) {
            query = query.eq('quarter', parseInt(filters.quarter));
            countQuery = countQuery.eq('quarter', parseInt(filters.quarter));
          }
          if (filters.year) {
            query = query.eq('year', parseInt(filters.year));
            countQuery = countQuery.eq('year', parseInt(filters.year));
          }
          
          // Date range for due dates
          if (filters.dateFrom) {
            query = query.gte('due_date', filters.dateFrom);
            countQuery = countQuery.gte('due_date', filters.dateFrom);
          }
          if (filters.dateTo) {
            query = query.lte('due_date', filters.dateTo);
            countQuery = countQuery.lte('due_date', filters.dateTo);
          }
          
          break;
          
        case 'units':
          // Complex unit search with owner information
          query = supabase
            .from('units')
            .select(`
              *,
              owners (
                first_name,
                last_name,
                email,
                phone,
                move_in_date
              )
            `);
          
          countQuery = supabase
            .from('units')
            .select('*', { count: 'exact', head: true });
          
          // Unit number search
          if (filters.searchTerm) {
            query = query.ilike('unit_number', `%${filters.searchTerm}%`);
            countQuery = countQuery.ilike('unit_number', `%${filters.searchTerm}%`);
          }
          
          // Unit type filter
          if (filters.unitType) {
            query = query.eq('unit_type', filters.unitType);
            countQuery = countQuery.eq('unit_type', filters.unitType);
          }
          
          // Size range filters
          if (filters.minSize) {
            query = query.gte('square_meters', parseInt(filters.minSize));
            countQuery = countQuery.gte('square_meters', parseInt(filters.minSize));
          }
          if (filters.maxSize) {
            query = query.lte('square_meters', parseInt(filters.maxSize));
            countQuery = countQuery.lte('square_meters', parseInt(filters.maxSize));
          }
          
          break;
      }
      
      // Execute queries
      const [dataResult, countResult] = await Promise.all([
        query.order('created_at', { ascending: false }).limit(50),
        countQuery
      ]);
      
      if (dataResult.error) throw dataResult.error;
      if (countResult.error) throw countResult.error;
      
      setResults(dataResult.data || []);
      setTotalResults(countResult.count || 0);
      
      // Calculate search statistics
      await calculateSearchStats(dataResult.data || []);
      
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate statistics from search results
  const calculateSearchStats = async (data) => {
    const stats = {};
    
    if (searchType === 'maintenance') {
      stats.byStatus = data.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});
      
      stats.byPriority = data.reduce((acc, item) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1;
        return acc;
      }, {});
      
      stats.avgResponseTime = calculateAverageResponseTime(data);
      
    } else if (searchType === 'levy') {
      stats.totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0);
      stats.paidAmount = data.filter(item => item.status === 'paid')
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      stats.collectionRate = stats.totalAmount > 0 ? 
        ((stats.paidAmount / stats.totalAmount) * 100) : 0;
        
    } else if (searchType === 'units') {
      stats.occupied = data.filter(unit => unit.owners && unit.owners.length > 0).length;
      stats.vacant = data.filter(unit => !unit.owners || unit.owners.length === 0).length;
      stats.avgSize = data.length > 0 ? data.reduce((sum, unit) => sum + (unit.square_meters || 0), 0) / data.length : 0;
    }
    
    setSearchStats(stats);
  };
  
  const calculateAverageResponseTime = (requests) => {
    const completed = requests.filter(r => r.status === 'completed' && r.completed_at);
    if (completed.length === 0) return 0;
    
    const totalHours = completed.reduce((sum, r) => {
      const created = new Date(r.created_at);
      const completedDate = new Date(r.completed_at);
      return sum + (completedDate - created) / (1000 * 60 * 60);
    }, 0);
    
    return Math.round(totalHours / completed.length);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      priority: '',
      requestType: '',
      paymentStatus: '',
      quarter: '',
      year: '',
      unitType: '',
      hasOwner: '',
      minSize: '',
      maxSize: ''
    });
    setResults([]);
    setTotalResults(0);
    setSearchStats({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <Layout title="Advanced Search">
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ color: '#003366', marginBottom: '2rem' }}>Advanced Search & Analytics</h1>
        
        {/* Search Type Selector */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Search Category</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { value: 'maintenance', label: 'Maintenance Requests' },
              { value: 'levy', label: 'Levy Payments' },
              { value: 'units', label: 'Units & Owners' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSearchType(option.value)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: searchType === option.value ? '#003366' : '#f8f9fa',
                  color: searchType === option.value ? 'white' : '#666',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Filters */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Search Filters</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Common filters */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Search Term
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder={searchType === 'maintenance' ? 'Description, ID, location...' : 
                           searchType === 'units' ? 'Unit number...' : 'Search...'}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
            </div>

            {/* Date filters */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
            </div>

            {/* Maintenance-specific filters */}
            {searchType === 'maintenance' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Request Type
                  </label>
                  <select
                    value={filters.requestType}
                    onChange={(e) => handleFilterChange('requestType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="repair">Repair</option>
                    <option value="replacement">Replacement</option>
                    <option value="inspection">Inspection</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </>
            )}

            {/* Levy-specific filters */}
            {searchType === 'levy' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Payment Status
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Quarter
                  </label>
                  <select
                    value={filters.quarter}
                    onChange={(e) => handleFilterChange('quarter', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">All Quarters</option>
                    <option value="1">Q1</option>
                    <option value="2">Q2</option>
                    <option value="3">Q3</option>
                    <option value="4">Q4</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">All Years</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
              </>
            )}

            {/* Unit-specific filters */}
            {searchType === 'units' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Unit Type
                  </label>
                  <select
                    value={filters.unitType}
                    onChange={(e) => handleFilterChange('unitType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Min Size (m²)
                  </label>
                  <input
                    type="number"
                    value={filters.minSize}
                    onChange={(e) => handleFilterChange('minSize', e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Max Size (m²)
                  </label>
                  <input
                    type="number"
                    value={filters.maxSize}
                    onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                    placeholder="999"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={performSearch}
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                background: '#003366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            
            <button
              onClick={clearFilters}
              style={{
                padding: '0.75rem 2rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Search Statistics */}
        {totalResults > 0 && (
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Search Results Analytics</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#003366' }}>
                  {totalResults}
                </span>
                <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                  results found
                </span>
              </div>
              
              {searchType === 'maintenance' && searchStats.avgResponseTime !== undefined && (
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#17a2b8' }}>
                    {searchStats.avgResponseTime}h
                  </span>
                  <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                    avg response time
                  </span>
                </div>
              )}
              
              {searchType === 'levy' && searchStats.collectionRate !== undefined && (
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                    {searchStats.collectionRate.toFixed(1)}%
                  </span>
                  <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                    collection rate
                  </span>
                </div>
              )}
              
              {searchType === 'units' && searchStats.avgSize !== undefined && (
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#6f42c1' }}>
                    {searchStats.avgSize.toFixed(0)}m²
                  </span>
                  <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                    average size
                  </span>
                </div>
              )}
            </div>

            {/* Breakdown charts */}
            {searchType === 'maintenance' && searchStats.byStatus && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(searchStats.byStatus).map(([status, count]) => (
                  <span key={status} style={{
                    background: status === 'completed' ? '#28a745' : 
                               status === 'pending' ? '#ffc107' :
                               status === 'in-progress' ? '#17a2b8' : '#dc3545',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {status}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {results.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: '#003366', 
              color: 'white', 
              padding: '1rem 1.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              Search Results ({totalResults} found, showing {Math.min(50, results.length)})
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {results.map((item, index) => (
                <div key={item.id || index} style={{
                  padding: '1rem 1.5rem',
                  borderBottom: index < results.length - 1 ? '1px solid #eee' : 'none',
                  background: index % 2 === 0 ? '#f8f9fa' : 'white'
                }}>
                  {searchType === 'maintenance' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: '#003366', fontSize: '1.1rem' }}>
                            {item.request_id} - Unit {item.units?.unit_number}
                          </div>
                          <div style={{ color: '#666', margin: '0.5rem 0' }}>
                            {item.description}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Created: {new Date(item.created_at).toLocaleDateString()} • 
                            Type: {item.request_type} • 
                            Location: {item.location}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{
                            background: item.priority === 'emergency' ? '#dc3545' :
                                       item.priority === 'high' ? '#fd7e14' :
                                       item.priority === 'normal' ? '#28a745' : '#6c757d',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {item.priority}
                          </span>
                          <span style={{
                            background: item.status === 'completed' ? '#28a745' :
                                       item.status === 'in-progress' ? '#17a2b8' :
                                       item.status === 'pending' ? '#ffc107' : '#dc3545',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {searchType === 'levy' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#003366', fontSize: '1.1rem' }}>
                            Unit {item.units?.unit_number} - Q{item.quarter}/{item.year}
                          </div>
                          <div style={{ color: '#666', margin: '0.5rem 0' }}>
                            {item.owners?.first_name} {item.owners?.last_name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Due: {new Date(item.due_date).toLocaleDateString()}
                            {item.paid_date && ` • Paid: ${new Date(item.paid_date).toLocaleDateString()}`}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#003366' }}>
                            {formatCurrency(item.amount)}
                          </div>
                          <span style={{
                            background: item.status === 'paid' ? '#28a745' :
                                       item.status === 'overdue' ? '#dc3545' : '#ffc107',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {searchType === 'units' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#003366', fontSize: '1.1rem' }}>
                            Unit {item.unit_number} ({item.unit_type})
                          </div>
                          <div style={{ color: '#666', margin: '0.5rem 0' }}>
                            {item.owners && item.owners.length > 0 ? (
                              <>
                                Owner: {item.owners[0].first_name} {item.owners[0].last_name}
                                <br />
                                Contact: {item.owners[0].email}
                                {item.owners[0].phone && ` • ${item.owners[0].phone}`}
                              </>
                            ) : (
                              <span style={{ color: '#dc3545', fontStyle: 'italic' }}>Vacant</span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#003366' }}>
                            {item.square_meters}m²
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            {item.parking_spaces} parking
                            {item.storage_unit && ' + storage'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && totalResults === 0 && results.length === 0 && filters.searchTerm && (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#666' }}>No results found</h3>
            <p>Try adjusting your search criteria or clearing some filters.</p>
          </div>
        )}

        {!loading && totalResults === 0 && results.length === 0 && !filters.searchTerm && (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#666' }}>Ready to search</h3>
            <p>Enter search criteria and click "Search" to find results.</p>
          </div>
        )}

        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <strong>🔍 Advanced Search:</strong> Full-text search, complex filtering, and real-time analytics powered by Supabase
        </div>
      </div>
    </Layout>
  );
}