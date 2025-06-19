# Order Intelligence Platform - API Reference

## 📚 Complete API Documentation

This document provides comprehensive API reference for the Order Intelligence Platform. The system is built with a modular JavaScript architecture providing both internal APIs for component communication and public APIs for external integration.

---

## 🏗️ Core System APIs

### StateManager API

Centralized state management with undo/redo capabilities and event-driven updates.

#### `StateManager.getInstance()`

Returns the singleton StateManager instance.

```javascript
const stateManager = StateManager.getInstance();
```

#### `updateState(path, value, saveToHistory = true)`

Updates state at the specified path and optionally saves to history.

**Parameters:**
- `path` (string): Dot-notation path to the state property
- `value` (any): New value to set
- `saveToHistory` (boolean): Whether to save this change to undo history

**Returns:** void

**Example:**
```javascript
// Update order status
stateManager.updateState('orders.0.status', 'PACKED');

// Update multiple orders without history
stateManager.updateState('orders', newOrdersArray, false);
```

#### `getState(path = null)`

Retrieves state value at the specified path or entire state if no path provided.

**Parameters:**
- `path` (string, optional): Dot-notation path to retrieve

**Returns:** any - The requested state value

**Example:**
```javascript
// Get all orders
const orders = stateManager.getState('orders');

// Get specific order
const order = stateManager.getState('orders.0');

// Get entire state
const fullState = stateManager.getState();
```

#### `undo()`

Reverts the last state change.

**Returns:** boolean - Success status

#### `redo()`

Reapplies the next state change in history.

**Returns:** boolean - Success status

#### `saveToStorage()`

Persists current state to localStorage.

**Returns:** void

#### `loadFromStorage()`

Loads state from localStorage.

**Returns:** boolean - Success status

---

### EventBus API

Event-driven communication system for component coordination.

#### `on(event, callback)`

Registers an event listener.

**Parameters:**
- `event` (string): Event name
- `callback` (function): Handler function

**Returns:** void

**Example:**
```javascript
eventBus.on('orders:updated', (data) => {
  console.log('Orders updated:', data.count);
});
```

#### `emit(event, data)`

Emits an event with optional data.

**Parameters:**
- `event` (string): Event name
- `data` (any, optional): Data to pass to listeners

**Returns:** void

**Example:**
```javascript
eventBus.emit('queue:refresh', { timestamp: new Date() });
```

#### `off(event, callback)`

Removes an event listener.

**Parameters:**
- `event` (string): Event name
- `callback` (function): Handler function to remove

**Returns:** void

---

## 📊 Data Processing APIs

### CSVProcessor API

Handles CSV file parsing, validation, and transformation.

#### `processFile(file)`

Processes a CSV file and returns parsed data.

**Parameters:**
- `file` (File): CSV file object from input

**Returns:** Promise\<Object\>

**Response Format:**
```javascript
{
  success: boolean,
  data: Array<Order>,
  errors: Array<ValidationError>,
  metadata: {
    totalRows: number,
    validRows: number,
    invalidRows: number,
    processingTime: number
  }
}
```

**Example:**
```javascript
const csvProcessor = new CSVProcessor();

try {
  const result = await csvProcessor.processFile(csvFile);
  
  if (result.success) {
    console.log(`Processed ${result.data.length} orders`);
    stateManager.updateState('orders', result.data);
  } else {
    console.error('Processing failed:', result.errors);
  }
} catch (error) {
  console.error('CSV processing error:', error);
}
```

#### `validateCSVStructure(headers)`

Validates CSV headers against required schema.

**Parameters:**
- `headers` (Array\<string\>): CSV header row

**Returns:** Object

**Response Format:**
```javascript
{
  isValid: boolean,
  missingHeaders: Array<string>,
  extraHeaders: Array<string>,
  suggestions: Array<string>
}
```

#### `transformOrder(rawOrder)`

Transforms raw CSV row into Order object with calculated fields.

**Parameters:**
- `rawOrder` (Object): Raw CSV row data

**Returns:** Order

---

### DataValidator API

Comprehensive data validation with UK-specific rules.

#### `validateOrder(order)`

Validates a complete order object.

**Parameters:**
- `order` (Object): Order object to validate

**Returns:** ValidationResult

**Response Format:**
```javascript
{
  isValid: boolean,
  errors: Array<ValidationError>,
  warnings: Array<ValidationWarning>,
  sanitizedOrder: Order
}
```

**Example:**
```javascript
const validator = new DataValidator();
const result = validator.validateOrder(order);

if (!result.isValid) {
  result.errors.forEach(error => {
    console.error(`${error.field}: ${error.message}`);
  });
}
```

