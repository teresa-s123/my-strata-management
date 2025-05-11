import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/FormExample.module.css';

export default function FormExample() {
  const [getResults, setGetResults] = useState(null);
  const [postResults, setPostResults] = useState(null);
  const [postError, setPostError] = useState(null);

  // Handle form submission using GET method
  const handleGetSubmit = async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const category = formData.get('category');
    const limit = formData.get('limit');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (limit) queryParams.append('limit', limit);
    
    try {
      // Make GET request to the API
      const response = await fetch(`/api/example?${queryParams.toString()}`);
      const data = await response.json();
      
      // Update state with results
      setGetResults(data);
    } catch (error) {
      console.error('Error making GET request:', error);
    }
  };

  // Handle form submission using POST method
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostError(null);
    
    // Get form data
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const category = formData.get('category');
    const file = formData.get('file');
    
    try {
      // Make POST request to the API
      const response = await fetch('/api/example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          category,
          file: file || '/documents/example.pdf', // Default file path if none selected
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setPostError(data.message || 'An error occurred while processing your request');
        setPostResults(null);
      } else {
        // Update state with results
        setPostResults(data);
        setPostError(null);
      }
    } catch (error) {
      console.error('Error making POST request:', error);
      setPostError('Failed to submit the form. Please try again.');
    }
  };

  return (
    <Layout title="GET vs POST Example">
      <div className={styles.container}>
        <Head>
          <title>GET vs POST Form Example</title>
          <meta name="description" content="Example demonstrating GET and POST form submissions" />
        </Head>

        <h1 className={styles.heading}>GET vs POST Form Example</h1>
        
        <div className={styles.explanation}>
          <h2>Understanding GET and POST HTTP Methods</h2>
          <p>
            This page demonstrates the differences between GET and POST HTTP methods when submitting forms.
            Both methods are used to send data to a server, but they do so in different ways and are
            appropriate for different scenarios.
          </p>
        </div>
        
        <div className={styles.formGrid}>
          <div className={styles.formSection}>
            <h2>GET Method</h2>
            <div className={styles.methodExplanation}>
              <h3>Characteristics:</h3>
              <ul>
                <li>Data is sent as query parameters in the URL</li>
                <li>Visible in browser history and server logs</li>
                <li>Can be bookmarked and shared</li>
                <li>Limited to about 2048 characters</li>
                <li>Should be used for retrieving data only</li>
                <li>Cacheable by browsers</li>
              </ul>
              <h3>Best for:</h3>
              <ul>
                <li>Search queries</li>
                <li>Filtering data</li>
                <li>Navigation between pages</li>
                <li>Non-sensitive data retrieval</li>
              </ul>
            </div>
            
            <div className={styles.formCard}>
              <h3>GET Example: Document Search</h3>
              <form onSubmit={handleGetSubmit} method="get" className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="get-category">Document Category</label>
                  <select id="get-category" name="category" className={styles.select}>
                    <option value="">All Categories</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Finance">Finance</option>
                    <option value="Meeting Minutes">Meeting Minutes</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="get-limit">Result Limit</label>
                  <input 
                    type="number" 
                    id="get-limit" 
                    name="limit" 
                    min="1" 
                    max="50" 
                    defaultValue="5" 
                    className={styles.input} 
                  />
                </div>
                
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>Search Documents</button>
                </div>
              </form>
              
              <div className={styles.note}>
                <p><strong>Note:</strong> When you submit this form, observe the URL in the address bar. You'll see your form data appended as query parameters.</p>
              </div>
              
              {getResults && (
                <div className={styles.results}>
                  <h3>GET Results</h3>
                  <div className={styles.jsonResult}>
                    <pre>{JSON.stringify(getResults, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h2>POST Method</h2>
            <div className={styles.methodExplanation}>
              <h3>Characteristics:</h3>
              <ul>
                <li>Data is sent in the request body</li>
                <li>Not visible in the URL or browser history</li>
                <li>Cannot be bookmarked or cached</li>
                <li>No practical size limit (server dependent)</li>
                <li>Suitable for creating or updating data</li>
                <li>More secure for sensitive information</li>
              </ul>
              <h3>Best for:</h3>
              <ul>
                <li>Form submissions</li>
                <li>Uploading files</li>
                <li>Creating or updating resources</li>
                <li>Sending sensitive data</li>
              </ul>
            </div>
            
            <div className={styles.formCard}>
              <h3>POST Example: Add Document</h3>
              <form onSubmit={handlePostSubmit} method="post" className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="post-name">Document Name</label>
                  <input 
                    type="text" 
                    id="post-name" 
                    name="name" 
                    required 
                    className={styles.input} 
                    placeholder="Enter document name" 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="post-category">Document Category</label>
                  <select id="post-category" name="category" required className={styles.select}>
                    <option value="">Select a category</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Finance">Finance</option>
                    <option value="Meeting Minutes">Meeting Minutes</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="post-file">File Path</label>
                  <input 
                    type="text" 
                    id="post-file" 
                    name="file" 
                    className={styles.input} 
                    placeholder="/documents/example.pdf" 
                  />
                  <small>In a real app, this would be a file upload field</small>
                </div>
                
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>Add Document</button>
                </div>
              </form>
              
              <div className={styles.note}>
                <p><strong>Note:</strong> When you submit this form, the URL does not change because the data is sent in the request body, not in the URL.</p>
              </div>
              
              {postError && (
                <div className={styles.error}>
                  <p>{postError}</p>
                </div>
              )}
              
              {postResults && (
                <div className={styles.results}>
                  <h3>POST Results</h3>
                  <div className={styles.jsonResult}>
                    <pre>{JSON.stringify(postResults, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.summary}>
          <h2>Summary of Differences</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>GET</th>
                <th>POST</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data in</td>
                <td>URL query string</td>
                <td>Request body</td>
              </tr>
              <tr>
                <td>Visibility</td>
                <td>Visible in URL</td>
                <td>Not visible in URL</td>
              </tr>
              <tr>
                <td>Security</td>
                <td>Less secure</td>
                <td>More secure</td>
              </tr>
              <tr>
                <td>Caching</td>
                <td>Can be cached</td>
                <td>Not cached</td>
              </tr>
              <tr>
                <td>Bookmarking</td>
                <td>Can be bookmarked</td>
                <td>Cannot be bookmarked</td>
              </tr>
              <tr>
                <td>History</td>
                <td>Stored in browser history</td>
                <td>Not in browser history</td>
              </tr>
              <tr>
                <td>Data length</td>
                <td>Limited (2048 chars)</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Idempotent</td>
                <td>Yes</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Use case</td>
                <td>Data retrieval</td>
                <td>Data submission</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className={styles.httpStatusSection}>
          <h2>HTTP Status Codes</h2>
          <p>
            HTTP status codes are standardized responses used by servers to indicate the status of a request.
            They are grouped into five classes:
          </p>
          
          <div className={styles.statusGroups}>
            <div className={styles.statusGroup}>
              <h3>1xx: Informational</h3>
              <p>Request received, continuing process</p>
              <ul>
                <li><strong>100 Continue</strong>: Server has received the request headers</li>
                <li><strong>101 Switching Protocols</strong>: Server is switching protocols</li>
              </ul>
            </div>
            
            <div className={styles.statusGroup}>
              <h3>2xx: Success</h3>
              <p>Request successfully received, understood, and accepted</p>
              <ul>
                <li><strong>200 OK</strong>: Standard response for successful HTTP requests</li>
                <li><strong>201 Created</strong>: Request fulfilled and new resource created</li>
                <li><strong>204 No Content</strong>: Request processed, no content to return</li>
              </ul>
            </div>
            
            <div className={styles.statusGroup}>
              <h3>3xx: Redirection</h3>
              <p>Further action needs to be taken to complete the request</p>
              <ul>
                <li><strong>301 Moved Permanently</strong>: Resource has been permanently moved</li>
                <li><strong>302 Found</strong>: Resource is temporarily located elsewhere</li>
                <li><strong>304 Not Modified</strong>: Resource has not been modified since last request</li>
              </ul>
            </div>
            
            <div className={styles.statusGroup}>
              <h3>4xx: Client Error</h3>
              <p>Request contains bad syntax or cannot be fulfilled</p>
              <ul>
                <li><strong>400 Bad Request</strong>: Server could not understand the request</li>
                <li><strong>401 Unauthorized</strong>: Authentication is required</li>
                <li><strong>403 Forbidden</strong>: Server understands but refuses the request</li>
                <li><strong>404 Not Found</strong>: Resource could not be found</li>
                <li><strong>405 Method Not Allowed</strong>: Request method not supported</li>
              </ul>
            </div>
            
            <div className={styles.statusGroup}>
              <h3>5xx: Server Error</h3>
              <p>Server failed to fulfill a valid request</p>
              <ul>
                <li><strong>500 Internal Server Error</strong>: Generic server error</li>
                <li><strong>502 Bad Gateway</strong>: Server received an invalid response</li>
                <li><strong>503 Service Unavailable</strong>: Server temporarily unavailable</li>
              </ul>
            </div>
          </div>
          
          <div className={styles.redirectSection}>
            <h3>Implementing Redirects in Edge Functions</h3>
            <p>
              In serverless edge functions, redirects can be implemented by returning a Response object with an appropriate status code (301/302) and Location header:
            </p>
            <pre className={styles.codeBlock}>
{`// Redirect in an Edge Function
export default function handler(req) {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/new-location'
    }
  });
}`}
            </pre>
            <p>
              In a regular Next.js API route, you can use the res.redirect() method:
            </p>
            <pre className={styles.codeBlock}>
{`// Redirect in a Next.js API route
export default function handler(req, res) {
  res.redirect(302, '/new-location');
}`}
            </pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}