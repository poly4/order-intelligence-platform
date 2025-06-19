# Order Intelligence Platform - Production Deployment Guide

## 🚀 Production Deployment Overview

This guide provides comprehensive instructions for deploying the Order Intelligence Platform in production warehouse environments. The system is designed for enterprise-grade deployment with high availability, security, and performance optimization.

### 🎯 Deployment Scenarios

1. **Single Warehouse Deployment**: Standalone deployment for individual warehouse operations
2. **Multi-Warehouse Enterprise**: Centralized deployment serving multiple warehouse locations
3. **Cloud-Based SaaS**: Scalable cloud deployment for service providers
4. **Hybrid On-Premise/Cloud**: Combination deployment for enterprise security requirements

---

## 📊 Pre-Deployment Requirements

### Infrastructure Requirements

#### Minimum System Requirements

| Component | Minimum | Recommended | Enterprise |
|-----------|---------|-------------|------------|
| **Web Server** | Apache 2.4+ / Nginx 1.18+ | Nginx 1.20+ | Load-balanced cluster |
| **Client Hardware** | 4GB RAM, 2-core CPU | 8GB RAM, 4-core CPU | 16GB RAM, 8-core CPU |
| **Storage** | 10GB available | 50GB SSD | 200GB SSD RAID |
| **Network** | 100Mbps | 1Gbps | 10Gbps redundant |
| **Browser Support** | Chrome 90+, Firefox 88+ | Latest browsers | Enterprise browser policies |

#### Network Requirements

```yaml
# Firewall Configuration
Inbound Rules:
  - Port 80 (HTTP) - Redirect to HTTPS
  - Port 443 (HTTPS) - Web application access
  - Port 22 (SSH) - Administrative access (restricted IPs)
  
Outbound Rules:
  - Port 443 (HTTPS) - CDN resources (Chart.js, Papa Parse, Leaflet)
  - Port 53 (DNS) - Domain resolution
  - Port 123 (NTP) - Time synchronization
  
CDN Dependencies:
  - cdnjs.cloudflare.com (Chart.js, Papa Parse)
  - unpkg.com (Leaflet.js)
  - fonts.googleapis.com (Web fonts)
```

### Security Requirements

#### SSL/TLS Configuration

```nginx
# Nginx SSL Configuration
server {
    listen 443 ssl http2;
    server_name warehouse.yourdomain.com;
    
    # SSL Certificate (use Let's Encrypt or corporate CA)
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Strong SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com unpkg.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; img-src 'self' data:; connect-src 'self'";
}
```

#### Access Control

```yaml
# Role-Based Access Control
Roles:
  - warehouse_manager:
      permissions: [read, write, delete, export, admin]
      features: [all_tabs, user_management, system_settings]
      
  - warehouse_operator:
      permissions: [read, write]
      features: [dispatch_queue, pack_workflow, basic_analytics]
      
  - warehouse_viewer:
      permissions: [read]
      features: [dashboard, basic_reports]
      
  - system_admin:
      permissions: [read, write, delete, export, admin, system]
      features: [all_features, system_monitoring, security_audit]
```

---

## 🛠️ Deployment Methods

### Method 1: Simple File-Based Deployment

**Best for**: Single warehouse, basic requirements

#### Step 1: Download and Extract

```bash
# Download the latest release
wget https://github.com/poly4/order-intelligence-platform/releases/latest/download/order-intelligence-platform.zip

# Extract to web server directory
sudo unzip order-intelligence-platform.zip -d /var/www/html/warehouse/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/warehouse/
sudo chmod -R 755 /var/www/html/warehouse/
```

#### Step 2: Web Server Configuration

```nginx
# Nginx Configuration
server {
    listen 80;
    server_name warehouse.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name warehouse.yourdomain.com;
    
    root /var/www/html/warehouse;
    index order_visualization-5-enhanced.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security for CSV uploads (if implementing server-side)
    location ~ \.(csv)$ {
        deny all;
        return 403;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=warehouse:10m rate=10r/s;
    limit_req zone=warehouse burst=20 nodelay;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### Step 3: SSL Certificate Setup

```bash
# Using Let's Encrypt (recommended for external domains)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d warehouse.yourdomain.com

# Using self-signed certificate (internal use)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/warehouse.key \
  -out /etc/ssl/certs/warehouse.crt