#### `validatePostcode(postcode)`

Validates UK postcode format.

**Parameters:**
- `postcode` (string): UK postcode to validate

**Returns:** boolean

#### `validatePhoneNumber(phone)`

Validates UK phone number format.

**Parameters:**
- `phone` (string): Phone number to validate

**Returns:** boolean

#### `sanitizeInput(input, type = 'text')`

Sanitizes input to prevent XSS and injection attacks.

**Parameters:**
- `input` (string): Input to sanitize
- `type` (string): Input type ('text', 'number', 'email', etc.)

**Returns:** string - Sanitized input

---

## 🎯 Business Logic APIs

### DispatchPriorityCalculator API

Calculates dispatch priority scores using the DPS algorithm.

#### `calculateDPS(order, currentTime = new Date())`

Calculates Dispatch Priority Score for an order.

**Parameters:**
- `order` (Order): Order object with required fields
- `currentTime` (Date, optional): Current time for calculations

**Returns:** DPSResult

**Response Format:**
```javascript
{
  score: number,           // 0-100 priority score
  urgencyLevel: string,    // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  hoursUntilDispatch: number,
  breakdown: {
    dispatchUrgency: number,    // 0-100
    deliveryPressure: number,   // 0-100
    orderAge: number,           // 0-100
    valueScore: number          // 0-100
  },
  timestamp: string       // ISO timestamp
}
```

**Example:**
```javascript
const calculator = new DispatchPriorityCalculator();
const dps = calculator.calculateDPS(order);

console.log(`Priority: ${dps.score}, Urgency: ${dps.urgencyLevel}`);
console.log(`Hours until dispatch: ${dps.hoursUntilDispatch}`);
```

#### `calculateBatchDPS(orders)`

Calculates DPS for multiple orders efficiently.

**Parameters:**
- `orders` (Array\<Order\>): Array of orders to process

**Returns:** Array\<DPSResult\>

#### `getUrgencyLevel(urgencyScore)`

Determines urgency level from dispatch urgency score.

**Parameters:**
- `urgencyScore` (number): Urgency component score (0-100)

**Returns:** string - 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

---

### BatchOptimizer API

Intelligent batch detection and optimization.

#### `detectBatchOpportunities(orders)`

Analyzes orders for batching opportunities.

**Parameters:**
- `orders` (Array\<Order\>): Orders to analyze

**Returns:** Array\<BatchOpportunity\>

**Response Format:**
```javascript
[
  {
    type: 'SKU' | 'GEOGRAPHIC' | 'HYBRID',
    efficiency: number,        // 15-45% improvement
    orders: Array<string>,     // Order numbers
    estimatedTime: number,     // Minutes
    description: string,
    compatibility: {
      urgencyCompatible: boolean,
      valueProtected: boolean,
      geographicSense: boolean
    }
  }
]
```

**Example:**
```javascript
const optimizer = new BatchOptimizer();
const batches = optimizer.detectBatchOpportunities(orders);

batches.forEach(batch => {
  console.log(`${batch.type} batch: ${batch.efficiency}% efficiency`);
  console.log(`Orders: ${batch.orders.join(', ')}`);
});
```

#### `optimizeBySKU(orders)`

Groups orders by SKU for picking efficiency.

**Parameters:**
- `orders` (Array\<Order\>): Orders to group

**Returns:** Map\<string, Array\<Order\>\>

#### `optimizeByGeography(orders)`

Groups orders by geographic proximity.

**Parameters:**
- `orders` (Array\<Order\>): Orders to group

**Returns:** Map\<string, Array\<Order\>\>

#### `calculateBatchEfficiency(batch)`

Calculates efficiency improvement for a batch.

**Parameters:**
- `batch` (Array\<Order\>): Orders in the batch

**Returns:** number - Efficiency percentage (15-45)

---

## 🎨 UI Component APIs

### ChartManager API

Manages Chart.js visualizations with optimized performance.

#### `createChart(containerId, type, data, options = {})`

Creates a new chart in the specified container.

**Parameters:**
- `containerId` (string): DOM element ID for chart container
- `type` (string): Chart type ('line', 'bar', 'pie', 'doughnut')
- `data` (Object): Chart.js data object
- `options` (Object, optional): Chart.js options object

**Returns:** Chart - Chart.js instance

**Example:**
```javascript
const chartManager = new ChartManager();

const chart = chartManager.createChart('revenueChart', 'line', {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [{
    label: 'Daily Revenue',
    data: [1200, 1500, 1800, 1300, 2100],
    borderColor: '#00ff88',
    tension: 0.4
  }]
});
```

