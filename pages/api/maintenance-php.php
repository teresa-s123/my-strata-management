<?php
// pages/api/maintenance-php.php
// PHP-powered maintenance status checker for MyStrataManagement

// Set headers for proper response
header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Sample maintenance requests database (in real app, this would be from your database)
$maintenanceRequests = [
    'MR12345' => [
        'requestId' => 'MR12345',
        'unitNumber' => '101',
        'ownerName' => 'John Smith',
        'email' => 'john@example.com',
        'phone' => '(02) 9876 5432',
        'requestType' => 'repair',
        'location' => 'unit',
        'category' => 'plumbing',
        'description' => 'Leaking faucet in bathroom sink. Water drips continuously even when turned off completely.',
        'priority' => 'normal',
        'status' => 'pending',
        'submittedDate' => '2025-05-30 10:30:00',
        'expectedCompletion' => '2025-06-02',
        'assignedTechnician' => null,
        'estimatedCost' => '$85.00',
        'accessInstructions' => 'Spare key with building manager'
    ],
    'MR54321' => [
        'requestId' => 'MR54321',
        'unitNumber' => '205',
        'ownerName' => 'Emily Johnson',
        'email' => 'emily@example.com',
        'phone' => '(02) 9123 4567',
        'requestType' => 'inspection',
        'location' => 'common',
        'category' => 'electrical',
        'description' => 'Flickering lights in hallway near unit 205. Occurs frequently in the evenings.',
        'priority' => 'high',
        'status' => 'in-progress',
        'submittedDate' => '2025-05-29 14:22:00',
        'expectedCompletion' => '2025-05-31',
        'assignedTechnician' => 'Mike Torres - ElectroFix Services',
        'estimatedCost' => '$150.00',
        'accessInstructions' => 'Common area - no access required'
    ],
    'MR99887' => [
        'requestId' => 'MR99887',
        'unitNumber' => '103',
        'ownerName' => 'Michael Brown',
        'email' => 'michael@example.com',
        'phone' => '(02) 9555 0123',
        'requestType' => 'repair',
        'location' => 'unit',
        'category' => 'heating_cooling',
        'description' => 'Air conditioning unit not cooling properly. Temperature remains high despite being set to 18°C.',
        'priority' => 'high',
        'status' => 'completed',
        'submittedDate' => '2025-05-27 09:15:00',
        'expectedCompletion' => '2025-05-29',
        'assignedTechnician' => 'Sarah Chen - CoolAir Solutions',
        'estimatedCost' => '$240.00',
        'completedDate' => '2025-05-28 16:30:00',
        'accessInstructions' => 'Call 30 minutes before arrival'
    ],
    'MR11223' => [
        'requestId' => 'MR11223',
        'unitNumber' => '302',
        'ownerName' => 'Sarah Wilson',
        'email' => 'sarah@example.com',
        'phone' => '(02) 9444 7890',
        'requestType' => 'emergency',
        'location' => 'common',
        'category' => 'safety',
        'description' => 'Gym treadmill making loud grinding noise and belt appears to be slipping. Safety concern.',
        'priority' => 'emergency',
        'status' => 'scheduled',
        'submittedDate' => '2025-05-30 12:00:00',
        'expectedCompletion' => '2025-05-30',
        'assignedTechnician' => 'Emergency Repair Team',
        'estimatedCost' => '$320.00',
        'accessInstructions' => 'Gym access code: 1234'
    ]
];

