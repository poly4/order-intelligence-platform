# Order Intelligence Platform - Technical Architecture Documentation

## 🏗️ System Architecture Overview

The Order Intelligence Platform is a modern web-based warehouse management system built with a modular, event-driven architecture. The system transforms CSV order data into actionable warehouse intelligence with real-time dispatch optimization and intelligent batch processing.

### 🎯 Architectural Principles

1. **Modular Design**: Loosely coupled components with clear interfaces
2. **Event-Driven**: Reactive architecture with centralized event bus
3. **Performance First**: Sub-100ms calculations with 60fps UI updates
4. **Client-Side Intelligence**: Browser-based processing with no server dependencies
5. **Progressive Enhancement**: Core functionality works without JavaScript
6. **Data Integrity**: Comprehensive validation and error recovery

---

## 📊 High-Level System Architecture

```mermaid
graph TB
    A[CSV Data Input] --> B[Data Validation Layer]
    B --> C[State Management Core]
    C --> D[Business Logic Engine]
    D --> E[Visualization Layer]
    D --> F[Dispatch Queue System]
    D --> G[Batch Optimization Engine]
    
    C --> H[Event Bus]
    H --> I[UI Components]
    H --> J[Performance Monitoring]
    H --> K[Error Handling System]
    
    L[localStorage] --> C
    C --> L
    
    M[External Libraries] --> N[Chart.js Wrapper]
    M --> O[Papa Parse Handler]
    M --> P[Leaflet.js Integration]
    
    N --> E
    O --> B
    P --> E
```

---

## 🏗️ Core System Components

### 1. Data Management Layer

#### CSV Processing Pipeline
```javascript
// High-level CSV processing flow
CSV File → Papa Parse → Validation → Transformation → State Store
    ↓           ↓           ↓             ↓              ↓
  Error      Malformed   Invalid      Enrichment   Event Bus
  Recovery   Data        Fields       Calculations  Notification
```

**Key Components:**
- **CSVHandler**: Papa Parse integration with error recovery
- **DataValidator**: UK-specific validation rules and sanitization
- **DataTransformer**: Enrichment with calculated fields (DPS, status, etc.)
- **StateManager**: Centralized data store with undo/redo capabilities

#### Data Models

**Order Entity:**
```typescript
interface Order {
  // Core CSV fields
  orderNumber: string;        // Unique identifier (6+ alphanumeric)
  orderDate: Date;           // When order was placed
  customerName: string;      // Customer full name
  phone: string;            // UK phone number (+44 or 07 format)
  county: string;           // UK county for geographic analysis
  address: string;          // Complete delivery address
  product: string;          // Product name/description
  category: string;         // Product category (kitchen, electronics, gaming)
  orderTotal: number;       // Order value in GBP
  quantity: number;         // Number of items
  expectedDispatch: Date;   // Dispatch deadline
  deliveryBy: string;       // Delivery window or date
  latitude?: number;        // Optional coordinates
  longitude?: number;       // Optional coordinates
  
  // Calculated fields
  deliveryEndDate: Date;    // Parsed delivery deadline
  status: OrderStatus;      // 'overdue' | 'today' | 'upcoming'
  daysOverdue: number;      // Days past delivery date
  urgencyScore: number;     // DPS calculation result
  batchOpportunities: BatchOpportunity[];
}

interface BatchOpportunity {
  type: 'SKU' | 'GEOGRAPHIC' | 'HYBRID';
  efficiency: number;       // 15-45% improvement
  orders: string[];        // Order numbers in batch
  estimatedTime: number;   // Processing time in minutes
}
```

### 2. Business Logic Engine

#### Dispatch Priority Score (DPS) Algorithm

The DPS algorithm is the core intelligence component that prioritizes orders for warehouse dispatch.

**Mathematical Formula:**
```javascript
DPS = (DispatchUrgency × 0.60) + 
      (DeliveryPressure × 0.20) + 
      (OrderAge × 0.10) + 
      (ValueScore × 0.10)

// Where each component is normalized to 0-100 scale
DispatchUrgency = 100 × (1 - (hoursUntilDispatch / 24))
DeliveryPressure = 100 × (1 - (deliveryWindow / maxWindow))
OrderAge = 100 × (hoursSinceOrder / 168) // 168 hours = 1 week
ValueScore = Math.min(100, orderTotal / 50) // £50 = 1 point, max 100
```