#### `updateChart(containerId, newData)`

Updates existing chart with new data.

**Parameters:**
- `containerId` (string): Chart container ID
- `newData` (Object): New Chart.js data object

**Returns:** void

#### `destroyChart(containerId)`

Destroys chart and cleans up resources.

**Parameters:**
- `containerId` (string): Chart container ID

**Returns:** void

#### `getChart(containerId)`

Retrieves existing chart instance.

**Parameters:**
- `containerId` (string): Chart container ID

**Returns:** Chart | null

---

### ModalSystem API

Manages modal dialogs with accessibility and keyboard support.

#### `showModal(modalId, data = {})`

Displays a modal dialog.

**Parameters:**
- `modalId` (string): Modal identifier
- `data` (Object, optional): Data to pass to modal

**Returns:** Promise\<any\> - Resolves when modal closes

**Example:**
```javascript
const modalSystem = new ModalSystem();

try {
  const result = await modalSystem.showModal('orderDetail', {
    orderNumber: 'T5ABC123'
  });
  
  console.log('Modal result:', result);
} catch (error) {
  console.log('Modal cancelled or error:', error);
}
```

#### `hideModal(modalId, result = null)`

Hides a modal dialog.

**Parameters:**
- `modalId` (string): Modal identifier
- `result` (any, optional): Result data to return

**Returns:** void

#### `isModalVisible(modalId)`

Checks if a modal is currently visible.

**Parameters:**
- `modalId` (string): Modal identifier

**Returns:** boolean

---

### GeographicMapper API

Leaflet.js integration for UK geographic visualization.

#### `initialize(containerId, options = {})`

Initializes the map in the specified container.

**Parameters:**
- `containerId` (string): DOM element ID for map container
- `options` (Object, optional): Leaflet map options

**Returns:** void

**Example:**
```javascript
const mapper = new GeographicMapper();
mapper.initialize('mapContainer', {
  center: [54.5, -2.0],  // UK center
  zoom: 6
});
```

#### `addCountyLayer(countyName, geoJsonData, orderData)`

Adds a county layer with order data visualization.

**Parameters:**
- `countyName` (string): UK county name
- `geoJsonData` (Object): GeoJSON boundary data
- `orderData` (Object): Order statistics for the county

**Returns:** void

**Example:**
```javascript
mapper.addCountyLayer('Greater London', geoJsonData, {
  orderCount: 150,
  revenue: 45000,
  avgOrderValue: 300
});
```

#### `addOrderMarkers(orders)`

Adds markers for individual orders.

**Parameters:**
- `orders` (Array\<Order\>): Orders with latitude/longitude

**Returns:** void

#### `updateHeatmap(data)`

Updates the order density heatmap.

**Parameters:**
- `data` (Array\<Object\>): Heatmap data points

**Returns:** void

---

## ⚡ Performance APIs

### PerformanceMonitor API

Monitors system performance and provides optimization insights.

#### `startTimer(operation)`

Starts a performance timer for an operation.

**Parameters:**
- `operation` (string): Operation name

**Returns:** Timer

**Example:**
```javascript
const monitor = new PerformanceMonitor();
const timer = monitor.startTimer('dpsCalculation');

// Perform operation
calculateDispatchPriorityScore(order);

const result = monitor.endTimer(timer);
console.log(`DPS calculation took ${result.duration}ms`);
```

#### `endTimer(timer)`

Ends a performance timer and records the result.

**Parameters:**
- `timer` (Timer): Timer object from startTimer()

**Returns:** PerformanceResult

**Response Format:**
```javascript
{
  operation: string,
  duration: number,        // milliseconds
  memoryDelta: number,     // bytes
  timestamp: string
}
```

#### `getAveragePerformance(operation)`

Retrrieves average performance metrics for an operation.

**Parameters:**
- `operation` (string): Operation name

**Returns:** Object

**Response Format:**
```javascript
{
  avgDuration: number,
  avgMemory: number,
  sampleSize: number,
  trend: 'improving' | 'stable' | 'degrading'
}
```

#### `getSystemHealth()`

Returns overall system health metrics.

**Returns:** Object

**Response Format:**
```javascript
{
  overall: 'excellent' | 'good' | 'fair' | 'poor',
  performance: {
    dpsCalculation: { avg: number, status: string },
    queueRefresh: { avg: number, status: string },
    csvProcessing: { avg: number, status: string }
  },
  memory: {
    used: number,
    available: number,
    efficiency: number
  },
  errors: {
    last24h: number,
    errorRate: number
  }
}
```

