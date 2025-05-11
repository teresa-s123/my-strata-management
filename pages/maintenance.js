import { useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Maintenance.module.css';

export default function Maintenance() {
  const [formData, setFormData] = useState({
    unitNumber: '',
    name: '',
    email: '',
    phone: '',
    requestType: 'repair',
    location: 'unit',
    description: '',
    preferredDate: '',
    accessInstructions: '',
    priority: 'normal',
    photos: null
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [errors, setErrors] = useState({});

  const [responseMessage, setResponseMessage] = useState('');
  const [expectedResponse, setExpectedResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypes = [
    { value: 'repair', label: 'Repair' },
    { value: 'replacement', label: 'Replacement' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const locations = [
    { value: 'unit', label: 'Within My Unit' },
    { value: 'common', label: 'Common Area' },
    { value: 'balcony', label: 'Balcony/Terrace' },
    { value: 'carpark', label: 'Car Parking' },
    { value: 'gym', label: 'Gym/Pool Area' },
    { value: 'entrance', label: 'Building Entrance' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    

    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.unitNumber) newErrors.unitNumber = 'Unit number is required';
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.description) newErrors.description = 'Description is required';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      

      const response = await fetch('/api/log-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit maintenance request');
      }
      
      const data = await response.json();
      

      setRequestId(data.requestId);
      setResponseMessage(data.message);
      setExpectedResponse(data.expectedResponse);
      

      setSubmitted(true);
      
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      alert(`There was an error submitting your request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setSubmitted(false);
    setRequestId('');
    setFormData({
      unitNumber: '',
      name: '',
      email: '',
      phone: '',
      requestType: 'repair',
      location: 'unit',
      description: '',
      preferredDate: '',
      accessInstructions: '',
      priority: 'normal',
      photos: null
    });
    setErrors({});
  };

  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Layout title="Maintenance Request">
      <div className={styles.container}>
        <h1 className={styles.heading}>Maintenance Request</h1>
        
        {!submitted ? (
          <>
            <div className={styles.instructions}>
              <h2>Submit a Maintenance Request</h2>
              <p>Please complete the form below to submit a maintenance request for your unit or common areas. Our building manager will attend to your request as soon as possible.</p>
              <p><strong>Note:</strong> For emergency issues like water leaks, electrical hazards, or security concerns, please also call the emergency contact number at <strong>(02) 9123 4567</strong>.</p>
            </div>
            
            <div className={styles.formContainer}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formSection}>
                  <h3>Contact Information</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="unitNumber">Unit Number *</label>
                      <input
                        type="text"
                        id="unitNumber"
                        name="unitNumber"
                        value={formData.unitNumber}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.unitNumber ? styles.error : ''}`}
                        placeholder="e.g. 101"
                      />
                      {errors.unitNumber && <span className={styles.errorText}>{errors.unitNumber}</span>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.name ? styles.error : ''}`}
                        placeholder="Enter your name"
                      />
                      {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.email ? styles.error : ''}`}
                        placeholder="Enter your email"
                      />
                      {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
                
                <div className={styles.formSection}>
                  <h3>Request Details</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="requestType">Request Type</label>
                      <select
                        id="requestType"
                        name="requestType"
                        value={formData.requestType}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        {requestTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="location">Location</label>
                      <select
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        {locations.map(location => (
                          <option key={location.value} value={location.value}>{location.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="description">Description of Issue *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
                      placeholder="Please describe the maintenance issue in detail"
                    ></textarea>
                    {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="preferredDate">Preferred Date (Optional)</label>
                      <input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        min={getToday()}
                        className={styles.input}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="priority">Priority Level</label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="accessInstructions">Access Instructions (Optional)</label>
                    <textarea
                      id="accessInstructions"
                      name="accessInstructions"
                      value={formData.accessInstructions}
                      onChange={handleChange}
                      rows="2"
                      className={styles.textarea}
                      placeholder="Provide instructions for accessing your unit if needed"
                    ></textarea>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="photos">Upload Photos (Optional)</label>
                    <input
                      type="file"
                      id="photos"
                      name="photos"
                      onChange={handleChange}
                      accept="image/*"
                      className={styles.fileInput}
                    />
                    <small>Upload photos of the issue (Max file size: 5MB)</small>
                  </div>
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.successContainer}>
            <div className={styles.successMessage}>
              <h2>Request Submitted Successfully!</h2>
              <p>{responseMessage || 'Your maintenance request has been submitted and will be reviewed by our building manager.'}</p>
              <p>Request ID: <strong>{requestId}</strong></p>
              <p>You will receive an email confirmation at <strong>{formData.email}</strong> with the details of your request.</p>
              {expectedResponse && <p>Expected response time: <strong>{expectedResponse}</strong></p>}
              
              <div className={styles.summaryBox}>
                <h3>Request Summary</h3>
                <div className={styles.summaryItem}>
                  <strong>Unit Number:</strong> {formData.unitNumber}
                </div>
                <div className={styles.summaryItem}>
                  <strong>Name:</strong> {formData.name}
                </div>
                <div className={styles.summaryItem}>
                  <strong>Request Type:</strong> {requestTypes.find(t => t.value === formData.requestType)?.label}
                </div>
                <div className={styles.summaryItem}>
                  <strong>Location:</strong> {locations.find(l => l.value === formData.location)?.label}
                </div>
                <div className={styles.summaryItem}>
                  <strong>Description:</strong> {formData.description}
                </div>
                <div className={styles.summaryItem}>
                  <strong>Priority:</strong> {priorities.find(p => p.value === formData.priority)?.label}
                </div>
                {formData.preferredDate && (
                  <div className={styles.summaryItem}>
                    <strong>Preferred Date:</strong> {formData.preferredDate}
                  </div>
                )}
              </div>
              
              <button onClick={handleNewRequest} className={styles.newRequestButton}>
                Submit Another Request
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}