**Algorithm Implementation:**
```javascript
class DispatchPriorityCalculator {
  calculateDPS(order, currentTime = new Date()) {
    const components = {
      dispatchUrgency: this.calculateDispatchUrgency(order, currentTime),
      deliveryPressure: this.calculateDeliveryPressure(order),
      orderAge: this.calculateOrderAge(order, currentTime),
      valueScore: this.calculateValueScore(order.orderTotal)
    };
    
    const dps = {
      score: this.applyWeights(components),
      urgencyLevel: this.determineUrgencyLevel(components.dispatchUrgency),
      hoursUntilDispatch: this.getHoursUntil(order.expectedDispatch, currentTime),
      breakdown: components,
      timestamp: currentTime.toISOString()
    };
    
    return dps;
  }
  
  applyWeights(components) {
    return Math.round(
      (components.dispatchUrgency * 0.60) +
      (components.deliveryPressure * 0.20) +
      (components.orderAge * 0.10) +
      (components.valueScore * 0.10)
    );
  }
}
```

#### Batch Optimization Engine

Intelligent batching system that analyzes orders for grouping opportunities.

**Optimization Strategies:**

1. **SKU Optimization** (25-40% efficiency):
   ```javascript
   const skuBatches = orders.reduce((batches, order) => {
     const sku = order.sku || order.product;
     if (!batches[sku]) batches[sku] = [];
     batches[sku].push(order);
     return batches;
   }, {});
   ```

2. **Geographic Optimization** (15-25% efficiency):
   ```javascript
   const geoBatches = {
     'London Metro': ['Greater London', 'Surrey', 'Kent'],
     'Midlands': ['West Midlands', 'Warwickshire', 'Staffordshire'],
     'Northern': ['Greater Manchester', 'West Yorkshire', 'Merseyside']
   };
   ```

3. **Hybrid Optimization** (30-50% efficiency):
   ```javascript
   const hybridBatches = detectHybridOpportunities(skuBatches, geoBatches);
   ```

### 3. State Management System

#### Centralized State Architecture

```javascript
class StateManager {
  constructor() {
    this.state = {
      orders: [],
      queueOrders: [],
      batchOpportunities: [],
      performanceMetrics: {},
      userPreferences: {},
      systemStatus: 'ready'
    };
    
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
    
    this.eventBus = new EventBus();
    this.persistenceLayer = new PersistenceLayer();
  }
  
  updateState(path, value, saveToHistory = true) {
    if (saveToHistory) {
      this.saveToHistory('update', { path, value });
    }
    
    this.setNestedValue(this.state, path, value);
    this.eventBus.emit('state:changed', { path, value });
    this.persistenceLayer.save(this.state);
  }
}
```

#### Event-Driven Updates

```javascript
class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event handler error for ${event}:`, error);
        }
      });
    }
  }
}
```

---

## 🎨 User Interface Architecture

### Component-Based UI Structure

```
Application Shell
├── Header Component
│   ├── Logo and Title
│   ├── State Management Toolbar
│   └── Performance Metrics Display
├── Navigation Component
│   ├── Tab System
│   └── Quick Actions
├── Main Content Area
│   ├── Dashboard Components
│   │   ├── Key Metrics Cards
│   │   ├── Chart Components
│   │   └── Action Center
│   ├── Operations Components
│   │   ├── CSV Upload Modal
│   │   ├── Dispatch Queue
│   │   └── Batch Optimizer
│   └── Analytics Components
│       ├── Geographic Visualization
│       ├── Performance Analytics
│       └── Customer Insights
└── Modal System
    ├── Order Detail Modal
    ├── CSV Upload Modal
    └── Error/Success Dialogs
```

### Chart.js Integration Architecture

```javascript
class ChartManager {
  constructor() {
    this.charts = new Map();
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }
  
  createChart(containerId, type, data, options = {}) {
    const canvas = document.getElementById(containerId);
    const ctx = canvas.getContext('2d');
    
    const chart = new Chart(ctx, {
      type,
      data,
      options: { ...this.defaultOptions, ...options }
    });
    
    this.charts.set(containerId, chart);
    return chart;
  }
  
  updateChart(containerId, newData) {
    const chart = this.charts.get(containerId);
    if (chart) {
      chart.data = newData;
      chart.update('active');
    }
  }
}
```

### Leaflet.js Geographic Integration

```javascript
class GeographicMapper {
  constructor(containerId) {
    this.map = L.map(containerId).setView([54.5, -2.0], 6); // UK center
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    this.countyLayers = new Map();
    this.orderMarkers = new Map();
  }
  