---

## 🔒 Security APIs

### SecurityValidator API

Provides security validation and sanitization functions.

#### `validateInput(input, type, options = {})`

Validates and sanitizes user input.

**Parameters:**
- `input` (string): Input to validate
- `type` (string): Input type ('text', 'number', 'email', 'postcode', 'phone')
- `options` (Object, optional): Validation options

**Returns:** ValidationResult

**Example:**
```javascript
const security = new SecurityValidator();

const result = security.validateInput(userInput, 'postcode');
if (result.isValid) {
  console.log('Safe input:', result.sanitizedValue);
} else {
  console.error('Invalid input:', result.errors);
}
```

#### `sanitizeHtml(html)`

Sanitizes HTML to prevent XSS attacks.

**Parameters:**
- `html` (string): HTML content to sanitize

**Returns:** string - Safe HTML

#### `hashSensitiveData(data)`

Hashes sensitive data for logging purposes.

**Parameters:**
- `data` (string): Sensitive data to hash

**Returns:** string - Hashed value

---

## 🔄 Integration APIs

### ExportManager API

Handles data export in multiple formats.

#### `exportToCSV(data, filename, options = {})`

Exports data to CSV format.

**Parameters:**
- `data` (Array\<Object\>): Data to export
- `filename` (string): Export filename
- `options` (Object, optional): Export options

**Returns:** void

**Example:**
```javascript
const exporter = new ExportManager();
exporter.exportToCSV(orders, 'processed_orders.csv', {
  excludeFields: ['customerName', 'phone'], // Privacy protection
  includeTimestamp: true
});
```

#### `exportToJSON(data, filename)`

Exports data to JSON format.

**Parameters:**
- `data` (any): Data to export
- `filename` (string): Export filename

**Returns:** void

#### `exportToPDF(data, template, filename)`

Exports data to PDF format using a template.

**Parameters:**
- `data` (Object): Data for the report
- `template` (string): PDF template name
- `filename` (string): Export filename

**Returns:** Promise\<void\>

---

## 📱 Mobile API Extensions

### TouchHandler API

Optimizes interactions for mobile devices.

#### `enableTouch(element)`

Enables touch-optimized interactions for an element.

**Parameters:**
- `element` (HTMLElement): Element to optimize

**Returns:** void

#### `handleSwipeGesture(element, callback)`

Handles swipe gestures on mobile devices.

**Parameters:**
- `element` (HTMLElement): Element to listen for swipes
- `callback` (function): Swipe handler function

**Returns:** void

**Example:**
```javascript
const touchHandler = new TouchHandler();
touchHandler.handleSwipeGesture(queueElement, (direction) => {
  if (direction === 'left') {
    showNextOrder();
  } else if (direction === 'right') {
    showPreviousOrder();
  }
});
```

---

## 🎯 Webhook APIs (Future)

### WebhookManager API

*Note: These APIs are planned for future implementation when server integration is added.*

#### `registerWebhook(event, url, options = {})`

Registers a webhook for specific events.

**Parameters:**
- `event` (string): Event to listen for
- `url` (string): Webhook URL
- `options` (Object, optional): Webhook options

**Returns:** Promise\<WebhookRegistration\>

#### `sendWebhook(event, data)`

Sends a webhook notification.

**Parameters:**
- `event` (string): Event name
- `data` (Object): Event data

**Returns:** Promise\<WebhookResponse\>

---

## 🧪 Testing APIs

### TestDataGenerator API

Generates test data for development and testing.

#### `generateOrders(count, options = {})`

Generates realistic test orders.

**Parameters:**
- `count` (number): Number of orders to generate
- `options` (Object, optional): Generation options

**Returns:** Array\<Order\>

**Example:**
```javascript
const generator = new TestDataGenerator();
const testOrders = generator.generateOrders(100, {
  urgentCount: 10,        // 10 urgent orders
  counties: ['Greater London', 'West Midlands'],
  dateRange: '2025-06-19' // Today's orders
});
```

#### `generateBatchScenarios()`

Generates orders optimized for batch testing.

**Returns:** Array\<Order\>

#### `generatePerformanceDataset(size)`

Generates large datasets for performance testing.

**Parameters:**
- `size` (number): Dataset size (1000, 10000, 50000)

**Returns:** Array\<Order\>

---

## 📊 Event Reference

### System Events

