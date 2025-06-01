// pages/reports.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function Reports() {
  const [reportType, setReportType] = useState('maintenance');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Set default date range (last 3 months)
  useEffect(() => {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    
    setDateRange({
      startDate: threeMonthsAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  }, []);

  // Generate comprehensive reports with complex joins and aggregations
  const generateReport = async () => {
    setLoading(true);
    setReportData(null);

    try {
      let data = {};

      switch (reportType) {
        case 'maintenance':
          data = await generateMaintenanceReport();
          break;
        case 'financial':
          data = await generateFinancialReport();
          break;
        case 'occupancy':
          data = await generateOccupancyReport();
          break;
        case 'comprehensive':
          data = await generateComprehensiveReport();
          break;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMaintenanceReport = async () => {
    // Complex query with multiple joins and aggregations
    const { data: maintenanceRequests, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        units (
          unit_number,
          unit_type,
          square_meters,
          floor_level
        ),
        owners (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .gte('created_at', dateRange.startDate)
      .lte('created_at', dateRange.endDate + 'T23:59:59')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Advanced analytics calculations
    const analytics = {
      totalRequests: maintenanceRequests.length,
      byStatus: groupBy(maintenanceRequests, 'status'),
      byPriority: groupBy(maintenanceRequests, 'priority'),
      byType: groupBy(maintenanceRequests, 'request_type'),
      byLocation: groupBy(maintenanceRequests, 'location'),
      byMonth: groupByMonth(maintenanceRequests, 'created_at'),
      responseTimeAnalysis: calculateResponseTimes(maintenanceRequests),
      unitAnalysis: analyzeByUnit(maintenanceRequests),
      costAnalysis: calculateEstimatedCosts(maintenanceRequests)
    };

    return {
      requests: maintenanceRequests,
      analytics,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      generatedAt: new Date().toISOString()
    };
  };

  const generateFinancialReport = async () => {
    // Complex financial queries with joins
    const [levyData, maintenanceData] = await Promise.all([
      supabase
        .from('levy_payments')
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
            email
          )
        `)
        .gte('due_date', dateRange.startDate)
        .lte('due_date', dateRange.endDate),
      
      supabase
        .from('maintenance_requests')
        .select(`
          *,
          units (unit_number, unit_type)
        `)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate)
        .not('estimated_cost', 'is', null)
    ]);

    if (levyData.error) throw levyData.error;
    if (maintenanceData.error) throw maintenanceData.error;

    // Financial analytics
    const levyAnalytics = {
      totalLevied: levyData.data.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalCollected: levyData.data.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
      totalOutstanding: levyData.data.filter(p => p.status !== 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
      collectionRate: 0,
      byQuarter: groupByQuarter(levyData.data),
      overdueAnalysis: analyzeOverduePayments(levyData.data),
      unitPerformance: analyzeUnitPaymentPerformance(levyData.data)
    };

    levyAnalytics.collectionRate = levyAnalytics.totalLevied > 0 ? 
      (levyAnalytics.totalCollected / levyAnalytics.totalLevied) * 100 : 0;

    const maintenanceAnalytics = {
      totalEstimatedCost: maintenanceData.data.reduce((sum, r) => sum + (r.estimated_cost || 0), 0),
      averageCostPerRequest: maintenanceData.data.length > 0 ? 
        maintenanceData.data.reduce((sum, r) => sum + (r.estimated_cost || 0), 0) / maintenanceData.data.length : 0,
      costByType: groupAndSum(maintenanceData.data, 'request_type', 'estimated_cost'),
      costByPriority: groupAndSum(maintenanceData.data, 'priority', 'estimated_cost')
    };

    return {
      levy: {
        data: levyData.data,
        analytics: levyAnalytics
      },
      maintenance: {
        data: maintenanceData.data,
        analytics: maintenanceAnalytics
      },
      summary: {
        totalIncome: levyAnalytics.totalCollected,
        totalExpenses: maintenanceAnalytics.totalEstimatedCost,
        netPosition: levyAnalytics.totalCollected - maintenanceAnalytics.totalEstimatedCost
      },
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      generatedAt: new Date().toISOString()
    };
  };

  const generateOccupancyReport = async () => {
    const { data: units, error } = await supabase
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
      `)
      .order('unit_number');

    if (error) throw error;

    const analytics = {
      totalUnits: units.length,
      occupiedUnits: units.filter(u => u.owners && u.owners.length > 0).length,
      vacantUnits: units.filter(u => !u.owners || u.owners.length === 0).length,
      occupancyRate: 0,
      byType: groupBy(units, 'unit_type'),
      byFloor: groupBy(units, 'floor_level'),
      sizeAnalysis: analyzeSizeDistribution(units),
      moveInTrends: analyzeMoveInTrends(units)
    };

    analytics.occupancyRate = analytics.totalUnits > 0 ? 
      (analytics.occupiedUnits / analytics.totalUnits) * 100 : 0;

    return {
      units,
      analytics,
      generatedAt: new Date().toISOString()
    };
  };

  const generateComprehensiveReport = async () => {
    // Generate all reports and combine
    const [maintenance, financial, occupancy] = await Promise.all([
      generateMaintenanceReport(),
      generateFinancialReport(),
      generateOccupancyReport()
    ]);

    // Cross-analysis between different data sets
    const crossAnalysis = {
      maintenanceVsOccupancy: analyzeMaintenanceVsOccupancy(maintenance.requests, occupancy.units),
      financialHealth: calculateFinancialHealth(financial),
      riskAssessment: assessPropertyRisks(maintenance.requests, financial.levy.analytics, occupancy.analytics)
    };

    return {
      maintenance,
      financial,
      occupancy,
      crossAnalysis,
      executiveSummary: generateExecutiveSummary(maintenance, financial, occupancy, crossAnalysis),
      generatedAt: new Date().toISOString()
    };
  };

  // Utility functions for data processing
  const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key] || 'Unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  };

  const groupByMonth = (array, dateField) => {
    return array.reduce((groups, item) => {
      const date = new Date(item[dateField]);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      groups[month] = (groups[month] || 0) + 1;
      return groups;
    }, {});
  };

  const groupByQuarter = (array) => {
    return array.reduce((groups, item) => {
      const quarter = `Q${item.quarter}/${item.year}`;
      groups[quarter] = {
        count: (groups[quarter]?.count || 0) + 1,
        amount: (groups[quarter]?.amount || 0) + (item.amount || 0),
        paid: (groups[quarter]?.paid || 0) + (item.status === 'paid' ? 1 : 0)
      };
      return groups;
    }, {});
  };

  const groupAndSum = (array, groupKey, sumKey) => {
    return array.reduce((groups, item) => {
      const group = item[groupKey] || 'Unknown';
      groups[group] = (groups[group] || 0) + (item[sumKey] || 0);
      return groups;
    }, {});
  };

  const calculateResponseTimes = (requests) => {
    const completed = requests.filter(r => r.status === 'completed' && r.completed_at);
    
    if (completed.length === 0) {
      return { average: 0, median: 0, fastest: 0, slowest: 0 };
    }

    const times = completed.map(r => {
      const created = new Date(r.created_at);
      const completed = new Date(r.completed_at);
      return (completed - created) / (1000 * 60 * 60); // hours
    });

    times.sort((a, b) => a - b);

    return {
      average: Math.round(times.reduce((sum, time) => sum + time, 0) / times.length),
      median: Math.round(times[Math.floor(times.length / 2)]),
      fastest: Math.round(times[0]),
      slowest: Math.round(times[times.length - 1]),
      total: completed.length
    };
  };

  const analyzeByUnit = (requests) => {
    const unitStats = requests.reduce((stats, request) => {
      const unitNumber = request.units?.unit_number || 'Unknown';
      if (!stats[unitNumber]) {
        stats[unitNumber] = {
          count: 0,
          byPriority: {},
          byStatus: {},
          unitType: request.units?.unit_type
        };
      }
      stats[unitNumber].count++;
      stats[unitNumber].byPriority[request.priority] = (stats[unitNumber].byPriority[request.priority] || 0) + 1;
      stats[unitNumber].byStatus[request.status] = (stats[unitNumber].byStatus[request.status] || 0) + 1;
      return stats;
    }, {});

    // Find units with most requests
    const sortedUnits = Object.entries(unitStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10);

    return {
      totalUnitsWithRequests: Object.keys(unitStats).length,
      topRequesters: sortedUnits,
      averageRequestsPerUnit: requests.length / Object.keys(unitStats).length
    };
  };

  const calculateEstimatedCosts = (requests) => {
    const withCosts = requests.filter(r => r.estimated_cost);
    
    return {
      totalEstimated: withCosts.reduce((sum, r) => sum + (r.estimated_cost || 0), 0),
      averageCost: withCosts.length > 0 ? withCosts.reduce((sum, r) => sum + (r.estimated_cost || 0), 0) / withCosts.length : 0,
      costByType: groupAndSum(withCosts, 'request_type', 'estimated_cost'),
      emergencyCosts: withCosts.filter(r => r.priority === 'emergency').reduce((sum, r) => sum + (r.estimated_cost || 0), 0)
    };
  };

  const analyzeOverduePayments = (payments) => {
    const overdue = payments.filter(p => {
      return p.status !== 'paid' && new Date(p.due_date) < new Date();
    });

    return {
      count: overdue.length,
      totalAmount: overdue.reduce((sum, p) => sum + (p.amount || 0), 0),
      averageDaysOverdue: overdue.reduce((sum, p) => {
        const daysDiff = Math.floor((new Date() - new Date(p.due_date)) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }, 0) / (overdue.length || 1),
      byUnit: groupBy(overdue.map(p => ({ unit_number: p.units?.unit_number })), 'unit_number')
    };
  };

  const analyzeUnitPaymentPerformance = (payments) => {
    const unitStats = payments.reduce((stats, payment) => {
      const unitNumber = payment.units?.unit_number || 'Unknown';
      if (!stats[unitNumber]) {
        stats[unitNumber] = { total: 0, paid: 0, amount: 0, paidAmount: 0 };
      }
      stats[unitNumber].total++;
      stats[unitNumber].amount += payment.amount || 0;
      if (payment.status === 'paid') {
        stats[unitNumber].paid++;
        stats[unitNumber].paidAmount += payment.amount || 0;
      }
      return stats;
    }, {});

    // Calculate payment rates
    Object.keys(unitStats).forEach(unit => {
      const stats = unitStats[unit];
      stats.paymentRate = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;
    });

    return unitStats;
  };

  const analyzeSizeDistribution = (units) => {
    const sizes = units.map(u => u.square_meters).filter(s => s);
    sizes.sort((a, b) => a - b);

    return {
      min: sizes[0] || 0,
      max: sizes[sizes.length - 1] || 0,
      average: sizes.reduce((sum, size) => sum + size, 0) / (sizes.length || 1),
      median: sizes[Math.floor(sizes.length / 2)] || 0
    };
  };

  const analyzeMoveInTrends = (units) => {
    const moveIns = units
      .filter(u => u.owners && u.owners[0]?.move_in_date)
      .map(u => u.owners[0].move_in_date);

    return groupByMonth(moveIns.map(date => ({ created_at: date })), 'created_at');
  };

  const analyzeMaintenanceVsOccupancy = (requests, units) => {
    const occupiedUnits = units.filter(u => u.owners && u.owners.length > 0);
    const vacantUnits = units.filter(u => !u.owners || u.owners.length === 0);

    const occupiedRequests = requests.filter(r => 
      occupiedUnits.some(u => u.unit_number === r.units?.unit_number)
    );
    
    const vacantRequests = requests.filter(r => 
      vacantUnits.some(u => u.unit_number === r.units?.unit_number)
    );

    return {
      occupiedUnitsRequests: occupiedRequests.length,
      vacantUnitsRequests: vacantRequests.length,
      requestsPerOccupiedUnit: occupiedRequests.length / (occupiedUnits.length || 1),
      requestsPerVacantUnit: vacantRequests.length / (vacantUnits.length || 1)
    };
  };

  const calculateFinancialHealth = (financial) => {
    const { levy, maintenance, summary } = financial;
    
    return {
      score: Math.min(100, Math.max(0, (summary.netPosition / levy.analytics.totalLevied) * 100 + 50)),
      collectionEfficiency: levy.analytics.collectionRate,
      maintenanceRatio: levy.analytics.totalLevied > 0 ? 
        (maintenance.analytics.totalEstimatedCost / levy.analytics.totalLevied) * 100 : 0,
      cashFlow: summary.netPosition,
      riskLevel: summary.netPosition < 0 ? 'High' : 
                 levy.analytics.collectionRate < 85 ? 'Medium' : 'Low'
    };
  };

  const assessPropertyRisks = (maintenance, levyAnalytics, occupancyAnalytics) => {
    const risks = [];

    if (levyAnalytics.collectionRate < 85) {
      risks.push({
        type: 'Financial',
        level: 'High',
        description: 'Low levy collection rate may impact building maintenance',
        metric: `${levyAnalytics.collectionRate.toFixed(1)}% collection rate`
      });
    }

    if (occupancyAnalytics.occupancyRate < 80) {
      risks.push({
        type: 'Occupancy',
        level: 'Medium',
        description: 'High vacancy rate may affect financial stability',
        metric: `${occupancyAnalytics.occupancyRate.toFixed(1)}% occupancy rate`
      });
    }

    const emergencyRequests = maintenance.filter(r => r.priority === 'emergency').length;
    if (emergencyRequests > 5) {
      risks.push({
        type: 'Maintenance',
        level: 'High',
        description: 'High number of emergency maintenance requests',
        metric: `${emergencyRequests} emergency requests`
      });
    }

    return risks;
  };

  const generateExecutiveSummary = (maintenance, financial, occupancy, crossAnalysis) => {
    return {
      keyMetrics: {
        totalUnits: occupancy.analytics.totalUnits,
        occupancyRate: occupancy.analytics.occupancyRate,
        collectionRate: financial.levy.analytics.collectionRate,
        maintenanceRequests: maintenance.analytics.totalRequests,
        financialPosition: financial.summary.netPosition
      },
      highlights: [
        `${occupancy.analytics.occupancyRate.toFixed(1)}% occupancy rate across ${occupancy.analytics.totalUnits} units`,
        `${financial.levy.analytics.collectionRate.toFixed(1)}% levy collection rate`,
        `${maintenance.analytics.totalRequests} maintenance requests processed`,
        `${crossAnalysis.riskAssessment.length} risk factors identified`
      ],
      recommendations: generateRecommendations(crossAnalysis.riskAssessment, financial.levy.analytics, maintenance.analytics)
    };
  };

  const generateRecommendations = (risks, levyAnalytics, maintenanceAnalytics) => {
    const recommendations = [];

    if (levyAnalytics.collectionRate < 90) {
      recommendations.push('Implement automated payment reminders to improve levy collection');
    }

    if (maintenanceAnalytics.byPriority.emergency > 3) {
      recommendations.push('Consider preventive maintenance program to reduce emergency requests');
    }

    if (risks.length > 2) {
      recommendations.push('Schedule quarterly risk assessment meetings with building committee');
    }

    return recommendations;
  };

  // Export functions
  const exportToCSV = (data, filename) => {
    setGenerating(true);
    
    let csvContent = '';
    
    if (reportType === 'maintenance') {
      csvContent = generateMaintenanceCSV(data.requests);
    } else if (reportType === 'financial') {
      csvContent = generateFinancialCSV(data);
    } else if (reportType === 'occupancy') {
      csvContent = generateOccupancyCSV(data.units);
    }
    
    downloadFile(csvContent, `${filename}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    setGenerating(false);
  };

  const exportToPDF = async (data, filename) => {
    setGenerating(true);
    
    // Generate HTML content for PDF
    const htmlContent = generateReportHTML(data);
    
    // In a real implementation, you would use a library like jsPDF or send to backend
    console.log('PDF export would be implemented here');
    alert('PDF export functionality would be implemented with a PDF library');
    
    setGenerating(false);
  };

  const generateMaintenanceCSV = (requests) => {
    const headers = ['Request ID', 'Unit Number', 'Owner Name', 'Description', 'Status', 'Priority', 'Type', 'Created Date', 'Completed Date', 'Estimated Cost'];
    
    const rows = requests.map(r => [
      r.request_id,
      r.units?.unit_number || '',
      `${r.owners?.first_name || ''} ${r.owners?.last_name || ''}`.trim(),
      `"${r.description?.replace(/"/g, '""') || ''}"`,
      r.status,
      r.priority,
      r.request_type,
      new Date(r.created_at).toLocaleDateString(),
      r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '',
      r.estimated_cost || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateFinancialCSV = (data) => {
    const headers = ['Unit Number', 'Owner Name', 'Quarter', 'Year', 'Amount', 'Status', 'Due Date', 'Paid Date', 'Late Fee'];
    
    const rows = data.levy.data.map(p => [
      p.units?.unit_number || '',
      `${p.owners?.first_name || ''} ${p.owners?.last_name || ''}`.trim(),
      p.quarter,
      p.year,
      p.amount,
      p.status,
      new Date(p.due_date).toLocaleDateString(),
      p.paid_date ? new Date(p.paid_date).toLocaleDateString() : '',
      p.late_fee || 0
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateOccupancyCSV = (units) => {
    const headers = ['Unit Number', 'Unit Type', 'Size (m²)', 'Floor', 'Owner Name', 'Email', 'Phone', 'Move In Date', 'Parking Spaces'];
    
    const rows = units.map(u => [
      u.unit_number,
      u.unit_type,
      u.square_meters,
      u.floor_level,
      u.owners?.[0] ? `${u.owners[0].first_name} ${u.owners[0].last_name}` : 'Vacant',
      u.owners?.[0]?.email || '',
      u.owners?.[0]?.phone || '',
      u.owners?.[0]?.move_in_date ? new Date(u.owners[0].move_in_date).toLocaleDateString() : '',
      u.parking_spaces
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateReportHTML = (data) => {
    // This would generate a comprehensive HTML report
    return `
      <html>
        <head><title>Strata Management Report</title></head>
        <body>
          <h1>Strata Management Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <!-- Report content would be generated here -->
        </body>
      </html>
    `;
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <Layout title="Reports & Analytics">
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ color: '#003366', marginBottom: '2rem' }}>Advanced Reports & Data Export</h1>
        
        {/* Report Configuration */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Report Configuration</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              >
                <option value="maintenance">Maintenance Analysis</option>
                <option value="financial">Financial Report</option>
                <option value="occupancy">Occupancy Report</option>
                <option value="comprehensive">Comprehensive Report</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
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
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px'
                }}
              />
            </div>
          </div>

          <button
            onClick={generateReport}
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
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>

        {/* Report Results */}
        {reportData && (
          <>
            {/* Export Options */}
            <div style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Export Options</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => exportToCSV(reportData, reportType)}
                  disabled={generating}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    opacity: generating ? 0.6 : 1
                  }}
                >
                  Export to CSV
                </button>
                <button
                  onClick={() => exportToPDF(reportData, reportType)}
                  disabled={generating}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    opacity: generating ? 0.6 : 1
                  }}
                >
                  Export to PDF
                </button>
              </div>
            </div>

            {/* Report Display */}
            {reportType === 'comprehensive' && reportData.executiveSummary && (
              <div style={{ 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#003366' }}>Executive Summary</h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {Object.entries(reportData.executiveSummary.keyMetrics).map(([key, value]) => (
                    <div key={key} style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#003366' }}>
                        {typeof value === 'number' ? 
                          (key.includes('Rate') ? `${value.toFixed(1)}%` : 
                           key.includes('Position') || key.includes('Cost') ? formatCurrency(value) : 
                           value) : value}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4>Key Highlights</h4>
                  <ul>
                    {reportData.executiveSummary.highlights.map((highlight, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{highlight}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4>Recommendations</h4>
                  <ul>
                    {reportData.executiveSummary.recommendations.map((rec, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Analytics Dashboard */}
            {reportData.analytics && (
              <div style={{ 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#003366' }}>Analytics Dashboard</h3>
                
                {reportType === 'maintenance' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                      <h4>By Status</h4>
                      {Object.entries(reportData.analytics.byStatus).map(([status, count]) => (
                        <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>{status}:</span>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <h4>Response Times</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Average:</span>
                        <strong>{reportData.analytics.responseTimeAnalysis.average}h</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Fastest:</span>
                        <strong>{reportData.analytics.responseTimeAnalysis.fastest}h</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Slowest:</span>
                        <strong>{reportData.analytics.responseTimeAnalysis.slowest}h</strong>
                      </div>
                    </div>
                  </div>
                )}

                {reportType === 'financial' && reportData.summary && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#e8f5e8', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                        {formatCurrency(reportData.summary.totalIncome)}
                      </div>
                      <div>Total Income</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#ffe8e8', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                        {formatCurrency(reportData.summary.totalExpenses)}
                      </div>
                      <div>Total Expenses</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: reportData.summary.netPosition >= 0 ? '#e8f5e8' : '#ffe8e8', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: reportData.summary.netPosition >= 0 ? '#28a745' : '#dc3545' }}>
                        {formatCurrency(reportData.summary.netPosition)}
                      </div>
                      <div>Net Position</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
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
          <strong>📊 Advanced Analytics:</strong> Complex data processing, cross-table analysis, and professional reporting powered by Supabase
        </div>
      </div>
    </Layout>
  );
}