  addCountyData(countyName, geoJsonData, orderCount, revenue) {
    const intensity = this.calculateIntensity(orderCount, revenue);
    const color = this.getColorByIntensity(intensity);
    
    const layer = L.geoJSON(geoJsonData, {
      style: {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
      }
    }).addTo(this.map);
    
    this.countyLayers.set(countyName, layer);
  }
}
```

---

## ⚡ Performance Architecture

### Performance Optimization Strategies

#### 1. Efficient DOM Management

```javascript
class DOMOptimizer {
  // Use DocumentFragment for batch DOM operations
  batchDOMUpdates(elements) {
    const fragment = document.createDocumentFragment();
    elements.forEach(element => fragment.appendChild(element));
    return fragment;
  }
  
  // Virtual scrolling for large datasets
  implementVirtualScrolling(container, items, itemHeight) {
    const viewportHeight = container.clientHeight;
    const visibleItems = Math.ceil(viewportHeight / itemHeight) + 2; // Buffer
    
    let startIndex = 0;
    let endIndex = visibleItems;
    
    const updateVisibleItems = () => {
      const scrollTop = container.scrollTop;
      startIndex = Math.floor(scrollTop / itemHeight);
      endIndex = Math.min(startIndex + visibleItems, items.length);
      
      this.renderVisibleItems(startIndex, endIndex);
    };
    
    container.addEventListener('scroll', debounce(updateVisibleItems, 16));
  }
}
```

#### 2. Memory Management

```javascript
class MemoryManager {
  constructor() {
    this.timers = new Set();
    this.eventListeners = new Map();
    this.observers = new Set();
  }
  