| Event | Data | Description |
|-------|------|-------------|
| `orders:loaded` | `{ count, source }` | Orders loaded from CSV |
| `orders:updated` | `{ count, changes }` | Orders modified |
| `queue:refreshed` | `{ queueSize, timestamp }` | Dispatch queue updated |
| `batch:detected` | `{ opportunities, efficiency }` | Batch opportunities found |
| `performance:warning` | `{ metric, value, threshold }` | Performance threshold exceeded |
| `error:critical` | `{ error, context }` | Critical system error |
| `state:changed` | `{ path, value }` | State value changed |

### UI Events

| Event | Data | Description |
|-------|------|-------------|
| `modal:opened` | `{ modalId, data }` | Modal dialog opened |
| `modal:closed` | `{ modalId, result }` | Modal dialog closed |
| `chart:updated` | `{ chartId, type }` | Chart visualization updated |
| `tab:changed` | `{ fromTab, toTab }` | Navigation tab changed |
| `search:performed` | `{ query, results }` | Search executed |

---

## 📈 Performance Benchmarks

### Target Performance Metrics

| Operation | Target | Measurement Method |
|-----------|--------|-----------------|
| DPS Calculation | <100ms for 1K orders | `PerformanceMonitor.startTimer()` |
| Queue Refresh | <50ms | Frame rate monitoring |
| CSV Processing | <2s for 10K rows | File processing timer |
| Chart Rendering | <200ms | `chart.update()` timing |
| Search Filter | <16ms (60fps) | Input response measurement |

### Example Performance Testing

```javascript
// Performance testing example
const runPerformanceTest = async () => {
  const monitor = new PerformanceMonitor();
  const generator = new TestDataGenerator();
  
  // Test DPS calculation performance
  const orders = generator.generateOrders(1000);
  const timer = monitor.startTimer('dpsCalculationBatch');
  
  const calculator = new DispatchPriorityCalculator();
  const results = calculator.calculateBatchDPS(orders);
  
  const performance = monitor.endTimer(timer);
  
  console.log(`DPS calculation for 1000 orders: ${performance.duration}ms`);
  console.log(`Average per order: ${performance.duration / 1000}ms`);
  
  // Assert performance targets
  if (performance.duration > 100) {
    console.warn('Performance target missed!');
  }
};
```

---

## 🔐 Security Best Practices

### Input Validation

```javascript
// Always validate input before processing
const processOrderUpdate = (orderData) => {
  const validator = new SecurityValidator();
  const result = validator.validateInput(orderData, 'order');
  
  if (!result.isValid) {
    throw new Error(`Invalid order data: ${result.errors.join(', ')}`);
  }
  
  // Process sanitized data
  return processOrder(result.sanitizedValue);
};
```

### Data Protection

```javascript
// Log safely without exposing sensitive data
const logOrderProcessing = (order) => {
  const safeData = {
    orderNumber: order.orderNumber,
    timestamp: new Date().toISOString(),
    // Never log: customerName, phone, address
  };
  
  console.log('Processing order:', safeData);
};
```

---

## 🚀 Quick Reference

### Essential API Calls

```javascript
// Load and process CSV data
const csvProcessor = new CSVProcessor();
const result = await csvProcessor.processFile(file);

// Calculate dispatch priorities
const calculator = new DispatchPriorityCalculator();
const dps = calculator.calculateDPS(order);

// Detect batch opportunities
const optimizer = new BatchOptimizer();
const batches = optimizer.detectBatchOpportunities(orders);

// Update UI
const chartManager = new ChartManager();
chartManager.updateChart('revenueChart', newData);

// State management
const stateManager = StateManager.getInstance();
stateManager.updateState('orders', processedOrders);

// Performance monitoring
const monitor = new PerformanceMonitor();
const timer = monitor.startTimer('operation');
// ... perform operation ...
monitor.endTimer(timer);
```

### Error Handling Pattern

```javascript
try {
  const result = await someAPICall();
  return result;
} catch (error) {
  const errorHandler = new ErrorHandler();
  errorHandler.handle({
    severity: ErrorSeverity.HIGH,
    title: 'Operation Failed',
    message: error.message,
    context: { operation: 'apiCall', timestamp: new Date() }
  });
  throw error;
}
```

---

**This API reference provides complete documentation for integrating with and extending the Order Intelligence Platform. All APIs are designed for production use with comprehensive error handling, performance optimization, and security considerations.**

---

**Generated with Claude Code** 🤖  
**Co-Authored-By**: Claude <noreply@anthropic.com>  
**API Version**: 2.0.0 (Phase 2 Complete)  
**Last Updated**: 2025-06-19