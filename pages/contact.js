import { useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    unitNumber: '',
    subject: '',
    message: '',
    category: 'general'
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'maintenance', label: 'Maintenance Issue' },
    { value: 'noise', label: 'Noise Complaint' },
    { value: 'committee', label: 'Committee Matter' },
    { value: 'bylaw', label: 'By-law Question' },
    { value: 'levies', label: 'Levy Payment' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // In a real app, this would submit the form data to a server
    // For now, we'll simulate a successful submission
    
    // Generate a reference number
    const newReferenceNumber = 'REF' + Math.floor(100000 + Math.random() * 900000);
    setReferenceNumber(newReferenceNumber);
    
    // Show success message
    setSubmitted(true);
  };

  return (
    <Layout title="Contact Us">
      <div className={styles.container}>
        <h1 className={styles.heading}>Contact Us</h1>
        
        <div className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <h2>Get in Touch</h2>
              <p>We're here to help with any questions or concerns regarding Oceanview Apartments.</p>
              
              <div className={styles.contactMethods}>
                <div className={styles.contactMethod}>
                  <div className={styles.methodIcon}>📞</div>
                  <div className={styles.methodDetails}>
                    <h3>Phone</h3>
                    <p>Building Manager: (02) 9123 4567</p>
                    <p>Emergency: 0400 123 456</p>
                    <p className={styles.hours}>Available 9AM - 5PM, Monday to Friday</p>
                  </div>
                </div>
                
                <div className={styles.contactMethod}>
                  <div className={styles.methodIcon}>✉️</div>
                  <div className={styles.methodDetails}>
                    <h3>Email</h3>
                    <p>General Inquiries: info@oceanviewapts.com.au</p>
                    <p>Maintenance: maintenance@oceanviewapts.com.au</p>
                    <p>Strata Manager: manager@oceanviewapts.com.au</p>
                  </div>
                </div>
                
                <div className={styles.contactMethod}>
                  <div className={styles.methodIcon}>📍</div>
                  <div className={styles.methodDetails}>
                    <h3>Address</h3>
                    <p>Oceanview Apartments</p>
                    <p>123 Beach Road</p>
                    <p>Bondi Beach, NSW 2026</p>
                    <p>Australia</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.emergencyInfo}>
                <h3>Emergency Contact</h3>
                <p>For urgent issues outside of business hours, please call our emergency hotline at <strong>0400 123 456</strong>.</p>
                <p>For life-threatening emergencies, please call <strong>000</strong>.</p>
              </div>
            </div>
            
            <div className={styles.mapContainer}>
              <h3>Find Us</h3>
              <div className={styles.map}>
                {/* In a real app, this would be a Google Maps or other map integration */}
                <img 
                  src="/images/map-placeholder.png" 
                  alt="Map of Oceanview Apartments location"
                  className={styles.mapImage}
                />
              </div>
              <a 
                href="https://maps.google.com/?q=Bondi+Beach,+NSW+2026" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.directionsLink}
              >
                Get Directions
              </a>
            </div>
          </div>
          
          <div className={styles.contactForm}>
            {!submitted ? (
              <div className={styles.formCard}>
                <h2>Send a Message</h2>
                <p>Fill out the form below and our team will get back to you as soon as possible.</p>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
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
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="unitNumber">Unit Number (if applicable)</label>
                      <input
                        type="text"
                        id="unitNumber"
                        name="unitNumber"
                        value={formData.unitNumber}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="e.g. 101"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="category">Inquiry Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`${styles.input} ${errors.subject ? styles.error : ''}`}
                      placeholder="Enter subject"
                    />
                    {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className={`${styles.textarea} ${errors.message ? styles.error : ''}`}
                      placeholder="Enter your message here"
                    ></textarea>
                    {errors.message && <span className={styles.errorText}>{errors.message}</span>}
                  </div>
                  
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton}>
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>✓</div>
                <h2>Message Sent Successfully!</h2>
                <p>Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
                
                <div className={styles.referenceBox}>
                  <p>Your reference number:</p>
                  <div className={styles.referenceNumber}>{referenceNumber}</div>
                  <p>Please keep this number for future correspondence.</p>
                </div>
                
                <p>A confirmation email has been sent to <strong>{formData.email}</strong>.</p>
                
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      unitNumber: '',
                      subject: '',
                      message: '',
                      category: 'general'
                    });
                  }}
                  className={styles.newMessageButton}
                >
                  Send Another Message
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          
          <div className={styles.faqItems}>
            <div className={styles.faqItem}>
              <h3>How do I report a maintenance issue?</h3>
              <p>You can report maintenance issues through our <a href="/maintenance">online maintenance request form</a>, by emailing maintenance@oceanviewapts.com.au, or by calling the building manager during business hours.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>When are strata committee meetings held?</h3>
              <p>Strata committee meetings are typically held on the first Tuesday of each month at 6:30 PM in the building's meeting room. All owners are welcome to attend as observers.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>How do I pay my strata levies?</h3>
              <p>Strata levies can be paid through our <a href="/levies">online payment portal</a>, by direct deposit, or by check. For more information, please visit the Levies page.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>Where can I find the building's by-laws?</h3>
              <p>The building's by-laws are available in the <a href="/documents">Documents section</a> of our website. You will need to log in to access these documents.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}