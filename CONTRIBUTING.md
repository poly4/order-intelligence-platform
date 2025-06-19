# Contributing to Order Intelligence Platform

## 🎯 Welcome Contributors!

The Order Intelligence Platform is an enterprise-grade warehouse management system built with modern web technologies. We welcome contributions that enhance dispatch optimization, improve user experience, and advance warehouse intelligence capabilities.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Performance Guidelines](#performance-guidelines)
- [Security Considerations](#security-considerations)
- [Warehouse Domain Knowledge](#warehouse-domain-knowledge)

---

## 🤝 Code of Conduct

We are committed to fostering a welcoming and inclusive environment. All contributors must:

- ✅ Be respectful and professional in all interactions
- ✅ Focus on constructive feedback and collaborative problem-solving
- ✅ Respect diverse perspectives and experience levels
- ✅ Prioritize warehouse operations and user safety
- ❌ Engage in discriminatory, harassing, or unprofessional behavior
- ❌ Introduce breaking changes without proper discussion
- ❌ Compromise security or data integrity

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required software
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Code editor (VS Code recommended)
- Git for version control
- Node.js 16+ (for development tools)
- Live server capability (live-server, VS Code Live Server extension)
```

### Quick Setup

```bash
# 1. Fork the repository
git clone https://github.com/YOUR_USERNAME/order-intelligence-platform.git
cd order-intelligence-platform

# 2. Install development dependencies (optional)
npm install -g live-server

# 3. Start development server
live-server --open=order_visualization-5-enhanced.html

# 4. Load test data
# Open browser console and run:
demo1_LoadUrgentOrders();
runAllDemos();
```

---

## 🛠️ Development Environment

### Recommended Setup

**IDE Configuration:**
```json
// .vscode/settings.json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "html.format.indentInnerHtml": true,
  "js.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions": false,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

**Browser Extensions:**
- **Chrome DevTools**: Performance profiling and debugging
- **Lighthouse**: Performance and accessibility auditing
- **Vue.js Devtools**: If implementing Vue.js components
- **React Developer Tools**: If implementing React components

**Console Commands:**
```javascript
// Essential debugging commands
showDevelopmentInfo();     // Display system status
runAllDemos();            // Load comprehensive test data
demo1_LoadUrgentOrders(); // Load urgent order scenarios
runPerformanceTests();    // Execute performance benchmarks
validateDataIntegrity();  // Check data consistency
```

---

## 🔄 Contribution Workflow

### 1. Issue Creation

**For Bug Reports:**
```markdown
**Bug Description**: Clear, concise description
**Steps to Reproduce**: Numbered list of exact steps
**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Browser/OS**: Chrome 120/macOS 14.0
**Console Errors**: Copy exact error messages
**Test Data**: Attach CSV file if relevant
**Performance Impact**: High/Medium/Low
```

**For Feature Requests:**
```markdown
**Feature**: Brief feature title
**Business Value**: Why this feature matters for warehouse operations
**User Story**: As a [warehouse worker/manager], I want [feature] so that [benefit]
**Acceptance Criteria**: Bullet list of requirements
**Technical Considerations**: Any implementation concerns
**Phase Alignment**: Which development phase this fits
```

### 2. Branch Strategy

```bash
# Branch naming convention
feature/dispatch-queue-optimization
fix/batch-detection-edge-case
perf/dps-calculation-improvement
docs/api-reference-update
test/csv-upload-validation

# Create feature branch
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name
```

### 3. Development Process

**Phase-Aligned Development:**
- **Phase 1**: Foundation (CSV, Validation, State, Error)
- **Phase 2**: Smart Dispatch (DPS, Queue, Pack, Batch)
- **Phase 3**: Interactive UI (Tables, Charts, Filters)
- **Phase 4**: Warehouse Operations (TV mode, Teams, Voice)

**Implementation Checklist:**
```markdown
- [ ] Code follows established patterns
- [ ] Performance meets target benchmarks
- [ ] Comprehensive error handling included
- [ ] Unit tests written and passing
- [ ] Integration tests updated
- [ ] Documentation updated
- [ ] No console.log statements in production code
- [ ] Security considerations addressed
- [ ] Mobile responsiveness verified
- [ ] Accessibility guidelines followed
```

### 4. Pull Request Requirements

**PR Title Format:**
```
✨ feat: implement intelligent batch detection algorithm
🐛 fix: resolve DPS calculation race condition
⚡ perf: optimize queue refresh performance
📚 docs: update API reference with new endpoints
🧪 test: add comprehensive CSV validation tests
```

**PR Description Template:**
```markdown
## 🎯 What This PR Does
- Brief bullet list of changes
- Focus on business value

## 🧪 Testing Performed
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance benchmarked
- [ ] Cross-browser tested

## 📊 Performance Impact
- DPS Calculation: XXms (baseline: XXms)
- Memory Usage: +/-XX MB
- Bundle Size: +/-XX KB

## 🔒 Security Considerations
- Input validation added/updated
- No sensitive data exposed
- XSS protection maintained

## 📝 Documentation Updates
- [ ] Code comments added
- [ ] API documentation updated
- [ ] README.md updated if needed

## 🔗 Related Issues
Fixes #123, Addresses #456
```

---

## 📏 Coding Standards

### JavaScript Style Guide

**ES6+ Modern JavaScript:**
```javascript
// ✅ Good: Use const/let, arrow functions, destructuring
const calculateDPS = (order) => {
  const { dispatchDeadline, deliveryBy, orderDate, orderTotal } = order;
  return {
    score: calculatePriorityScore({ dispatchDeadline, deliveryBy, orderDate, orderTotal }),
    timestamp: new Date().toISOString()
  };
};

// ❌ Avoid: var, function declarations in modules
var calculateDPS = function(order) {
  var score = /* ... */;
  return score;
};
```

**Error Handling:**
```javascript
// ✅ Good: Comprehensive error handling
try {
  const result = await processOrderBatch(orders);
  showToast('success', 'Batch Processing Complete', `Processed ${result.count} orders`);
  return result;
} catch (error) {
  const errorContext = {
    operation: 'processOrderBatch',
    orderCount: orders.length,
    timestamp: new Date().toISOString()
  };
  
  handleError({
    severity: ErrorSeverity.HIGH,
    title: 'Batch Processing Failed',
    message: error.message,
    context: errorContext
  });
  
  throw error;
}
```

**Performance Patterns:**
```javascript
// ✅ Good: Efficient DOM updates
const updateQueueDisplay = (orders) => {
  const fragment = document.createDocumentFragment();
  
  orders.forEach(order => {
    const element = createOrderElement(order);
    fragment.appendChild(element);
  });
  
  queueContainer.replaceChildren(fragment);
};

// ✅ Good: Debounced operations
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);
```

### CSS/Styling Standards

**CSS Custom Properties:**
```css
/* ✅ Good: Consistent design system */
:root {
  --color-dispatch-urgent: #ff4444;
  --color-dispatch-warning: #ffaa00;
  --color-dispatch-normal: #00aa44;
  --timing-fast: 0.15s;
  --timing-normal: 0.3s;
  --shadow-elevated: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dispatch-card {
  background: var(--color-surface-elevated);
  transition: transform var(--timing-fast) ease;
  box-shadow: var(--shadow-elevated);
}
```

**Responsive Design:**
```css
/* ✅ Good: Mobile-first responsive design */
.dispatch-queue {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .dispatch-queue {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .dispatch-queue {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### HTML Semantic Standards

```html
<!-- ✅ Good: Semantic HTML with accessibility -->
<section class="dispatch-queue" role="region" aria-labelledby="queue-heading">
  <h2 id="queue-heading">Urgent Dispatch Queue</h2>
  
  <article class="dispatch-card" role="article" aria-label="Order T5ABC123">
    <header class="card-header">
      <h3 class="order-number">T5ABC123</h3>
      <time datetime="2025-06-19T10:30:00" class="dispatch-deadline">
        Dispatch by 10:30 AM
      </time>
    </header>
    
    <div class="card-content">
      <p class="customer-name">John Smith</p>
      <address class="delivery-address">
        123 High Street<br>
        London, SW1A 1AA
      </address>
    </div>
    
    <footer class="card-actions">
      <button type="button" class="btn btn-primary" 
              aria-label="Start packing order T5ABC123">
        Start Packing
      </button>
    </footer>
  </article>
</section>
```

---

## 🧪 Testing Requirements

### Unit Testing Standards

**Test Structure:**
```javascript
// ✅ Good: Comprehensive test coverage
describe('DPS Algorithm', () => {
  describe('calculateDispatchPriorityScore', () => {
    it('should calculate correct DPS for urgent orders', () => {
      const urgentOrder = {
        orderDate: '2025-06-19T08:00:00Z',
        expectedDispatch: '2025-06-19T12:00:00Z',
        deliveryBy: '2025-06-20T17:00:00Z',
        orderTotal: 299.99
      };
      
      const dps = calculateDispatchPriorityScore(urgentOrder);
      
      expect(dps.score).toBeGreaterThan(80);
      expect(dps.urgencyLevel).toBe('HIGH');
      expect(dps.hoursUntilDispatch).toBeLessThan(4);
    });
    
    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        { orderDate: null },
        { expectedDispatch: 'invalid-date' },
        { orderTotal: -100 }
      ];
      
      edgeCases.forEach(testCase => {
        expect(() => calculateDispatchPriorityScore(testCase)).not.toThrow();
      });
    });
  });
});
```

**Performance Testing:**
```javascript
// ✅ Good: Performance benchmarks
describe('Performance Tests', () => {
  it('should calculate DPS for 1000 orders in <100ms', async () => {
    const orders = generateTestOrders(1000);
    const startTime = performance.now();
    
    orders.forEach(order => calculateDispatchPriorityScore(order));
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Target: <100ms
  });
});
```

### Integration Testing

**CSV Upload Flow:**
```javascript
// Test complete CSV processing pipeline
describe('CSV Integration', () => {
  it('should process sample CSV file end-to-end', async () => {
    const csvData = await loadTestCSV('sample_urgent_orders.csv');
    
    // Process CSV
    const result = await processCSVData(csvData);
    
    // Verify results
    expect(result.validOrders).toHaveLength(10);
    expect(result.errors).toHaveLength(0);
    expect(result.batchOpportunities).toBeGreaterThan(0);
    
    // Verify UI updates
    expect(document.querySelector('.dispatch-queue')).toContainElement(
      '[data-order-number="T5ABC123"]'
    );
  });
});
```

---

## 📚 Documentation Standards

### Code Documentation

**Function Documentation:**
```javascript
/**
 * Calculates the Dispatch Priority Score (DPS) for warehouse optimization
 * 
 * The DPS algorithm uses weighted factors to prioritize order dispatch:
 * - 60% Dispatch Deadline urgency (time until expectedDispatch)
 * - 20% Delivery Promise pressure (deliveryBy - orderDate window)
 * - 10% Order Age factor (time since orderDate)
 * - 10% Order Value consideration (financial priority)
 * 
 * @param {Object} order - Order object with required fields
 * @param {string} order.orderDate - ISO date string when order was placed
 * @param {string} order.expectedDispatch - ISO date string for dispatch deadline
 * @param {string} order.deliveryBy - ISO date string for delivery promise
 * @param {number} order.orderTotal - Total order value in GBP
 * @param {Date} [currentTime=new Date()] - Current time for calculations
 * 
 * @returns {Object} DPS result object
 * @returns {number} returns.score - Priority score (0-100)
 * @returns {string} returns.urgencyLevel - 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
 * @returns {number} returns.hoursUntilDispatch - Hours until dispatch deadline
 * @returns {Object} returns.breakdown - Detailed score breakdown
 * 
 * @throws {Error} Throws error if required fields are missing or invalid
 * 
 * @example
 * const order = {
 *   orderDate: '2025-06-19T08:00:00Z',
 *   expectedDispatch: '2025-06-19T12:00:00Z',
 *   deliveryBy: '2025-06-20T17:00:00Z',
 *   orderTotal: 299.99
 * };
 * 
 * const dps = calculateDispatchPriorityScore(order);
 * console.log(`Priority: ${dps.score}, Urgency: ${dps.urgencyLevel}`);
 * 
 * @since 2.0.0
 * @author Claude Code Subagent 1 - DPS Algorithm Specialist
 */
