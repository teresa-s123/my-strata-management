// pages/reports.js
import { useState } from 'react';
import Layout from '../components/Layout';

export default function Reports() {
  const [reportType, setReportType] = useState('maintenance');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'maintenance', label: 'Maintenance Report', icon: '🔧' },
    { value: 'financial', label: 'Financial Report', icon: '💰' },
    { value: 'occupancy', label: 'Occupancy Report', icon: '🏠' },
    { value: 'comprehensive', label: 'Comprehensive Report', icon: '📊' }
  ];

  const generateReport = async () => {
    setGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const reportData = generateSampleData(reportType);
      downloadCSV(reportData, reportType);
      setGenerating(false);
    }, 2000);
  };

  const generateSampleData = (type) => {
    switch (type) {
      case 'maintenance':
        return {
          headers: ['Request ID', 'Unit', 'Description', 'Status', 'Priority', 'Created Date'],
          rows: [
            ['MR12345', '304', 'Kitchen tap leaking', 'Pending', 'Normal', '2024-11-15'],
            ['MR12346', '507', 'Air conditioning repair', 'In Progress', 'High', '2024-11-14'],
            ['MR12347', '201', 'Bathroom light fixture', 'Completed', 'Low', '2024-11-13']
          ]
        };
      case 'financial':
        return {
          headers: ['Unit', 'Owner', 'Quarter', 'Amount', 'Status', 'Due Date'],
          rows: [
            ['201', 'John Smith', 'Q4/2024', '$2,500', 'Paid', '2024-12-01'],
            ['304', 'Jane Doe', 'Q4/2024', '$2,200', 'Pending', '2024-12-01'],
            ['507', 'Bob Wilson', 'Q4/2024', '$2,800', 'Paid', '2024-12-01']
          ]
        };
      case 'occupancy':
        return {
          headers: ['Unit', 'Type', 'Size (m²)', 'Owner', 'Occupied', 'Parking'],
          rows: [
            ['201', 'Apartment', '85', 'John Smith', 'Yes', '1'],
            ['304', 'Apartment', '92', 'Jane Doe', 'Yes', '1'],
            ['507', 'Penthouse', '120', 'Bob Wilson', 'Yes', '2']
          ]
        };
      case 'comprehensive':
        return {
          headers: ['Category', 'Total', 'Pending', 'Completed', 'Amount', 'Status'],
          rows: [
            ['Maintenance', '12', '3', '5', 'N/A', 'Active'],
            ['Levy Collection', '48', '2', '46', '$220,000', 'Good'],
            ['Occupancy', '48', '3', '45', 'N/A', 'Excellent']
          ]
        };
      default:
        return { headers: [], rows: [] };
    }
  };

  const downloadCSV = (data, filename) => {
    const csvContent = [data.headers, ...data.rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getThreeMonthsAgo = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  };

  return (
    <Layout title="Reports & Analytics">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <h1 style={{ color: '#003366', textAlign: 'center', marginBottom: '2rem' }}>
          📊 Reports & Analytics
        </h1>
        
        {/* Report Type Selection */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#003366' }}>Select Report Type</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem'
          }}>
            {reportTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setReportType(type.value)}
                className="btn"
                style={{
                  padding: '1.5rem',
                  border: reportType === type.value ? '2px solid #003366' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: reportType === type.value ? '#e6f3ff' : 'white',
                  color: reportType === type.value ? '#003366' : '#333',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {type.icon}
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  {type.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Configuration */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#003366' }}>Report Configuration</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate || getThreeMonthsAgo()}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate || getToday()}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={generating}
            className="btn"
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              opacity: generating ? 0.6 : 1
            }}
          >
            {generating ? '⏳ Generating Report...' : '📄 Generate & Download Report'}
          </button>
        </div>

        {/* Report Preview */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#003366' }}>
            {reportTypes.find(r => r.value === reportType)?.icon} {reportTypes.find(r => r.value === reportType)?.label} Preview
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {generateSampleData(reportType).headers.map((header, index) => (
                    <th key={index} style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {generateSampleData(reportType).rows.slice(0, 3).map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} style={{ padding: '0.75rem' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '6px',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            <strong>Note:</strong> This is sample data for demonstration. In a real implementation, 
            this would generate reports from your actual database records.
          </div>
        </div>

        <div style={{ 
          background: '#e8f4f8', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#0c5460',
          border: '1px solid #bee5eb'
        }}>
          <strong>📊 Professional Reporting:</strong> Generate comprehensive reports for committee meetings, 
          compliance, and strategic planning
        </div>
      </div>
    </Layout>
  );
}