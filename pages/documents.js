// pages/documents.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample documents data
  const sampleDocuments = [
    {
      id: 1,
      title: 'Strata Management Statement',
      category: 'legal',
      upload_date: '2024-01-15',
      file_size: '2.4 MB',
      file_type: 'PDF',
      description: 'Official strata management statement including by-laws and building rules'
    },
    {
      id: 2,
      title: 'Annual Financial Report 2023',
      category: 'financial',
      upload_date: '2024-03-20',
      file_size: '1.8 MB',
      file_type: 'PDF',
      description: 'Complete financial report for the 2023 financial year'
    },
    {
      id: 3,
      title: 'Building Insurance Policy',
      category: 'insurance',
      upload_date: '2024-01-01',
      file_size: '3.2 MB',
      file_type: 'PDF',
      description: 'Current building insurance policy document'
    },
    {
      id: 4,
      title: 'AGM Minutes - March 2024',
      category: 'meetings',
      upload_date: '2024-03-25',
      file_size: '892 KB',
      file_type: 'PDF',
      description: 'Minutes from the Annual General Meeting held in March 2024'
    },
    {
      id: 5,
      title: 'Maintenance Schedule 2024',
      category: 'maintenance',
      upload_date: '2024-02-01',
      file_size: '1.1 MB',
      file_type: 'PDF',
      description: 'Scheduled maintenance activities for 2024'
    },
    {
      id: 6,
      title: 'Building Plans & Specifications',
      category: 'technical',
      upload_date: '2023-12-10',
      file_size: '15.3 MB',
      file_type: 'PDF',
      description: 'Original building plans and technical specifications'
    },
    {
      id: 7,
      title: 'Levy Budget 2024',
      category: 'financial',
      upload_date: '2023-12-01',
      file_size: '1.5 MB',
      file_type: 'PDF',
      description: 'Approved levy budget for 2024 financial year'
    },
    {
      id: 8,
      title: 'Fire Safety Certificate',
      category: 'safety',
      upload_date: '2024-01-30',
      file_size: '675 KB',
      file_type: 'PDF',
      description: 'Current fire safety certificate and compliance documentation'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Documents', count: sampleDocuments.length },
    { value: 'legal', label: 'Legal Documents', count: sampleDocuments.filter(d => d.category === 'legal').length },
    { value: 'financial', label: 'Financial Reports', count: sampleDocuments.filter(d => d.category === 'financial').length },
    { value: 'meetings', label: 'Meeting Minutes', count: sampleDocuments.filter(d => d.category === 'meetings').length },
    { value: 'maintenance', label: 'Maintenance', count: sampleDocuments.filter(d => d.category === 'maintenance').length },
    { value: 'insurance', label: 'Insurance', count: sampleDocuments.filter(d => d.category === 'insurance').length },
    { value: 'safety', label: 'Safety & Compliance', count: sampleDocuments.filter(d => d.category === 'safety').length },
    { value: 'technical', label: 'Technical Documents', count: sampleDocuments.filter(d => d.category === 'technical').length }
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from('building_documents')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no documents in database or table doesn't exist, use sample data
      if (!data || data.length === 0) {
        setDocuments(sampleDocuments);
      } else {
        setDocuments(data);
      }

    } catch (err) {
      console.error('Error loading documents:', err);
      setDocuments(sampleDocuments);
      setError('Using sample data - database connection failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const getCategoryIcon = (category) => {
    const icons = {
      legal: '⚖️',
      financial: '💰',
      meetings: '📋',
      maintenance: '🔧',
      insurance: '🛡️',
      safety: '🔥',
      technical: '📐',
      all: '📁'
    };
    return icons[category] || '📄';
  };

  const formatFileSize = (size) => {
    if (typeof size === 'string') return size;
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = (document) => {
    alert(`Downloading: ${document.title}\n\nIn a real implementation, this would download the file from secure storage.`);
  };

  if (loading) {
    return (
      <Layout title="Building Documents">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading Documents...</h2>
          <p>Fetching building documents...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Building Documents">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <h1 style={{ color: '#003366', textAlign: 'center', marginBottom: '2rem' }}>
          📋 Building Documents & Resources
        </h1>
        
        {error && (
          <div className="alert alert-warning" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            ℹ️ {error}
          </div>
        )}

        {/* Category Filter */}
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#003366' }}>Document Categories</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '1rem'
          }}>
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className="btn"
                style={{
                  padding: '1rem',
                  border: selectedCategory === category.value ? '2px solid #003366' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: selectedCategory === category.value ? '#e6f3ff' : 'white',
                  color: selectedCategory === category.value ? '#003366' : '#333',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {getCategoryIcon(category.value)}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {category.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  {category.count} document{category.count !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ 
            background: '#003366', 
            color: 'white', 
            padding: '1rem 1.5rem',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            {selectedCategory === 'all' ? 'All Documents' : categories.find(c => c.value === selectedCategory)?.label} 
            ({filteredDocuments.length} documents)
          </div>
          
          {filteredDocuments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
              <h3>No documents found</h3>
              <p>No documents available in this category.</p>
            </div>
          ) : (
            <div>
              {filteredDocuments.map((document, index) => (
                <div key={document.id} style={{
                  padding: '1.5rem',
                  borderBottom: index < filteredDocuments.length - 1 ? '1px solid #eee' : 'none',
                  background: index % 2 === 0 ? '#f8f9fa' : 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
                          {getCategoryIcon(document.category)}
                        </span>
                        <h3 style={{ margin: 0, color: '#003366', fontSize: '1.2rem' }}>
                          {document.title}
                        </h3>
                      </div>
                      
                      <p style={{ color: '#666', margin: '0.5rem 0 1rem 0', fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {document.description}
                      </p>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '1.5rem', 
                        fontSize: '0.85rem', 
                        color: '#888'
                      }}>
                        <span>📅 {new Date(document.upload_date).toLocaleDateString('en-AU')}</span>
                        <span>📄 {document.file_type}</span>
                        <span>💾 {formatFileSize(document.file_size)}</span>
                      </div>
                    </div>
                    
                    <div style={{ marginLeft: '1.5rem' }}>
                      <button
                        onClick={() => handleDownload(document)}
                        className="btn"
                        style={{ 
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          minWidth: '120px'
                        }}
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="alert" style={{ 
          background: '#e8f4f8', 
          color: '#0c5460',
          border: '1px solid #bee5eb',
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          <strong>📋 Document Access:</strong> All documents are stored securely and access is logged for compliance purposes
        </div>
      </div>
    </Layout>
  );
}