function calculateDispatchPriorityScore(order, currentTime = new Date()) {
  // Implementation...
}
```

### API Documentation

**Endpoint Documentation:**
```javascript
/**
 * @api {POST} /api/orders/batch Detect Batch Opportunities
 * @apiName DetectBatchOpportunities
 * @apiGroup Orders
 * @apiVersion 2.0.0
 * 
 * @apiDescription Analyzes orders to identify intelligent batching opportunities
 * based on SKU optimization, geographic proximity, and urgency compatibility.
 * 
 * @apiParam {Object[]} orders Array of order objects
 * @apiParam {string} orders.sku Product SKU identifier
 * @apiParam {string} orders.county UK county for geographic analysis
 * @apiParam {number} orders.orderTotal Order value for priority assessment
 * @apiParam {string} orders.expectedDispatch Dispatch deadline ISO string
 * 
 * @apiSuccess {Object[]} batches Array of detected batch opportunities
 * @apiSuccess {string} batches.type Batch type: 'SKU'|'GEOGRAPHIC'|'HYBRID'
 * @apiSuccess {number} batches.efficiency Expected efficiency improvement (15-45%)
 * @apiSuccess {Object[]} batches.orders Orders included in this batch
 * @apiSuccess {number} batches.estimatedTime Estimated processing time in minutes
 * 
 * @apiExample {json} Request Example:
 * {
 *   "orders": [
 *     {
 *       "orderNumber": "T5ABC123",
 *       "sku": "LAPTOP-PRO-15",
 *       "county": "Greater London",
 *       "orderTotal": 1299.99,
 *       "expectedDispatch": "2025-06-19T12:00:00Z"
 *     }
 *   ]
 * }
 * 
 * @apiExample {json} Success Response:
 * {
 *   "batches": [
 *     {
 *       "type": "SKU",
 *       "efficiency": 35,
 *       "orders": ["T5ABC123", "T5DEF456"],
 *       "estimatedTime": 12
 *     }
 *   ]
 * }
 */
