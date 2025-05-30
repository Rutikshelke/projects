const swaggerDoc = require('swagger-jsdoc');
require("dotenv").config({ path: ".env" });

const isDevelopment = process.env.NODE_ENV === 'development';

const allowedOrigins = isDevelopment
    ? ["http://localhost:3002", "http://localhost:3002"]
    : process.env.ACCESS_CONTROL_ALLOW_ORIGIN
        ? process.env.ACCESS_CONTROL_ALLOW_ORIGIN.split(",").map(origin => origin.trim())
        : [];

// Pick the first origin for Swagger UI (Swagger UI `servers` only takes one base URL)
const serverUrl = allowedOrigins[0] || 'http://localhost:3002';

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Wallet API Documentation",
            version: "1.0.0",
            description: "Documentation for your APIs",
        },
        servers: [
            {
                url: serverUrl,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    name: "session-token",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    in: "header",
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

const swaggerDocument = swaggerDoc(options);

// Enhanced Custom CSS for modern Swagger UI
const customCSS = `
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Root Variables */
    :root {
        --primary-color: #2563eb;
        --primary-dark: #1d4ed8;
        --secondary-color: #64748b;
        --success-color: #10b981;
        --warning-color: #f59e0b;
        --danger-color: #ef4444;
        --dark-bg: #0f172a;
        --light-bg: #f8fafc;
        --border-color: #e2e8f0;
        --text-primary: #1e293b;
        --text-secondary: #64748b;
        --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    /* Global Styles */
    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        margin: 0;
    }

    /* Main Container */
    .swagger-ui {
        background: white;
        border-radius: 12px;
        margin: 20px;
        box-shadow: var(--shadow);
        overflow: hidden;
        position: relative;
    }

    /* Custom Header */
    .swagger-ui::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-color), var(--success-color), var(--warning-color), var(--danger-color));
    }

    /* Top Bar Styling */
    .swagger-ui .topbar {
        background: var(--dark-bg);
        padding: 16px 24px;
        border-bottom: 1px solid var(--border-color);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .swagger-ui .topbar-wrapper {
        max-width: none;
    }

    .swagger-ui .topbar .download-url-wrapper {
        display: none;
    }

    /* Custom Logo */
    .swagger-ui .topbar-wrapper img {
        height: 45px;
        width: auto;
        content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQ1IiB2aWV3Qm94PSIwIDAgMTgwIDQ1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPHN0eWxlPi5hIHsgZm9udC1mYW1pbHk6IEludGVyLCBzYW5zLXNlcmlmOyBmb250LXNpemU6IDE4cHg7IGZvbnQtd2VpZ2h0OiA3MDA7IGZpbGw6ICNmZmZmZmY7IH0gLmIgeyBmaWxsOiAjMjU2M2ViOyB9PC9zdHlsZT4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQ1IiByeD0iOCIgZmlsbD0iIzBmMTcyYSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIyLjUiIHI9IjgiIGNsYXNzPSJiIi8+Cjx0ZXh0IHg9IjQwIiB5PSIyOCIgY2xhc3M9ImEiPldBTExFVCBBUEk8L3RleHQ+Cjwvc3ZnPgo=');
    }

    /* Info Section */
    .swagger-ui .info {
        padding: 32px 24px;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom: 1px solid var(--border-color);
    }

    .swagger-ui .info .title {
        color: var(--text-primary);
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 12px;
        background: linear-gradient(135deg, var(--primary-color), var(--success-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .swagger-ui .info .description {
        color: var(--text-secondary);
        font-size: 1.1rem;
        line-height: 1.6;
        max-width: 600px;
    }

    /* Main Content */
    .swagger-ui .wrapper {
        padding: 24px;
    }

    /* Operation Blocks */
    .swagger-ui .opblock {
        border: 1px solid var(--border-color);
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }

    .swagger-ui .opblock:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }

    .swagger-ui .opblock .opblock-summary {
        padding: 16px 20px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .swagger-ui .opblock.opblock-get .opblock-summary {
        background: linear-gradient(135deg, var(--success-color), #059669);
        color: white;
    }

    .swagger-ui .opblock.opblock-post .opblock-summary {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        color: white;
    }

    .swagger-ui .opblock.opblock-put .opblock-summary {
        background: linear-gradient(135deg, var(--warning-color), #d97706);
        color: white;
    }

    .swagger-ui .opblock.opblock-delete .opblock-summary {
        background: linear-gradient(135deg, var(--danger-color), #dc2626);
        color: white;
    }

    .swagger-ui .opblock.opblock-patch .opblock-summary {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        color: white;
    }

    /* Operation Summary Text */
    .swagger-ui .opblock-summary-method {
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 6px 12px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.2);
        margin-right: 12px;
    }

    .swagger-ui .opblock-summary-path {
        font-weight: 500;
        font-size: 1.1rem;
        font-family: 'Fira Code', monospace;
    }

    .swagger-ui .opblock-summary-description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
        margin-top: 8px;
    }

    /* Expandable Content */
    .swagger-ui .opblock-body {
        padding: 24px;
        background: #fafbfc;
    }

    /* Parameters */
    .swagger-ui .parameters-container {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        border: 1px solid var(--border-color);
    }

    .swagger-ui .parameter__name {
        font-weight: 600;
        color: var(--text-primary);
    }

    .swagger-ui .parameter__type {
        color: var(--primary-color);
        font-weight: 500;
    }

    /* Try it out button */
    .swagger-ui .btn.try-out__btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .swagger-ui .btn.try-out__btn:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
    }

    /* Execute button */
    .swagger-ui .btn.execute {
        background: var(--success-color);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .swagger-ui .btn.execute:hover {
        background: #059669;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    }

    /* Response section */
    .swagger-ui .responses-wrapper {
        background: white;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--border-color);
        margin-top: 16px;
    }

    .swagger-ui .response-col_status {
        font-weight: 600;
    }

    /* Schemas */
    .swagger-ui .model-container {
        background: white;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        margin: 16px 0;
    }

    .swagger-ui .model-box {
        background: #f8fafc;
        padding: 16px;
    }

    /* Auth section */
    .swagger-ui .auth-wrapper {
        background: white;
        border-radius: 8px;
        padding: 20px;
        margin: 16px 0;
        border: 1px solid var(--border-color);
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: var(--light-bg);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background: var(--secondary-color);
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .swagger-ui {
            margin: 10px;
            border-radius: 8px;
        }
        
        .swagger-ui .info {
            padding: 20px 16px;
        }
        
        .swagger-ui .info .title {
            font-size: 2rem;
        }
        
        .swagger-ui .wrapper {
            padding: 16px;
        }
        
        .swagger-ui .opblock .opblock-summary {
            padding: 12px 16px;
        }
        
        .swagger-ui .opblock-summary-path {
            font-size: 1rem;
            word-break: break-all;
        }
    }

    /* Filter input */
    .swagger-ui .filter-container {
        padding: 16px 24px;
        background: var(--light-bg);
        border-bottom: 1px solid var(--border-color);
    }

    .swagger-ui .filter .operation-filter-input {
        border: 2px solid var(--border-color);
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 1rem;
        width: 100%;
        max-width: 400px;
        transition: all 0.3s ease;
    }

    .swagger-ui .filter .operation-filter-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    /* Highlight */
    .swagger-ui .highlight-code {
        background: var(--dark-bg);
        color: #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        font-family: 'Fira Code', 'Consolas', monospace;
    }
`;

// Dashboard-style sidebar CSS
const dashboardSidebarCSS = `
    /* Dashboard Sidebar Styles */
    .dashboard-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        width: 280px;
        height: 100vh;
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        color: white;
        z-index: 1000;
        overflow-y: auto;
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
        transition: transform 0.3s ease;
    }

    .dashboard-sidebar-header {
        padding: 24px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(37, 99, 235, 0.1);
    }

    .dashboard-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
    }

    .dashboard-logo-icon {
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
    }

    .dashboard-logo-text {
        font-size: 1.4rem;
        font-weight: 700;
        color: white;
    }

    .dashboard-subtitle {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0;
    }

    .dashboard-nav {
        padding: 24px 0;
    }

    .nav-section {
        margin-bottom: 32px;
    }

    .nav-section-title {
        font-size: 0.75rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 0 20px 8px;
        margin: 0;
    }

    .nav-items {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .nav-item {
        margin: 2px 0;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.3s ease;
        border-left: 3px solid transparent;
        font-weight: 500;
    }

    .nav-link:hover {
        background: rgba(255, 255, 255, 0.08);
        color: white;
        border-left-color: var(--primary-color);
        padding-left: 24px;
    }

    .nav-link.active {
        background: rgba(37, 99, 235, 0.15);
        color: white;
        border-left-color: var(--primary-color);
        font-weight: 600;
    }

    .nav-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }

    .nav-text {
        flex: 1;
    }

    .nav-badge {
        background: var(--primary-color);
        color: white;
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 600;
    }

    /* Dashboard Stats */
    .dashboard-stats {
        padding: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: auto;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        font-size: 0.85rem;
    }

    .stat-label {
        color: rgba(255, 255, 255, 0.6);
    }

    .stat-value {
        color: white;
        font-weight: 600;
    }

    /* Mobile Toggle */
    .mobile-toggle {
        display: none;
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1001;
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        transition: all 0.3s ease;
    }

    .mobile-toggle:hover {
        background: var(--primary-dark);
        transform: translateY(-2px);
    }

    /* Adjust main content */
    .swagger-ui {
        margin-left: 280px;
        transition: margin-left 0.3s ease;
    }

    /* Mobile Responsiveness */
    @media (max-width: 1024px) {
        .dashboard-sidebar {
            transform: translateX(-100%);
        }
        
        .dashboard-sidebar.mobile-open {
            transform: translateX(0);
        }
        
        .swagger-ui {
            margin-left: 0;
        }
        
        .mobile-toggle {
            display: block;
        }
    }

    /* Custom Scrollbar for Sidebar */
    .dashboard-sidebar::-webkit-scrollbar {
        width: 6px;
    }

    .dashboard-sidebar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }

    .dashboard-sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .dashboard-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    /* Enhanced Main Content */
    .swagger-ui .wrapper {
        max-width: none;
        padding: 24px 32px;
    }

    /* Dashboard Header Bar */
    .dashboard-header {
        background: white;
        padding: 16px 32px;
        border-bottom: 1px solid var(--border-color);
        margin-left: 280px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 99;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .dashboard-header h1 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.5rem;
        font-weight: 600;
    }

    .dashboard-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .dashboard-search {
        position: relative;
    }

    .dashboard-search input {
        padding: 8px 12px 8px 36px;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        font-size: 0.9rem;
        width: 250px;
        transition: all 0.3s ease;
    }

    .dashboard-search input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .dashboard-search::before {
        content: "🔍";
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
    }

    @media (max-width: 1024px) {
        .dashboard-header {
            margin-left: 0;
            padding-left: 60px;
        }
        
        .dashboard-search input {
            width: 200px;
        }
    }

    @media (max-width: 768px) {
        .dashboard-header {
            padding: 12px 16px 12px 60px;
        }
        
        .dashboard-search {
            display: none;
        }
        
        .dashboard-header h1 {
            font-size: 1.2rem;
        }
    }
`;

// JavaScript for dashboard functionality
const dashboardJS = `
    window.addEventListener('DOMContentLoaded', function() {
        // Create dashboard header
        const header = document.createElement('div');
        header.className = 'dashboard-header';
        header.innerHTML = \`
            <h1>API Documentation</h1>
            <div class="dashboard-actions">
                <div class="dashboard-search">
                    <input type="text" placeholder="Search endpoints..." id="endpoint-search">
                </div>
            </div>
        \`;

        // Create dashboard sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'dashboard-sidebar';
        sidebar.innerHTML = \`
            <div class="dashboard-sidebar-header">
                <div class="dashboard-logo">
                    <div class="dashboard-logo-icon">W</div>
                    <div>
                        <div class="dashboard-logo-text">Wallet API</div>
                        <p class="dashboard-subtitle">Documentation Hub</p>
                    </div>
                </div>
            </div>
            
            <nav class="dashboard-nav">
                <div class="nav-section">
                    <h3 class="nav-section-title">Overview</h3>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="#overview" class="nav-link active">
                                <span class="nav-icon">📊</span>
                                <span class="nav-text">Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#getting-started" class="nav-link">
                                <span class="nav-icon">🚀</span>
                                <span class="nav-text">Getting Started</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-section-title">Authentication</h3>
                    <ul class="nav-items">
                        <li class="nav-item">
                            <a href="#auth" class="nav-link">
                                <span class="nav-icon">🔐</span>
                                <span class="nav-text">Authentication</span>
                                <span class="nav-badge">JWT</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-section-title">Endpoints</h3>
                    <ul class="nav-items" id="endpoint-nav">
                        <li class="nav-item">
                            <a href="#users" class="nav-link">
                                <span class="nav-icon">👥</span>
                                <span class="nav-text">Users</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#wallet" class="nav-link">
                                <span class="nav-icon">💰</span>
                                <span class="nav-text">Wallet</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#transactions" class="nav-link">
                                <span class="nav-icon">💳</span>
                                <span class="nav-text">Transactions</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="#reports" class="nav-link">
                                <span class="nav-icon">📈</span>
                                <span class="nav-text">Reports</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
            
            <div class="dashboard-stats">
                <div class="stat-item">
                    <span class="stat-label">Total Endpoints</span>
                    <span class="stat-value" id="endpoint-count">-</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Version</span>
                    <span class="stat-value">v1.0.0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Last Updated</span>
                    <span class="stat-value">\${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        \`;

        // Create mobile toggle
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-toggle';
        mobileToggle.innerHTML = '☰';

        // Insert elements
        document.body.insertBefore(header, document.body.firstChild);
        document.body.insertBefore(sidebar, document.body.firstChild);
        document.body.insertBefore(mobileToggle, document.body.firstChild);

        // Mobile toggle functionality
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(e.target) && 
                !mobileToggle.contains(e.target) && 
                sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
            }
        });

        // Update endpoint count and navigation
        setTimeout(() => {
            const operations = document.querySelectorAll('.opblock');
            document.getElementById('endpoint-count').textContent = operations.length;

            // Add smooth scrolling to navigation links
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Update active state
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Scroll to relevant operations (basic implementation)
                    const href = this.getAttribute('href').substring(1);
                    const firstOperation = document.querySelector('.opblock');
                    if (firstOperation) {
                        firstOperation.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });

            // Search functionality
            const searchInput = document.getElementById('endpoint-search');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase();
                    operations.forEach(op => {
                        const summary = op.querySelector('.opblock-summary-description, .opblock-summary-path');
                        const text = summary ? summary.textContent.toLowerCase() : '';
                        op.style.display = text.includes(searchTerm) ? 'block' : 'none';
                    });
                });
            }
        }, 1000);
    });
`;

// Combined CSS
const combinedCSS = customCSS + dashboardSidebarCSS;

// Swagger UI options with dashboard styling
const swaggerUIOptions = {
    customCss: combinedCSS,
    customJs: dashboardJS,
    customSiteTitle: "Wallet API Documentation",
    customfavIcon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iIzI1NjNlYiIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cGF0aCBkPSJNMiAyaDR2NGgtNHoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDJoNHYxaC00eiIgZmlsbD0iI2Y1OWUwYiIvPgo8L3N2Zz4KPC9zdmc+",
    swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        onComplete: function () {
            console.log("Dashboard-style Swagger UI loaded successfully");
        },
        requestInterceptor: (req) => {
            console.log("Request:", req);
            return req;
        },
        responseInterceptor: (res) => {
            console.log("Response:", res);
            return res;
        }
    }
};

module.exports = {
    swaggerDocument,
    swaggerUIOptions
};