  addTimer(timerId) {
    this.timers.add(timerId);
  }
  
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, new Map());
    }
    this.eventListeners.get(element).set(event, handler);
  }
  
  cleanup() {
    // Clear all timers
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
    
    // Remove all event listeners
    this.eventListeners.forEach((events, element) => {
      events.forEach((handler, event) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}
```

#### 3. Calculation Optimization

```javascript
// DPS calculation optimization with caching
class OptimizedDPSCalculator {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 30000; // 30 seconds
  }
  
  calculateBatchDPS(orders) {
    const results = [];
    const currentTime = new Date();
    
    // Process in chunks to avoid blocking UI
    const processChunk = (chunk) => {
      return chunk.map(order => {
        const cacheKey = this.getCacheKey(order, currentTime);
        
        if (this.cache.has(cacheKey)) {
          return this.cache.get(cacheKey);
        }
        
        const dps = this.calculateDPS(order, currentTime);
        this.cache.set(cacheKey, dps);
        
        // Auto-expire cache entries
        setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);
        
        return dps;
      });
    };
    
    // Process in chunks using requestIdleCallback for smooth UI
    const chunkSize = 100;
    for (let i = 0; i < orders.length; i += chunkSize) {
      const chunk = orders.slice(i, i + chunkSize);
      
      if (window.requestIdleCallback) {
        requestIdleCallback(() => {
          results.push(...processChunk(chunk));
        });
      } else {
        results.push(...processChunk(chunk));
      }
    }
    
    return results;
  }
}
```

---

## 🔒 Security Architecture

### Input Validation Framework

```javascript
class SecurityValidator {
  constructor() {
    this.patterns = {
      ukPostcode: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      ukPhone: /^(\+44|0)[0-9]{10,11}$/,
      orderNumber: /^[A-Z0-9]{6,}$/i,
      money: /^\d+(\.\d{1,2})?$/,
      safeText: /^[a-zA-Z0-9\s\-.,()&]+$/
    };
  }
  
  validateOrder(order) {
    const errors = [];
    
    // Required field validation
    const requiredFields = ['orderNumber', 'customerName', 'orderTotal'];
    requiredFields.forEach(field => {
      if (!order[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Pattern validation
    if (order.postcode && !this.patterns.ukPostcode.test(order.postcode)) {
      errors.push('Invalid UK postcode format');
    }
    
    if (order.phone && !this.patterns.ukPhone.test(order.phone)) {
      errors.push('Invalid UK phone number format');
    }
    
    // XSS prevention
    const textFields = ['customerName', 'address', 'product'];
    textFields.forEach(field => {
      if (order[field]) {
        order[field] = this.sanitizeHtml(order[field]);
      }
    });
    
    return { isValid: errors.length === 0, errors, sanitizedOrder: order };
  }
  
  sanitizeHtml(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
}
```

### Data Protection Layer

```javascript
class DataProtectionLayer {
  constructor() {
    this.sensitiveFields = ['customerName', 'phone', 'address'];
  }
  
  // Log safe data only (no customer information)
  logSafeData(data, operation) {
    const safeData = {
      operation,
      timestamp: new Date().toISOString(),
      orderCount: data.orders?.length || 0,
      performanceMetrics: data.performance,
      // Exclude all sensitive customer data
    };
    
    console.log('Operation:', safeData);
    return safeData;
  }
  
  // Mask sensitive data for display
  maskSensitiveData(order) {
    return {
      ...order,
      customerName: this.maskCustomerName(order.customerName),
      phone: this.maskPhoneNumber(order.phone),
      address: this.maskAddress(order.address)
    };
  }
  
  maskCustomerName(name) {
    if (!name || name.length < 3) return name;
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  }
}
```

---

## 📊 Monitoring and Analytics Architecture

### Performance Monitoring

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      dpsCalculationTime: [],
      queueRenderTime: [],
      csvProcessingTime: [],
      memoryUsage: [],
      errorCounts: {}
    };
  }
  
  startTimer(operation) {
    return {
      operation,
      startTime: performance.now(),
      startMemory: performance.memory?.usedJSHeapSize || 0
    };
  }
  
  endTimer(timer) {
    const endTime = performance.now();
    const endMemory = performance.memory?.usedJSHeapSize || 0;
    
    const result = {
      operation: timer.operation,
      duration: endTime - timer.startTime,
      memoryDelta: endMemory - timer.startMemory,
      timestamp: new Date().toISOString()
    };
    
    this.recordMetric(timer.operation, result);
    return result;
  }
  
  recordMetric(operation, result) {
    if (!this.metrics[operation]) {
      this.metrics[operation] = [];
    }
    
    this.metrics[operation].push(result);
    
    // Keep only last 100 measurements
    if (this.metrics[operation].length > 100) {
      this.metrics[operation] = this.metrics[operation].slice(-100);
    }
  }
  
  getAveragePerformance(operation) {
    const measurements = this.metrics[operation] || [];
    if (measurements.length === 0) return null;
    
    const avgDuration = measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length;
    const avgMemory = measurements.reduce((sum, m) => sum + m.memoryDelta, 0) / measurements.length;
    
    return { avgDuration, avgMemory, sampleSize: measurements.length };
  }
}
```

---

## 🔄 Integration Architecture

### External Library Integration

#### Chart.js Wrapper
```javascript
class ChartWrapper {
  constructor() {
    this.defaultConfig = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.1)' } },
        y: { grid: { color: 'rgba(255,255,255,0.1)' } }
      }
    };
  }
  
  createChart(type, data, customOptions = {}) {
    return {
      type,
      data,
      options: this.mergeOptions(this.defaultConfig, customOptions)
    };
  }
}
```

#### Papa Parse Handler
```javascript
class CSVProcessor {
  constructor() {
    this.defaultConfig = {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    };
  }
  
  async processFile(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        ...this.defaultConfig,
        complete: (results) => resolve(results),
        error: (error) => reject(error)
      });
    });
  }
}
```

---

## 🚀 Deployment Architecture

### Single-Page Application Structure

```
order_visualization-5-enhanced.html
├── HTML Structure (semantic, accessible)
├── CSS Styles (embedded, optimized)
├── JavaScript Code (modular, ES6+)
├── External Dependencies (CDN)
│   ├── Chart.js 3.9.1
│   ├── Papa Parse 5.4.1
│   └── Leaflet.js 1.9.4
└── Asset Management
    ├── Sample CSV files
    ├── Documentation links
    └── Error recovery assets
```

### Browser Compatibility Matrix

| Browser | Version | Status | Notes |
|---------|---------|--------|---------|
| Chrome | 90+ | ✅ Full Support | Recommended for development |
| Firefox | 88+ | ✅ Full Support | Good performance |
| Safari | 14+ | ✅ Full Support | macOS/iOS compatibility |
| Edge | 90+ | ✅ Full Support | Windows enterprise |
| IE | 11 | ❌ Not Supported | Legacy browser |

### Progressive Enhancement Strategy

1. **Core Functionality**: Basic CSV viewing without JavaScript
2. **Enhanced Experience**: Full functionality with JavaScript enabled
3. **Advanced Features**: Modern browser APIs for optimal performance
4. **Graceful Degradation**: Fallbacks for unsupported features

---

## 📈 Scalability Considerations

### Data Volume Handling

| Dataset Size | Strategy | Performance Target |
|--------------|----------|--------------------|
| < 100 orders | Direct processing | < 10ms |
| 100-1,000 orders | Optimized algorithms | < 100ms |
| 1,000-10,000 orders | Chunked processing | < 1s |
| 10,000+ orders | Web Workers + pagination | < 5s |

### Memory Management Strategy

```javascript
// Memory-efficient large dataset handling
class LargeDatasetManager {
  constructor(maxMemoryMB = 100) {
    this.maxMemory = maxMemoryMB * 1024 * 1024; // Convert to bytes
    this.activeDatasets = new Map();
  }
  
  loadDataset(name, data) {
    const estimatedSize = this.estimateMemoryUsage(data);
    
    if (estimatedSize > this.maxMemory) {
      // Use streaming/chunked processing
      return this.loadLargeDataset(name, data);
    } else {
      // Load directly into memory
      this.activeDatasets.set(name, data);
      return Promise.resolve(data);
    }
  }
  
  estimateMemoryUsage(data) {
    // Rough estimation: JSON string length * 2 for overhead
    return JSON.stringify(data).length * 2;
  }
}
```

---

## 🔧 Development Architecture

### Code Organization Strategy

```javascript
// Modular architecture with clear separation of concerns
const OrderIntelligencePlatform = {
  // Core systems
  core: {
    StateManager,
    EventBus,
    DataValidator,
    ErrorHandler
  },
  
  // Business logic
  business: {
    DispatchPriorityCalculator,
    BatchOptimizer,
    PerformanceAnalyzer
  },
  
  // UI components
  ui: {
    ChartManager,
    ModalSystem,
    NavigationController,
    DashboardRenderer
  },
  
  // Integration layers
  integration: {
    CSVProcessor,
    ChartWrapper,
    GeographicMapper
  },
  
  // Utilities
  utils: {
    DateHelper,
    ValidationHelper,
    PerformanceMonitor,
    SecurityValidator
  }
};
```

### Testing Architecture

```javascript
// Comprehensive testing strategy
const TestSuite = {
  unit: {
    dpsAlgorithm: () => testDPSCalculations(),
    batchOptimization: () => testBatchDetection(),
    dataValidation: () => testValidationRules(),
    stateManagement: () => testStateOperations()
  },
  
  integration: {
    csvProcessing: () => testCSVWorkflow(),
    uiUpdates: () => testUISync(),
    performanceTargets: () => benchmarkOperations()
  },
  
  performance: {
    largeDatasets: () => testWithLargeData(),
    memoryUsage: () => profileMemory(),
    renderingSpeed: () => measureUIPerformance()
  }
};
```

---

## 📚 Architecture Decision Records (ADRs)

### ADR-001: Client-Side Architecture
**Decision**: Build as single-page client-side application
**Rationale**: 
- No server infrastructure required
- Sensitive data stays on client
- Easy deployment and distribution
- Warehouse environments often have limited server access

### ADR-002: Event-Driven Architecture
**Decision**: Use centralized EventBus for component communication
**Rationale**:
- Loose coupling between components
- Easy to add new features
- Consistent data flow
- Better testability

### ADR-003: DPS Algorithm Weighting
**Decision**: 60/20/10/10 weighting for dispatch priority
**Rationale**:
- Dispatch deadline is most critical (60%)
- Delivery promise affects customer satisfaction (20%)
- Order age prevents stagnation (10%)
- Value consideration for business priority (10%)

### ADR-004: Real-time Updates
**Decision**: 30-second queue refresh with optimized calculations
**Rationale**:
- Balance between real-time and performance
- Warehouse operations don't need sub-second updates
- Prevents UI thrashing
- Allows time for manual intervention

---

**This architecture documentation represents the technical foundation of a production-ready warehouse management system. The modular, event-driven design ensures scalability, maintainability, and optimal performance for real-world warehouse operations.**

---

**Generated with Claude Code** 🤖  
**Co-Authored-By**: Claude <noreply@anthropic.com>  
**Architecture Version**: 2.0.0 (Phase 2 Complete)  
**Last Updated**: 2025-06-19