```

---

## ⚡ Performance Guidelines

### Performance Targets

| Operation | Target | Measurement |
|-----------|--------|--------------|
| DPS Calculation | <100ms for 1K orders | `performance.now()` |
| Queue Refresh | <50ms update | Frame rate monitoring |
| CSV Processing | <2s for 10K rows | File processing time |
| Search Filter | <16ms (60fps) | Input response time |
| Chart Rendering | <200ms | Visualization load |

### Optimization Techniques

**Efficient DOM Updates:**
```javascript
// ✅ Good: Batch DOM operations
const updateMultipleElements = (updates) => {
  // Use DocumentFragment for efficient DOM updates
  const fragment = document.createDocumentFragment();
  
  updates.forEach(update => {
    const element = createOptimizedElement(update);
    fragment.appendChild(element);
  });
  
  container.replaceChildren(fragment);
};

// ✅ Good: RequestAnimationFrame for smooth animations
const animateCountdown = (element, targetValue) => {
  const animate = (timestamp) => {
    // Smooth animation logic
    if (needsUpdate) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};
```

**Memory Management:**
```javascript
// ✅ Good: Proper cleanup
class DispatchQueue {
  constructor() {
    this.timers = new Set();
    this.eventListeners = new Map();
  }
  
  addTimer(timerId) {
    this.timers.add(timerId);
  }
  
  destroy() {
    // Clean up timers
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
    
    // Remove event listeners
    this.eventListeners.forEach((listener, element) => {
      element.removeEventListener('click', listener);
    });
    this.eventListeners.clear();
  }
}
```

---

## 🔒 Security Considerations

### Input Validation

```javascript
// ✅ Good: Comprehensive input sanitization
const validateOrderData = (order) => {
  const validators = {
    orderNumber: /^[A-Z0-9]{6,}$/i,
    postcode: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
    phone: /^(\+44|0)[0-9]{10,11}$/,
    orderTotal: /^\d+(\.\d{1,2})?$/
  };
  
  const errors = [];
  
  Object.entries(validators).forEach(([field, pattern]) => {
    if (!pattern.test(order[field])) {
      errors.push(`Invalid ${field}: ${order[field]}`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

// ✅ Good: XSS Prevention
const sanitizeHtml = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};
```

### Data Protection

```javascript
// ✅ Good: Secure data handling
const secureDataHandler = {
  // Never log sensitive data
  logSafeData: (data) => {
    const safeData = {
      orderCount: data.orders?.length,
      timestamp: data.timestamp,
      // Exclude: customer names, addresses, phone numbers
    };
    console.log('Processing data:', safeData);
  },
  
  // Clear sensitive data from memory
  clearSensitiveData: () => {
    if (window.tempOrderData) {
      delete window.tempOrderData;
    }
  }
};
```

---

## 🏭 Warehouse Domain Knowledge

### Understanding Dispatch Operations

**Key Concepts:**
- **Dispatch Priority**: Time-critical order processing based on delivery promises
- **Batch Optimization**: Grouping orders for picking efficiency
- **Pack Workflow**: Order state progression from picking to dispatch
- **Geographic Intelligence**: UK county-based routing optimization
- **SKU Optimization**: Product-based batching for warehouse efficiency

**Critical Timing:**
- **Golden Hour**: Final hour before dispatch deadline (highest priority)
- **Warning Window**: 2-4 hours before deadline (medium priority)
- **Planning Horizon**: 4+ hours before deadline (normal priority)

### Business Rules

```javascript
// High-value order protection
const isHighValueOrder = (orderTotal) => orderTotal >= 1000;

// Geographic adjacency (UK counties)
const adjacentCounties = {
  'Greater London': ['Surrey', 'Kent', 'Essex', 'Hertfordshire'],
  'West Midlands': ['Warwickshire', 'Staffordshire', 'Worcestershire'],
  // ... additional mappings
};

// Efficiency calculations
const calculateBatchEfficiency = (orders) => {
  const skuGroups = groupBySKU(orders);
  const geographicGroups = groupByCounty(orders);
  
  return {
    skuEfficiency: Math.min(skuGroups.maxSize * 0.08, 0.40), // Max 40%
    geoEfficiency: Math.min(geographicGroups.maxSize * 0.05, 0.25), // Max 25%
    hybridBonus: hasHybridOpportunity(orders) ? 0.10 : 0 // Additional 10%
  };
};
```

---

## 📞 Getting Help

### Development Support

**Discord Community**: [Join our Discord](https://discord.gg/order-intelligence)  
**GitHub Discussions**: [Technical Discussions](https://github.com/poly4/order-intelligence-platform/discussions)  
**Issue Templates**: Use provided templates for bugs and feature requests  
**Code Review**: All PRs require review from core maintainers  

### Emergency Contact

For production-critical issues affecting warehouse operations:
- **Priority 1 (Production Down)**: Create GitHub issue with "P1" label
- **Priority 2 (Performance Impact)**: Create GitHub issue with "P2" label
- **Priority 3 (Enhancement)**: Standard GitHub issue process

---

## 🏆 Recognition

### Contributor Levels

- **Bronze**: 1-3 merged PRs
- **Silver**: 5-10 merged PRs or significant feature contribution
- **Gold**: 15+ merged PRs or architectural contribution
- **Platinum**: Core maintainer status

### Hall of Fame

*Contributors will be recognized here based on their impact on warehouse operations and platform advancement.*

---

**Thank you for contributing to the Order Intelligence Platform! Your work directly impacts warehouse efficiency and helps optimize order fulfillment operations.** 🚀📦

---

**Generated with Claude Code** 🤖  
**Co-Authored-By**: Claude <noreply@anthropic.com>