```

### Method 2: Docker Deployment

**Best for**: Scalable, containerized environments

#### Dockerfile

```dockerfile
# Multi-stage build for optimization
FROM nginx:alpine as production

# Copy application files
COPY order_visualization-5-enhanced.html /usr/share/nginx/html/index.html
COPY sample_urgent_orders.csv /usr/share/nginx/html/
COPY docs/ /usr/share/nginx/html/docs/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Install additional tools
RUN apk add --no-cache \
    curl \
    jq \
    && rm -rf /var/cache/apk/*

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Security: run as non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  warehouse-app:
    build: .
    container_name: order-intelligence-platform
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl/certs:ro
      - ./logs:/var/log/nginx
      - ./data:/usr/share/nginx/html/data
    environment:
      - NGINX_HOST=warehouse.yourdomain.com
      - NGINX_PORT=80
    networks:
      - warehouse-network
    
  # Optional: Add monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: warehouse-monitoring
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - warehouse-network
  
  grafana:
    image: grafana/grafana:latest
    container_name: warehouse-dashboard
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secure_password_here
    volumes:
      - grafana-storage:/var/lib/grafana
    networks:
      - warehouse-network

volumes:
  grafana-storage:

networks:
  warehouse-network:
    driver: bridge
```

#### Deploy with Docker

```bash
# Build and deploy
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f warehouse-app

# Update deployment
docker-compose pull
docker-compose up -d
```

### Method 3: Kubernetes Deployment

**Best for**: Enterprise, multi-warehouse, high availability

#### Kubernetes Manifests

```yaml
# namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: warehouse-intelligence

---
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-intelligence-platform
  namespace: warehouse-intelligence
  labels:
    app: warehouse-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: warehouse-platform
  template:
    metadata:
      labels:
        app: warehouse-platform
    spec:
      containers:
      - name: warehouse-app
        image: your-registry/order-intelligence-platform:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: ENVIRONMENT
          value: "production"
        volumeMounts:
        - name: config-volume
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: config-volume
        configMap:
          name: nginx-config

---
# service.yml
apiVersion: v1
kind: Service
metadata:
  name: warehouse-platform-service
  namespace: warehouse-intelligence
spec:
  selector:
    app: warehouse-platform
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP

---
# ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: warehouse-platform-ingress
  namespace: warehouse-intelligence
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - warehouse.yourdomain.com
    secretName: warehouse-tls
  rules:
  - host: warehouse.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: warehouse-platform-service
            port:
              number: 80
```

#### Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f namespace.yml
kubectl apply -f deployment.yml
kubectl apply -f service.yml
kubectl apply -f ingress.yml

# Check deployment status
kubectl get pods -n warehouse-intelligence
kubectl get services -n warehouse-intelligence
kubectl get ingress -n warehouse-intelligence

# Scale deployment
kubectl scale deployment order-intelligence-platform --replicas=5 -n warehouse-intelligence

# Rolling update
kubectl set image deployment/order-intelligence-platform \
  warehouse-app=your-registry/order-intelligence-platform:v2.1.0 \
  -n warehouse-intelligence
```

---

## ⚙️ Environment Configuration

### Environment-Specific Settings

#### Production Configuration

```javascript
// config/production.js
const PRODUCTION_CONFIG = {
  // Performance settings
  performance: {
    maxOrdersInMemory: 10000,
    dpsCalculationBatchSize: 1000,
    queueRefreshInterval: 30000, // 30 seconds
    chartAnimationDuration: 150, // Reduced for performance
    enableVirtualScrolling: true
  },
  
  // Security settings
  security: {
    enableCSP: true,
    enableSRI: true, // Subresource Integrity
    sessionTimeout: 3600000, // 1 hour
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['text/csv'],
    enableAuditLogging: true
  },
  
  // Feature flags
  features: {
    enableExport: true,
    enableImport: true,
    enableBatchOperations: true,
    enablePerformanceMonitoring: true,
    enableDebugMode: false
  },
  
  // UI settings
  ui: {
    theme: 'dark', // Optimized for warehouse environments
    defaultView: 'dispatch-queue',
    enableKeyboardShortcuts: true,
    enableTooltips: true,
    autoSaveInterval: 60000 // 1 minute
  },
  
  // Integration settings
  integration: {
    enableWebhooks: false, // Future feature
    enableAPI: false, // Future feature
    enableSSO: false, // Future feature
    cdnTimeout: 5000 // 5 seconds
  }
};
```

#### Staging Configuration

```javascript
// config/staging.js
const STAGING_CONFIG = {
  ...PRODUCTION_CONFIG,
  
  // Override for testing
  performance: {
    ...PRODUCTION_CONFIG.performance,
    enableVirtualScrolling: false, // Test without optimization
    chartAnimationDuration: 300 // Full animations for testing
  },
  
  security: {
    ...PRODUCTION_CONFIG.security,
    enableDebugMode: true,
    sessionTimeout: 86400000 // 24 hours for testing
  },
  
  features: {
    ...PRODUCTION_CONFIG.features,
    enableDebugMode: true,
    enablePerformanceMonitoring: true
  }
};
```

### Configuration Management

```javascript
// Configuration loader with environment detection
class ConfigurationManager {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
  }
  
  detectEnvironment() {
    // Check hostname, URL, or environment variables
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    } else {
      return 'production';
    }
  }
  
  loadConfiguration() {
    switch (this.environment) {
      case 'production':
        return PRODUCTION_CONFIG;
      case 'staging':
        return STAGING_CONFIG;
      default:
        return DEVELOPMENT_CONFIG;
    }
  }
  
  get(path) {
    return this.getNestedValue(this.config, path);
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Global configuration instance
const config = new ConfigurationManager();
```

---

## 🔐 Security Hardening

### Application Security

#### Content Security Policy (CSP)

```html
<!-- Strict CSP for production -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 
    https://cdnjs.cloudflare.com 
    https://unpkg.com;
  style-src 'self' 'unsafe-inline' 
    https://fonts.googleapis.com;
  font-src 'self' 
    https://fonts.gstatic.com;
  img-src 'self' data: 
    https://*.openstreetmap.org;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

#### Subresource Integrity (SRI)

```html
<!-- Add SRI hashes for CDN resources -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js" 
        integrity="sha384-..." 
        crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js" 
        integrity="sha384-..." 
        crossorigin="anonymous"></script>
```

#### Input Validation Hardening

```javascript
// Enhanced security validator for production
class ProductionSecurityValidator extends SecurityValidator {
  constructor() {
    super();
    this.maxFieldLength = 1000;
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = ['text/csv', 'application/csv'];
  }
  
  validateFileUpload(file) {
    const errors = [];
    
    // File size check
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum allowed (${this.maxFileSize / 1024 / 1024}MB)`);
    }
    
    // MIME type check
    if (!this.allowedMimeTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed: ${this.allowedMimeTypes.join(', ')}`);
    }
    
    // File extension check
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'csv') {
      errors.push('File must have .csv extension');
    }
    
    // Filename validation (prevent path traversal)
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push('Invalid filename');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  sanitizeFilename(filename) {
    // Remove potentially dangerous characters
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
  }
}
```

### Network Security

#### Reverse Proxy Configuration

```nginx
# Advanced Nginx security configuration
server {
    listen 443 ssl http2;
    server_name warehouse.yourdomain.com;
    
    # Hide server information
    server_tokens off;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
    
    # DDoS protection
    client_body_timeout 5s;
    client_header_timeout 5s;
    client_max_body_size 10M;
    
    # Security headers
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Block common attack patterns
    location ~* \.(php|asp|aspx|jsp)$ {
        deny all;
        return 403;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        return 403;
    }
    
    # Main application
    location / {
        try_files $uri $uri/ /order_visualization-5-enhanced.html;
        
        # Add security headers specific to the app
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
```

---

## 📊 Performance Optimization

### Caching Strategy

#### Browser Caching

```nginx
# Nginx caching configuration
location ~* \.(css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    
    # Enable gzip
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
}

location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# No caching for the main HTML file
location = /order_visualization-5-enhanced.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

#### Application-Level Caching

```javascript
// Intelligent caching for DPS calculations
class ProductionDPSCalculator extends DispatchPriorityCalculator {
  constructor() {
    super();
    this.cache = new Map();
    this.cacheStats = { hits: 0, misses: 0 };
    this.maxCacheSize = 1000;
    this.cacheExpiry = 60000; // 1 minute
  }
  
  calculateDPS(order, currentTime = new Date()) {
    const cacheKey = this.generateCacheKey(order, currentTime);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.cacheStats.hits++;
      return this.cache.get(cacheKey).result;
    }
    
    // Calculate and cache
    const result = super.calculateDPS(order, currentTime);
    this.cacheEntry(cacheKey, result);
    this.cacheStats.misses++;
    
    return result;
  }
  
  generateCacheKey(order, currentTime) {
    // Create cache key that changes every minute
    const timeSlot = Math.floor(currentTime.getTime() / 60000);
    return `${order.orderNumber}_${timeSlot}`;
  }
  
  cacheEntry(key, result) {
    // Implement LRU cache with size limit
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
    
    // Auto-expire entries
    setTimeout(() => {
      this.cache.delete(key);
    }, this.cacheExpiry);
  }
  
  getCacheStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return {
      ...this.cacheStats,
      hitRate: total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : 0,
      cacheSize: this.cache.size
    };
  }
}
```

### Database Optimization (Future)

```sql
-- Future database schema for server-side deployment
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    county VARCHAR(100),
    address TEXT,
    product VARCHAR(255),
    category VARCHAR(100),
    order_total DECIMAL(10,2),
    quantity INTEGER,
    order_date TIMESTAMP NOT NULL,
    expected_dispatch TIMESTAMP,
    delivery_by VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status VARCHAR(50) DEFAULT 'PENDING',
    dps_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_orders_dispatch_date ON orders(expected_dispatch);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_dps_score ON orders(dps_score DESC);
CREATE INDEX idx_orders_county ON orders(county);
CREATE INDEX idx_orders_category ON orders(category);
```

---

## 📊 Monitoring and Alerting

### Application Monitoring

#### Performance Monitoring

```javascript
// Production performance monitoring
class ProductionMonitoring {
  constructor() {
    this.metrics = {
      pageLoadTime: [],
      dpsCalculationTime: [],
      csvProcessingTime: [],
      errorCounts: {},
      userSessions: new Set()
    };
    
    this.alertThresholds = {
      dpsCalculationTime: 100, // milliseconds
      csvProcessingTime: 2000, // milliseconds
      errorRate: 0.05, // 5%
      memoryUsage: 0.8 // 80%
    };
    
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    // Monitor page performance
    window.addEventListener('load', () => {
      const perfData = performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      this.recordMetric('pageLoadTime', loadTime);
    });
    
    // Monitor memory usage
    setInterval(() => {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
        if (memoryUsage > this.alertThresholds.memoryUsage) {
          this.sendAlert('HIGH_MEMORY_USAGE', { usage: memoryUsage });
        }
      }
    }, 30000); // Check every 30 seconds
    
    // Monitor errors
    window.addEventListener('error', (event) => {
      this.recordError(event.error);
    });
    
    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason);
    });
  }
  
  recordMetric(type, value) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }
    
    this.metrics[type].push({
      value,
      timestamp: Date.now()
    });
    
    // Keep only last 100 measurements
    if (this.metrics[type].length > 100) {
      this.metrics[type] = this.metrics[type].slice(-100);
    }
    
    // Check thresholds
    if (this.alertThresholds[type] && value > this.alertThresholds[type]) {
      this.sendAlert(`HIGH_${type.toUpperCase()}`, { value, threshold: this.alertThresholds[type] });
    }
  }
  
  recordError(error) {
    const errorKey = error.message || 'unknown_error';
    this.metrics.errorCounts[errorKey] = (this.metrics.errorCounts[errorKey] || 0) + 1;
    
    // Send to monitoring service
    this.sendErrorReport(error);
  }
  
  sendAlert(type, data) {
    // Send to monitoring service (webhook, email, etc.)
    console.warn(`ALERT: ${type}`, data);
    
    // Could integrate with services like:
    // - PagerDuty
    // - Slack webhooks
    // - Email alerts
    // - SMS notifications
  }
  
  sendErrorReport(error) {
    const report = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    // Send to error tracking service
    // (Sentry, Rollbar, etc.)
    console.error('Error Report:', report);
  }
  
  getHealthStatus() {
    const now = Date.now();
    const last5Minutes = now - (5 * 60 * 1000);
    
    // Calculate error rate
    const recentErrors = Object.values(this.metrics.errorCounts).reduce((sum, count) => sum + count, 0);
    const totalRequests = this.metrics.dpsCalculationTime.filter(m => m.timestamp > last5Minutes).length;
    const errorRate = totalRequests > 0 ? recentErrors / totalRequests : 0;
    
    // Calculate average performance
    const recentDPSCalculations = this.metrics.dpsCalculationTime.filter(m => m.timestamp > last5Minutes);
    const avgDPSTime = recentDPSCalculations.length > 0 
      ? recentDPSCalculations.reduce((sum, m) => sum + m.value, 0) / recentDPSCalculations.length 
      : 0;
    
    return {
      status: this.determineOverallHealth(errorRate, avgDPSTime),
      metrics: {
        errorRate: (errorRate * 100).toFixed(2),
        avgDPSCalculationTime: avgDPSTime.toFixed(2),
        activeUsers: this.metrics.userSessions.size,
        memoryUsage: performance.memory 
          ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB'
          : 'Unknown'
      }
    };
  }
  
  determineOverallHealth(errorRate, avgDPSTime) {
    if (errorRate > 0.1 || avgDPSTime > 200) return 'poor';
    if (errorRate > 0.05 || avgDPSTime > 100) return 'fair';
    if (errorRate > 0.01 || avgDPSTime > 50) return 'good';
    return 'excellent';
  }
}

// Initialize monitoring
const productionMonitoring = new ProductionMonitoring();
```

### External Monitoring

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'warehouse-platform'
    static_configs:
      - targets: ['warehouse.yourdomain.com:80']
    metrics_path: /metrics
    scrape_interval: 30s
    
  - job_name: 'nginx'
    static_configs:
      - targets: ['warehouse.yourdomain.com:9113']
```

#### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Order Intelligence Platform - Production Monitoring",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(http_request_duration_seconds{job=\"warehouse-platform\"})",
            "legendFormat": "Average Response Time"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"warehouse-platform\",status=~\"5..\"}[5m])",
            "legendFormat": "5xx Error Rate"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "singlestat",
        "targets": [
          {
            "expr": "warehouse_active_sessions",
            "legendFormat": "Active Sessions"
          }
        ]
      }
    ]
  }
}
```

---

## 🔄 Backup and Recovery

### Data Backup Strategy

#### Client-Side Data Protection

```javascript
// Automated backup system for localStorage data
class DataBackupManager {
  constructor() {
    this.backupInterval = 6 * 60 * 60 * 1000; // 6 hours
    this.maxBackups = 24; // Keep 24 backups (6 days)
    this.setupAutomaticBackup();
  }
  
  setupAutomaticBackup() {
    setInterval(() => {
      this.createBackup();
    }, this.backupInterval);
    
    // Create backup before page unload
    window.addEventListener('beforeunload', () => {
      this.createBackup();
    });
  }
  
  createBackup() {
    try {
      const data = {
        orders: JSON.parse(localStorage.getItem('orders') || '[]'),
        settings: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      };
      
      const backupKey = `backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(data));
      
      this.cleanupOldBackups();
      
      console.log('Data backup created:', backupKey);
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }
  
  cleanupOldBackups() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('backup_'));
    
    if (keys.length > this.maxBackups) {
      // Sort by timestamp and remove oldest
      keys.sort((a, b) => {
        const timestampA = parseInt(a.split('_')[1]);
        const timestampB = parseInt(b.split('_')[1]);
        return timestampA - timestampB;
      });
      
      const toRemove = keys.slice(0, keys.length - this.maxBackups);
      toRemove.forEach(key => localStorage.removeItem(key));
    }
  }
  
  listBackups() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('backup_'));
    
    return keys.map(key => {
      const timestamp = parseInt(key.split('_')[1]);
      const data = JSON.parse(localStorage.getItem(key));
      
      return {
        key,
        timestamp: new Date(timestamp),
        orderCount: data.orders?.length || 0,
        version: data.version
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  }
  
  restoreBackup(backupKey) {
    try {
      const backup = JSON.parse(localStorage.getItem(backupKey));
      
      if (backup.orders) {
        localStorage.setItem('orders', JSON.stringify(backup.orders));
      }
      
      if (backup.settings) {
        localStorage.setItem('userPreferences', JSON.stringify(backup.settings));
      }
      
      // Reload the page to apply restored data
      window.location.reload();
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
  
  exportBackup(backupKey) {
    const backup = localStorage.getItem(backupKey);
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse_backup_${backupKey}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

### Disaster Recovery Plan

#### Recovery Procedures

```bash
# 1. System Recovery Checklist

# Verify system requirements
./scripts/check-requirements.sh

# Restore from backup
sudo cp /backup/order-intelligence-platform/* /var/www/html/warehouse/

# Verify file permissions
sudo chown -R www-data:www-data /var/www/html/warehouse/
sudo chmod -R 755 /var/www/html/warehouse/

# Restart web server
sudo systemctl restart nginx

# Verify service health
curl -f http://localhost/health

# Check logs for errors
sudo tail -f /var/log/nginx/error.log
```

#### Data Recovery

```javascript
// Emergency data recovery from exported files
const emergencyDataRecovery = {
  recoverFromExport: async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (data.orders && Array.isArray(data.orders)) {
        // Restore orders
        localStorage.setItem('orders', JSON.stringify(data.orders));
        
        // Restore settings if available
        if (data.settings) {
          localStorage.setItem('userPreferences', JSON.stringify(data.settings));
        }
        
        return { success: true, orderCount: data.orders.length };
      } else {
        throw new Error('Invalid backup file format');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  validateRecoveredData: (orders) => {
    const issues = [];
    
    orders.forEach((order, index) => {
      if (!order.orderNumber) {
        issues.push(`Order ${index}: Missing order number`);
      }
      if (!order.customerName) {
        issues.push(`Order ${index}: Missing customer name`);
      }
      // Add more validation as needed
    });
    
    return issues;
  }
};
```

---

## 📋 Maintenance Procedures

### Regular Maintenance Tasks

#### Daily Tasks

```bash
#!/bin/bash
# daily-maintenance.sh

# Check disk space
df -h | grep -E '(8[0-9]|9[0-9])%' && echo "WARNING: High disk usage"

# Check log file sizes
find /var/log -name "*.log" -size +100M -exec echo "Large log file: {}" \;

# Verify application health
curl -f http://localhost/health || echo "ERROR: Health check failed"

# Check SSL certificate expiration
openssl x509 -in /etc/ssl/certs/warehouse.crt -noout -dates

# Monitor system resources
top -bn1 | grep "load average" > /var/log/system-load.log
```

#### Weekly Tasks

```bash
#!/bin/bash
# weekly-maintenance.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Rotate logs
sudo logrotate -f /etc/logrotate.conf

# Clean temporary files
sudo find /tmp -type f -atime +7 -delete

# Backup configuration
sudo tar -czf /backup/config-$(date +%Y%m%d).tar.gz /etc/nginx/

# Performance report
./scripts/generate-performance-report.sh
```

#### Monthly Tasks

```bash
#!/bin/bash
# monthly-maintenance.sh

# Security updates
sudo unattended-upgrades -d

# SSL certificate renewal
sudo certbot renew --dry-run

# Full system backup
sudo rsync -av /var/www/html/warehouse/ /backup/monthly/$(date +%Y%m)/

# Performance analysis
./scripts/analyze-monthly-performance.sh

# Security audit
./scripts/security-audit.sh
```

### Update Procedures

#### Application Updates

```bash
#!/bin/bash
# update-application.sh

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

# Backup current version
sudo cp -r /var/www/html/warehouse /backup/pre-update-$(date +%Y%m%d-%H%M%S)

# Download new version
wget https://github.com/poly4/order-intelligence-platform/releases/download/v${VERSION}/order-intelligence-platform-${VERSION}.zip

# Verify checksum
sha256sum -c order-intelligence-platform-${VERSION}.zip.sha256

# Create temporary directory
mkdir -p /tmp/warehouse-update
unzip order-intelligence-platform-${VERSION}.zip -d /tmp/warehouse-update

# Stop web server
sudo systemctl stop nginx

# Update files
sudo cp -r /tmp/warehouse-update/* /var/www/html/warehouse/
sudo chown -R www-data:www-data /var/www/html/warehouse/
sudo chmod -R 755 /var/www/html/warehouse/

# Start web server
sudo systemctl start nginx

# Verify update
curl -f http://localhost/health

# Cleanup
rm -rf /tmp/warehouse-update
rm order-intelligence-platform-${VERSION}.zip

echo "Update to version ${VERSION} completed successfully"
```

---

## 📈 Performance Testing

### Load Testing

```javascript
// Load testing script using Artillery.js
module.exports = {
  config: {
    target: 'https://warehouse.yourdomain.com',
    phases: [
      { duration: 60, arrivalRate: 5 },  // Warm up
      { duration: 120, arrivalRate: 10 }, // Ramp up
      { duration: 300, arrivalRate: 20 }, // Sustained load
      { duration: 60, arrivalRate: 5 }   // Cool down
    ],
    payload: {
      path: './test-orders.csv',
      fields: ['orderNumber', 'customerName', 'orderTotal']
    }
  },
  scenarios: [
    {
      name: 'Load orders and calculate DPS',
      weight: 70,
      flow: [
        { get: { url: '/' } },
        { think: 2 },
        { post: {
            url: '/api/upload',
            formData: {
              file: '@test-orders.csv'
            }
          }
        },
        { think: 5 },
        { get: { url: '/api/queue' } }
      ]
    },
    {
      name: 'Browse analytics',
      weight: 30,
      flow: [
        { get: { url: '/' } },
        { think: 3 },
        { get: { url: '/#analytics' } },
        { think: 5 },
        { get: { url: '/#geographic' } }
      ]
    }
  ]
};
```

### Stress Testing

```bash
#!/bin/bash
# stress-test.sh

# Install dependencies
npm install -g artillery

# Run performance tests
echo "Starting stress test..."
artillery run stress-test.yml

# Generate report
artillery report stress-test-results.json

# Check for performance regressions
./scripts/check-performance-regression.sh
```

---

## 📞 Support and Troubleshooting

### Common Issues

#### Issue: Application Won't Load

**Symptoms:**
- White screen or loading indefinitely
- Console errors about missing dependencies

**Diagnosis:**
```bash
# Check web server status
sudo systemctl status nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Test CDN connectivity
curl -I https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js
```

**Resolution:**
1. Verify all CDN resources are accessible
2. Check CSP headers aren't blocking resources
3. Ensure proper file permissions
4. Clear browser cache and localStorage

#### Issue: CSV Upload Fails

**Symptoms:**
- File upload doesn't work
- Validation errors for valid data

**Diagnosis:**
```javascript
// Debug CSV processing
const debugCSVUpload = (file) => {
  console.log('File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified)
  });
  
  // Check file content
  const reader = new FileReader();
  reader.onload = (e) => {
    console.log('First 500 characters:', e.target.result.substring(0, 500));
  };
  reader.readAsText(file);
};
```

**Resolution:**
1. Verify CSV format matches template
2. Check file encoding (must be UTF-8)
3. Ensure file size is under limits
4. Validate required headers are present

#### Issue: Performance Degradation

**Symptoms:**
- Slow DPS calculations
- UI freezing with large datasets

**Diagnosis:**
```javascript
// Performance debugging
const debugPerformance = () => {
  const monitoring = new PerformanceMonitor();
  const health = monitoring.getHealthStatus();
  
  console.log('Performance Status:', health);
  
  // Check memory usage
  if (performance.memory) {
    console.log('Memory Usage:', {
      used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
      total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
      limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB'
    });
  }
};
```

**Resolution:**
1. Enable virtual scrolling for large datasets
2. Implement data pagination
3. Clear browser cache and restart
4. Optimize batch sizes

### Support Contacts

#### Production Issues

**Priority 1 (System Down):**
- Create GitHub issue with "P1" label
- Include system logs and error messages
- Provide steps to reproduce

**Priority 2 (Performance Impact):**
- Create GitHub issue with "P2" label
- Include performance metrics
- Describe business impact

**Priority 3 (Enhancement Request):**
- Use GitHub Discussions for feature requests
- Provide detailed use case
- Include mockups if applicable

#### Escalation Path

1. **Level 1**: GitHub Issues and Community Support
2. **Level 2**: Enterprise Support (if available)
3. **Level 3**: Core Development Team

---

**This deployment guide provides comprehensive instructions for production deployment of the Order Intelligence Platform. Follow these procedures carefully to ensure a secure, performant, and maintainable warehouse management system.**

---

**Generated with Claude Code** 🤖  
**Co-Authored-By**: Claude <noreply@anthropic.com>  
**Deployment Guide Version**: 2.0.0 (Phase 2 Complete)  
**Last Updated**: 2025-06-19