// Function to get status color class
function getStatusClass($status) {
    switch ($status) {
        case 'pending': return 'status-pending';
        case 'in-progress': return 'status-in-progress';
        case 'scheduled': return 'status-scheduled';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

// Function to get priority display
function getPriorityDisplay($priority) {
    $classes = [
        'low' => 'priority-low',
        'normal' => 'priority-normal', 
        'high' => 'priority-high',
        'emergency' => 'priority-emergency'
    ];
    $class = $classes[$priority] ?? 'priority-normal';
    return "<span class='$class'>" . ucfirst($priority) . "</span>";
}

// Function to format date nicely
function formatDate($dateString) {
    return date('F j, Y \a\t g:i A', strtotime($dateString));
}

// Function to calculate time ago
function timeAgo($dateString) {
    $time = time() - strtotime($dateString);
    
    if ($time < 60) return 'Less than a minute ago';
    if ($time < 3600) return floor($time/60) . ' minutes ago';
    if ($time < 86400) return floor($time/3600) . ' hours ago';
    if ($time < 2592000) return floor($time/86400) . ' days ago';
    
    return formatDate($dateString);
}

// Get request ID from URL parameter
$requestId = isset($_GET['requestId']) ? trim($_GET['requestId']) : '';

// If specific request ID is provided, show detailed view
if (!empty($requestId)) {
    if (isset($maintenanceRequests[$requestId])) {
        $request = $maintenanceRequests[$requestId];
        $statusClass = getStatusClass($request['status']);
        
        echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Request {$request['requestId']} - Status Details | Oceanview Apartments</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f7fa; 
            min-height: 100vh; 
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            overflow: hidden; 
        }
        .header { 
            background: linear-gradient(135deg, #003366 0%, #0070f3 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .content { 
            padding: 30px; 
        }
        .status-badge { 
            display: inline-block; 
            padding: 8px 20px; 
            border-radius: 25px; 
            font-weight: bold; 
            text-transform: uppercase; 
            font-size: 0.9em; 
            margin-top: 10px;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-in-progress { background: #d4edda; color: #155724; }
        .status-scheduled { background: #cce7ff; color: #004085; }
        .status-completed { background: #d1ecf1; color: #0c5460; }
        .detail-row { 
            display: flex; 
            padding: 15px 0; 
            border-bottom: 1px solid #eee; 
        }
        .detail-label { 
            font-weight: bold; 
            width: 180px; 
            color: #003366; 
            flex-shrink: 0;
        }
        .detail-value { 
            flex: 1; 
        }
        .priority-emergency { 
            background: #f8d7da; 
            color: #721c24; 
            padding: 3px 8px; 
            border-radius: 4px; 
            font-weight: bold; 
        }
        .priority-high { color: #dc3545; font-weight: bold; }
        .priority-normal { color: #ffc107; font-weight: bold; }
        .priority-low { color: #28a745; font-weight: bold; }
        .back-btn { 
            background: #6c757d; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            display: inline-block; 
            margin-top: 20px; 
            transition: background-color 0.2s;
        }
        .back-btn:hover {
            background: #5a6268;
        }
        .timeline { 
            margin-top: 30px; 
        }
        .timeline-item { 
            padding: 15px; 
            margin-bottom: 10px; 
            border-left: 4px solid #0070f3; 
            background: #f8f9fa; 
            border-radius: 0 5px 5px 0; 
        }
        .php-note {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            border-left: 4px solid #0070f3;
        }
        .php-note h4 {
            margin-top: 0;
            color: #003366;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔍 Request Details</h1>
            <h2>{$request['requestId']}</h2>
            <div class='status-badge {$statusClass}'>" . ucfirst(str_replace('-', ' ', $request['status'])) . "</div>
        </div>
        <div class='content'>
            <div class='detail-row'>
                <div class='detail-label'>Unit Number:</div>
                <div class='detail-value'>{$request['unitNumber']}</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Owner Name:</div>
                <div class='detail-value'>{$request['ownerName']}</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Contact Email:</div>
                <div class='detail-value'>{$request['email']}</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Phone:</div>
                <div class='detail-value'>{$request['phone']}</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Request Type:</div>
                <div class='detail-value'>" . ucfirst($request['requestType']) . "</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Location:</div>
                <div class='detail-value'>" . ucfirst($request['location']) . "</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Category:</div>
                <div class='detail-value'>" . ucfirst(str_replace('_', ' ', $request['category'])) . "</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Priority:</div>
                <div class='detail-value'>" . getPriorityDisplay($request['priority']) . "</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Description:</div>
                <div class='detail-value'>{$request['description']}</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Submitted:</div>
                <div class='detail-value'>" . formatDate($request['submittedDate']) . " (" . timeAgo($request['submittedDate']) . ")</div>
            </div>
            <div class='detail-row'>
                <div class='detail-label'>Expected Completion:</div>
                <div class='detail-value'>" . date('F j, Y', strtotime($request['expectedCompletion'])) . "</div>
            </div>";
            
        if ($request['assignedTechnician']) {
            echo "<div class='detail-row'>
                <div class='detail-label'>Assigned Technician:</div>
                <div class='detail-value'>{$request['assignedTechnician']}</div>
            </div>";
        }
        
        echo "<div class='detail-row'>
                <div class='detail-label'>Estimated Cost:</div>
                <div class='detail-value'>{$request['estimatedCost']}</div>
            </div>";
            
        if ($request['accessInstructions']) {
            echo "<div class='detail-row'>
                <div class='detail-label'>Access Instructions:</div>
                <div class='detail-value'>{$request['accessInstructions']}</div>
            </div>";
        }
        
        if (isset($request['completedDate'])) {
            echo "<div class='detail-row'>
                <div class='detail-label'>Completed:</div>
                <div class='detail-value'>" . formatDate($request['completedDate']) . "</div>
            </div>";
        }
        
        echo "<div class='timeline'>
                <h3>📋 Status Timeline</h3>";
                
        // Generate timeline based on status
        switch ($request['status']) {
            case 'completed':
                echo "<div class='timeline-item'>✅ <strong>Completed</strong> - Work finished successfully on " . formatDate($request['completedDate']) . "</div>";
                echo "<div class='timeline-item'>🔧 <strong>In Progress</strong> - Technician working on issue</div>";
                echo "<div class='timeline-item'>👥 <strong>Assigned</strong> - " . $request['assignedTechnician'] . " assigned to request</div>";
                echo "<div class='timeline-item'>📝 <strong>Received</strong> - Request submitted and logged</div>";
                break;
            case 'in-progress':
                echo "<div class='timeline-item'>🔧 <strong>In Progress</strong> - " . $request['assignedTechnician'] . " currently working on issue</div>";
                echo "<div class='timeline-item'>👥 <strong>Assigned</strong> - Technician assigned to request</div>";
                echo "<div class='timeline-item'>📝 <strong>Received</strong> - Request submitted and logged</div>";
                break;
            case 'scheduled':
                echo "<div class='timeline-item'>📅 <strong>Scheduled</strong> - Work scheduled for " . date('F j, Y', strtotime($request['expectedCompletion'])) . "</div>";
                echo "<div class='timeline-item'>👥 <strong>Assigned</strong> - " . $request['assignedTechnician'] . " assigned</div>";
                echo "<div class='timeline-item'>📝 <strong>Received</strong> - Request submitted and logged</div>";
                break;
            default:
                echo "<div class='timeline-item'>📝 <strong>Received</strong> - Request submitted and awaiting review</div>";
        }
        
        echo "</div>
            <a href='/php-maintenance' class='back-btn'>← Back to Status Portal</a>
            
            <div class='php-note'>
                <h4>💡 PHP Implementation Note</h4>
                <p><strong>Technical Achievement:</strong> This detailed view is generated entirely by PHP running on Vercel's serverless platform. The data processing, HTML generation, and dynamic content creation demonstrate PHP's server-side capabilities integrated with your modern Next.js web stack.</p>
                <p><strong>Real-world Application:</strong> In a production environment, this would connect to your database and send email notifications to building managers and residents.</p>
            </div>
        </div>
    </div>
</body>
</html>";
        
    } else {
        // Request ID not found
        echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Request Not Found | Oceanview Apartments</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f7fa; 
            min-height: 100vh; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 8px; 
            padding: 40px; 
            text-align: center; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        .error-icon { 
            font-size: 4em; 
            margin-bottom: 20px; 
        }
        h1 { 
            color: #dc3545; 
            margin-bottom: 20px; 
        }
        .back-btn { 
            background: #0070f3; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            display: inline-block; 
            margin-top: 20px; 
        }
        .sample-ids {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: left;
        }
        .sample-ids ul {
            margin: 10px 0;
        }
        .sample-ids li {
            margin: 5px 0;
        }
        .sample-id {
            font-family: monospace;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='error-icon'>❌</div>
        <h1>Request Not Found</h1>
        <p>The maintenance request ID '<strong>" . htmlspecialchars($requestId) . "</strong>' could not be found in our system.</p>
        <p>Please check the request ID and try again, or contact the building manager for assistance.</p>
        <a href='/php-maintenance' class='back-btn'>← Back to Status Portal</a>
        
        <div class='sample-ids'>
            <h4>Sample Request IDs to try:</h4>
            <ul>
                <li><span class='sample-id'>MR12345</span> - Pending plumbing repair (Unit 101)</li>
                <li><span class='sample-id'>MR54321</span> - In-progress electrical inspection (Unit 205)</li>
                <li><span class='sample-id'>MR99887</span> - Completed AC repair (Unit 103)</li>
                <li><span class='sample-id'>MR11223</span> - Emergency gym equipment (Unit 302)</li>
            </ul>
            <p><em>These are sample requests for demonstration purposes.</em></p>
        </div>
    </div>
</body>
</html>";
    }
    exit();
}

// If no specific request ID, redirect back to main status page
if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($requestId)) {
    header('Location: /php-maintenance');
    exit();
}

// Handle POST requests (for future form submissions)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <title>PHP Form Handler | Oceanview Apartments</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f7fa; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .success { 
            background: #d4edda; 
            color: #155724; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
            border: 1px solid #c3e6cb;
        }
        .back-btn { 
            background: #0070f3; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            display: inline-block; 
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='success'>
            <h2>✅ PHP Processing Successful!</h2>
            <p>This demonstrates PHP successfully running on Vercel and processing form data.</p>
        </div>
        <h3>Received POST Data:</h3>
        <pre>" . print_r($_POST, true) . "</pre>
        <a href='/php-maintenance' class='back-btn'>← Back to Status Portal</a>
    </div>
</body>
</html>";
    exit();
}
?>