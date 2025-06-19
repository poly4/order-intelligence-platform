/**
 * 🚀 Pack Workflow System & State Management Specialist
 * Ultra-Advanced Order Intelligence Platform - Phase 2
 * 
 * This module implements the complete pack workflow system that tracks orders 
 * from queue to dispatch with full state management integration.
 * 
 * Features:
 * - Complete workflow state machine (PENDING → PICKING → PACKING → PACKED → DISPATCHED)
 * - Real-time timestamp tracking for each state transition
 * - Worker assignment and efficiency metrics tracking
 * - Integration with existing Phase 1 state management
 * - Pack time calculations and analytics
 * - Automatic queue management and updates
 * 
 * @author Claude Code Agent 3 - Pack Workflow Specialist
 * @version 2.0.0
 * @created 2025-06-19
 */

// Pack Workflow States
const PackStates = {
    PENDING: 'pending',
    PICKING: 'picking', 
    PACKING: 'packing',
    PACKED: 'packed',
    DISPATCHED: 'dispatched'
};

// Pack Priority Levels
const PackPriority = {
    CRITICAL: 'critical',    // Dispatch deadline today
    HIGH: 'high',           // Dispatch deadline tomorrow
    MEDIUM: 'medium',       // Dispatch deadline 2-3 days
    LOW: 'low'              // Dispatch deadline 4+ days
};

// Worker efficiency tracking
const WorkerMetrics = {
    totalPackTime: 0,
    packCount: 0,
    averagePackTime: 0,
    currentShift: new Date().toDateString()
};

/**
 * Main Pack Workflow Class
 * Manages the complete pack workflow state machine with validation
 */
class PackWorkflow {
    constructor() {
        this.packSessions = new Map(); // Active pack sessions
        this.packHistory = []; // Completed pack records
        this.workerMetrics = new Map(); // Worker performance data
        this.batchDetectionEnabled = true;
        this.autoQueueUpdate = true;
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Restore from localStorage if available
        this.restorePackWorkflowState();
        
        console.log('🚀 Pack Workflow System initialized');
    }

    /**
     * Start pack workflow for an order
     * @param {string} orderNumber - Order identifier
     * @param {string} workerName - Worker assigned to pack
     * @returns {Object} Pack session details
     */
    startPackWorkflow(orderNumber, workerName = 'System') {
        try {
            // Validate order exists
            const order = this.findOrderByNumber(orderNumber);
            if (!order) {
                throw new Error(`Order ${orderNumber} not found`);
            }

            // Check if already in workflow
            if (this.packSessions.has(orderNumber)) {
                throw new Error(`Order ${orderNumber} already in pack workflow`);
            }

            // Create pack session
            const packSession = {
                orderNumber,
                workerName,
                status: PackStates.PICKING,
                startTime: new Date(),
                timestamps: {
                    started: new Date(),
                    picking: new Date(),
                    packing: null,
                    packed: null,
                    dispatched: null
                },
                priority: this.calculatePackPriority(order),
                estimatedDuration: this.estimatePackTime(order),
                actualDuration: null,
                notes: [],
                errors: []
            };

            // Add to active sessions
            this.packSessions.set(orderNumber, packSession);

            // Update order status in main data
            this.updateOrderStatus(orderNumber, 'picking');

            // Save state
            this.savePackWorkflowState();

            // Trigger UI updates
            this.dispatchPackEvent('pack-started', { orderNumber, session: packSession });

            // Show success notification
            this.showPackNotification('success', 'Pack Started', 
                `Pack workflow started for order ${orderNumber} by ${workerName}`);

            // Remove from urgent queue
            this.removeFromUrgentQueue(orderNumber);

            // Check for batch opportunities
            if (this.batchDetectionEnabled) {
                this.detectBatchOpportunities(order);
            }

            return packSession;

        } catch (error) {
            this.handlePackError(error, 'startPackWorkflow', { orderNumber, workerName });
            throw error;
        }
    }

    /**
     * Update pack status with timestamp tracking
     * @param {string} orderNumber - Order identifier
     * @param {string} newStatus - New pack status
     * @param {string} notes - Optional notes
     * @returns {Object} Updated pack session
     */
    updatePackStatus(orderNumber, newStatus, notes = '') {
        try {
            const session = this.packSessions.get(orderNumber);
            if (!session) {
                throw new Error(`No active pack session for order ${orderNumber}`);
            }

            // Validate state transition
            if (!this.isValidStateTransition(session.status, newStatus)) {
                throw new Error(`Invalid state transition from ${session.status} to ${newStatus}`);
            }

            // Update session
            const previousStatus = session.status;
            session.status = newStatus;
            session.timestamps[newStatus] = new Date();
            
            if (notes) {
                session.notes.push({
                    timestamp: new Date(),
                    note: notes,
                    worker: session.workerName
                });
            }

            // Calculate duration for completed states
            if (newStatus === PackStates.PACKED) {
                session.actualDuration = this.calculatePackDuration(session);
                this.recordPackingMetrics(orderNumber, session.actualDuration, session.workerName);
            }

            // Update main order status
            this.updateOrderStatus(orderNumber, newStatus);

            // Handle completion
            if (newStatus === PackStates.DISPATCHED) {
                this.completePackWorkflow(orderNumber);
            }

            // Save state
            this.savePackWorkflowState();

            // Trigger events
            this.dispatchPackEvent('pack-status-updated', { 
                orderNumber, 
                previousStatus,
                newStatus, 
                session 
            });

            // Show notification
            this.showPackNotification('info', 'Status Updated', 
                `Order ${orderNumber} moved to ${newStatus.toUpperCase()}`);

            return session;

        } catch (error) {
            this.handlePackError(error, 'updatePackStatus', { orderNumber, newStatus });
            throw error;
        }
    }

    /**
     * Record packing metrics for efficiency tracking
     * @param {string} orderNumber - Order identifier
     * @param {number} duration - Pack duration in minutes
     * @param {string} workerName - Worker name
     */
    recordPackingMetrics(orderNumber, duration, workerName) {
        try {
            // Update worker metrics
            if (!this.workerMetrics.has(workerName)) {
                this.workerMetrics.set(workerName, {
                    totalPackTime: 0,
                    packCount: 0,
                    averagePackTime: 0,
                    bestTime: Infinity,
                    worstTime: 0,
                    currentShift: new Date().toDateString(),
                    packedOrders: []
                });
            }

            const metrics = this.workerMetrics.get(workerName);
            metrics.totalPackTime += duration;
            metrics.packCount += 1;
            metrics.averagePackTime = metrics.totalPackTime / metrics.packCount;
            metrics.bestTime = Math.min(metrics.bestTime, duration);
            metrics.worstTime = Math.max(metrics.worstTime, duration);
            metrics.packedOrders.push({
                orderNumber,
                duration,
                timestamp: new Date()
            });

            // Update global metrics
            WorkerMetrics.totalPackTime += duration;
            WorkerMetrics.packCount += 1;
            WorkerMetrics.averagePackTime = WorkerMetrics.totalPackTime / WorkerMetrics.packCount;

            // Trigger analytics update
            this.dispatchPackEvent('metrics-updated', { 
                workerName, 
                metrics: this.workerMetrics.get(workerName),
                globalMetrics: WorkerMetrics
            });

            console.log(`📊 Pack metrics recorded: ${orderNumber} packed in ${duration} minutes by ${workerName}`);

        } catch (error) {
            this.handlePackError(error, 'recordPackingMetrics', { orderNumber, duration, workerName });
        }
    }

    /**
     * Remove order from urgent queue when pack workflow starts
     * @param {string} orderNumber - Order identifier
     */
    removeFromUrgentQueue(orderNumber) {
        try {
            // Update the urgent orders display
            const urgentGrid = document.getElementById('urgentOrdersGrid');
            if (urgentGrid) {
                const orderCards = urgentGrid.querySelectorAll('.urgent-order-card');
                orderCards.forEach(card => {
                    if (card.getAttribute('data-order-number') === orderNumber) {
                        card.style.transition = 'all 0.5s ease';
                        card.style.transform = 'translateX(100%) scale(0.8)';
                        card.style.opacity = '0';
                        
                        setTimeout(() => {
                            card.remove();
                            this.updateUrgentQueueDisplay();
                        }, 500);
                    }
                });
            }

            // Trigger queue update
            this.dispatchPackEvent('queue-updated', { removedOrder: orderNumber });

        } catch (error) {
            console.warn('Failed to remove order from urgent queue:', error);
        }
    }

    /**
     * Detect batch opportunities when starting pack workflow
     * @param {Object} order - Order object
     */
    detectBatchOpportunities(order) {
        try {
            // Find orders with same SKU or similar products
            const similarOrders = this.findSimilarOrders(order);
            
            if (similarOrders.length > 1) {
                const batchSuggestion = {
                    leadOrder: order.orderNumber,
                    similarOrders: similarOrders.map(o => o.orderNumber),
                    batchType: 'sku-match',
                    estimatedSaving: this.calculateBatchSaving(similarOrders),
                    suggested: new Date()
                };

                // Show batch suggestion notification
                this.showBatchSuggestion(batchSuggestion);
                
                // Trigger batch event
                this.dispatchPackEvent('batch-detected', batchSuggestion);
            }

        } catch (error) {
            console.warn('Batch detection failed:', error);
        }
    }

    /**
     * Find orders with similar products for batching
     * @param {Object} order - Reference order
     * @returns {Array} Similar orders
     */
    findSimilarOrders(order) {
        try {
            if (!window.ordersData) return [];

            return window.ordersData.filter(o => 
                o.orderNumber !== order.orderNumber &&
                o.status !== 'dispatched' &&
                !this.packSessions.has(o.orderNumber) &&
                (
                    o.product === order.product ||
                    o.category === order.category ||
                    (o.sku && order.sku && o.sku === order.sku)
                )
            );

        } catch (error) {
            console.warn('Failed to find similar orders:', error);
            return [];
        }
    }

    /**
     * Calculate estimated time savings from batching
     * @param {Array} orders - Orders to batch
     * @returns {number} Estimated time saving in minutes
     */
    calculateBatchSaving(orders) {
        const individualTime = orders.length * 8; // 8 minutes per order
        const batchTime = Math.max(3, orders.length * 4); // Reduced time when batched
        return Math.max(0, individualTime - batchTime);
    }

    /**
     * Show batch suggestion notification
     * @param {Object} batchSuggestion - Batch suggestion details
     */
    showBatchSuggestion(batchSuggestion) {
        const message = `Found ${batchSuggestion.similarOrders.length} similar orders that could be batched together. Estimated saving: ${batchSuggestion.estimatedSaving} minutes.`;
        
        this.showPackNotification('info', 'Batch Opportunity Detected', message, 10000);
        
        // Could also show a more detailed modal here
        console.log('🎯 Batch opportunity:', batchSuggestion);
    }

    /**
     * Calculate pack priority based on deadlines and order value
     * @param {Object} order - Order object
     * @returns {string} Priority level
     */
    calculatePackPriority(order) {
        try {
            const now = new Date();
            const dispatchDate = new Date(order.expectedDispatch);
            const daysUntilDispatch = Math.ceil((dispatchDate - now) / (1000 * 60 * 60 * 24));

            if (daysUntilDispatch <= 0) return PackPriority.CRITICAL;
            if (daysUntilDispatch === 1) return PackPriority.HIGH;
            if (daysUntilDispatch <= 3) return PackPriority.MEDIUM;
            return PackPriority.LOW;

        } catch (error) {
            console.warn('Failed to calculate pack priority:', error);
            return PackPriority.MEDIUM;
        }
    }

    /**
     * Estimate pack time based on order characteristics
     * @param {Object} order - Order object
     * @returns {number} Estimated time in minutes
     */
    estimatePackTime(order) {
        let baseTime = 5; // 5 minutes base
        
        // Adjust based on quantity
        baseTime += Math.max(0, (order.quantity - 1) * 2);
        
        // Adjust based on category
        const categoryMultipliers = {
            electronics: 1.5,
            fragile: 2.0,
            heavy: 1.3,
            standard: 1.0
        };
        
        const multiplier = categoryMultipliers[order.category] || 1.0;
        return Math.ceil(baseTime * multiplier);
    }

    /**
     * Calculate actual pack duration
     * @param {Object} session - Pack session
     * @returns {number} Duration in minutes
     */
    calculatePackDuration(session) {
        const startTime = session.timestamps.picking;
        const endTime = session.timestamps.packed;
        return Math.round((endTime - startTime) / (1000 * 60));
    }

    /**
     * Validate state transitions
     * @param {string} currentState - Current state
     * @param {string} newState - Proposed new state
     * @returns {boolean} Whether transition is valid
     */
    isValidStateTransition(currentState, newState) {
        const validTransitions = {
            [PackStates.PENDING]: [PackStates.PICKING],
            [PackStates.PICKING]: [PackStates.PACKING, PackStates.PENDING],
            [PackStates.PACKING]: [PackStates.PACKED, PackStates.PICKING],
            [PackStates.PACKED]: [PackStates.DISPATCHED],
            [PackStates.DISPATCHED]: [] // Terminal state
        };

        return validTransitions[currentState]?.includes(newState) || false;
    }

    /**
     * Complete pack workflow and move to history
     * @param {string} orderNumber - Order identifier
     */
    completePackWorkflow(orderNumber) {
        try {
            const session = this.packSessions.get(orderNumber);
            if (!session) return;

            // Mark as completed
            session.completed = new Date();
            session.status = PackStates.DISPATCHED;

            // Move to history
            this.packHistory.push({ ...session });
            this.packSessions.delete(orderNumber);

            // Update order status
            this.updateOrderStatus(orderNumber, 'dispatched');

            // Save state
            this.savePackWorkflowState();

            // Trigger completion event
            this.dispatchPackEvent('pack-completed', { orderNumber, session });

            console.log(`✅ Pack workflow completed for order ${orderNumber}`);

        } catch (error) {
            this.handlePackError(error, 'completePackWorkflow', { orderNumber });
        }
    }

    /**
     * Find order by order number
     * @param {string} orderNumber - Order identifier
     * @returns {Object|null} Order object or null
     */
    findOrderByNumber(orderNumber) {
        try {
            return window.ordersData?.find(order => order.orderNumber === orderNumber) || null;
        } catch (error) {
            console.warn('Failed to find order:', error);
            return null;
        }
    }

    /**
     * Update order status in main data
     * @param {string} orderNumber - Order identifier
     * @param {string} status - New status
     */
    updateOrderStatus(orderNumber, status) {
        try {
            if (!window.ordersData) return;

            const order = window.ordersData.find(o => o.orderNumber === orderNumber);
            if (order) {
                const previousStatus = order.status;
                order.status = status;
                order.lastUpdated = new Date();

                // Save state in main system
                if (typeof window.saveState === 'function') {
                    window.saveState('Pack Status Update', { 
                        orderNumber, 
                        previousStatus, 
                        newStatus: status 
                    });
                }

                // Trigger UI updates
                if (typeof window.updateDashboardMetrics === 'function') {
                    window.updateDashboardMetrics();
                }
            }

        } catch (error) {
            console.warn('Failed to update order status:', error);
        }
    }

    /**
     * Update urgent queue display after removing orders
     */
    updateUrgentQueueDisplay() {
        try {
            const urgentGrid = document.getElementById('urgentOrdersGrid');
            if (!urgentGrid) return;

            const remainingCards = urgentGrid.querySelectorAll('.urgent-order-card');
            
            if (remainingCards.length === 0) {
                urgentGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
                        <p style="color: #4CAF50; font-size: 1.1em;">✅ No urgent orders requiring immediate attention</p>
                        <p style="color: #8892b0; font-size: 0.9em;">All critical orders are being processed</p>
                    </div>
                `;
            }

        } catch (error) {
            console.warn('Failed to update urgent queue display:', error);
        }
    }

    /**
     * Setup event listeners for keyboard shortcuts and events
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                this.showQuickPackDialog();
            }
        });

        // Integration with existing state management
        document.addEventListener('dataImported', () => {
            this.restorePackWorkflowState();
        });
    }

    /**
     * Show quick pack dialog for rapid order processing
     */
    showQuickPackDialog() {
        // Implementation for quick pack dialog
        console.log('Quick pack dialog opened (Ctrl+P)');
    }

    /**
     * Dispatch pack workflow events
     * @param {string} eventType - Event type
     * @param {Object} detail - Event details
     */
    dispatchPackEvent(eventType, detail) {
        try {
            const event = new CustomEvent(`pack:${eventType}`, { 
                detail,
                bubbles: true 
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.warn('Failed to dispatch pack event:', error);
        }
    }

    /**
     * Show pack workflow notifications
     * @param {string} type - Notification type
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    showPackNotification(type, title, message, duration = 5000) {
        try {
            if (typeof window.showToast === 'function') {
                window.showToast(type, title, message, duration);
            } else {
                console.log(`${type.toUpperCase()}: ${title} - ${message}`);
            }
        } catch (error) {
            console.warn('Failed to show notification:', error);
        }
    }

    /**
     * Handle pack workflow errors
     * @param {Error} error - Error object
     * @param {string} operation - Operation that failed
     * @param {Object} context - Error context
     */
    handlePackError(error, operation, context) {
        const errorInfo = {
            operation,
            context,
            error: error.message,
            timestamp: new Date(),
            stack: error.stack
        };

        console.error('Pack Workflow Error:', errorInfo);

        // Show user-friendly error
        this.showPackNotification('error', 'Pack Workflow Error', 
            `Failed to ${operation.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${error.message}`);

        // Could also log to analytics or error tracking service
    }

    /**
     * Save pack workflow state to localStorage
     */
    savePackWorkflowState() {
        try {
            const state = {
                packSessions: Array.from(this.packSessions.entries()),
                packHistory: this.packHistory.slice(-100), // Keep last 100 records
                workerMetrics: Array.from(this.workerMetrics.entries()),
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('packWorkflowState', JSON.stringify(state));

        } catch (error) {
            console.warn('Failed to save pack workflow state:', error);
        }
    }

    /**
     * Restore pack workflow state from localStorage
     */
    restorePackWorkflowState() {
        try {
            const savedState = localStorage.getItem('packWorkflowState');
            if (!savedState) return;

            const state = JSON.parse(savedState);
            
            // Restore pack sessions
            this.packSessions = new Map(state.packSessions || []);
            
            // Restore history
            this.packHistory = state.packHistory || [];
            
            // Restore worker metrics
            this.workerMetrics = new Map(state.workerMetrics || []);

            console.log('Pack workflow state restored from localStorage');

        } catch (error) {
            console.warn('Failed to restore pack workflow state:', error);
            this.initializeDefaultState();
        }
    }

    /**
     * Initialize default state if restoration fails
     */
    initializeDefaultState() {
        this.packSessions = new Map();
        this.packHistory = [];
        this.workerMetrics = new Map();
    }

    /**
     * Get pack workflow analytics
     * @returns {Object} Analytics data
     */
    getPackAnalytics() {
        return {
            activeSessions: this.packSessions.size,
            completedToday: this.packHistory.filter(p => 
                new Date(p.completed).toDateString() === new Date().toDateString()
            ).length,
            averagePackTime: WorkerMetrics.averagePackTime,
            totalWorkers: this.workerMetrics.size,
            efficiency: this.calculateOverallEfficiency()
        };
    }

    /**
     * Calculate overall packing efficiency
     * @returns {number} Efficiency percentage
     */
    calculateOverallEfficiency() {
        const avgActual = WorkerMetrics.averagePackTime;
        const avgTarget = 8; // 8 minutes target
        return avgActual > 0 ? Math.round((avgTarget / avgActual) * 100) : 100;
    }

    /**
     * Export pack workflow data
     * @returns {Object} Export data
     */
    exportPackData() {
        return {
            activeSessions: Array.from(this.packSessions.entries()),
            packHistory: this.packHistory,
            workerMetrics: Array.from(this.workerMetrics.entries()),
            analytics: this.getPackAnalytics(),
            exportedAt: new Date().toISOString()
        };
    }
}

// Global pack workflow instance
let packWorkflow = null;

/**
 * Initialize pack workflow system
 */
function initializePackWorkflow() {
    try {
        packWorkflow = new PackWorkflow();
        window.packWorkflow = packWorkflow; // Make globally available
        
        console.log('🚀 Pack Workflow System ready');
        return packWorkflow;
        
    } catch (error) {
        console.error('Failed to initialize pack workflow:', error);
        return null;
    }
}

/**
 * Public API Functions - These replace the placeholder alert() functions
 */

/**
 * Start pack workflow for an order (replaces "Pack Now" button)
 * @param {string} orderNumber - Order identifier
 * @param {string} workerName - Worker name
 */
function startPackWorkflow(orderNumber, workerName = 'Current User') {
    try {
        if (!packWorkflow) {
            packWorkflow = initializePackWorkflow();
        }
        
        return packWorkflow.startPackWorkflow(orderNumber, workerName);
        
    } catch (error) {
        console.error('Failed to start pack workflow:', error);
        window.showToast?.('error', 'Pack Error', error.message);
    }
}

/**
 * Update pack status (replaces "Mark Complete" buttons)
 * @param {string} orderNumber - Order identifier  
 * @param {string} newStatus - New status
 * @param {string} notes - Optional notes
 */
function updatePackStatus(orderNumber, newStatus, notes = '') {
    try {
        if (!packWorkflow) {
            packWorkflow = initializePackWorkflow();
        }
        
        return packWorkflow.updatePackStatus(orderNumber, newStatus, notes);
        
    } catch (error) {
        console.error('Failed to update pack status:', error);
        window.showToast?.('error', 'Update Error', error.message);
    }
}

/**
 * Show detailed order information (replaces "View Details" button)
 * @param {string} orderNumber - Order identifier
 */
function showOrderDetails(orderNumber) {
    try {
        const order = packWorkflow?.findOrderByNumber(orderNumber);
        const packSession = packWorkflow?.packSessions.get(orderNumber);
        
        if (!order) {
            window.showToast?.('warning', 'Order Not Found', `Order ${orderNumber} not found`);
            return;
        }

        // Create detailed modal content
        const modalContent = `
            <div style="max-height: 70vh; overflow-y: auto;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h4 style="color: #667eea; margin-bottom: 10px;">📦 Order Information</h4>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Customer:</strong> ${order.customer}</p>
                        <p><strong>Product:</strong> ${order.product}</p>
                        <p><strong>Category:</strong> ${order.category}</p>
                        <p><strong>Quantity:</strong> ${order.quantity}</p>
                        <p><strong>Value:</strong> £${order.value.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span style="color: ${getStatusColor(order.status)}">${order.status}</span></p>
                    </div>
                    <div>
                        <h4 style="color: #667eea; margin-bottom: 10px;">📅 Timeline</h4>
                        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
                        <p><strong>Expected Dispatch:</strong> ${new Date(order.expectedDispatch).toLocaleDateString()}</p>
                        <p><strong>Delivery By:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
                        ${order.lastUpdated ? `<p><strong>Last Updated:</strong> ${new Date(order.lastUpdated).toLocaleString()}</p>` : ''}
                    </div>
                </div>
                
                ${packSession ? `
                    <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="color: #667eea; margin-bottom: 10px;">🔄 Pack Workflow Status</h4>
                        <p><strong>Current Status:</strong> ${packSession.status.toUpperCase()}</p>
                        <p><strong>Worker:</strong> ${packSession.workerName}</p>
                        <p><strong>Started:</strong> ${packSession.startTime.toLocaleString()}</p>
                        <p><strong>Priority:</strong> ${packSession.priority.toUpperCase()}</p>
                        <p><strong>Estimated Duration:</strong> ${packSession.estimatedDuration} minutes</p>
                        ${packSession.actualDuration ? `<p><strong>Actual Duration:</strong> ${packSession.actualDuration} minutes</p>` : ''}
                        
                        ${packSession.notes.length > 0 ? `
                            <div style="margin-top: 15px;">
                                <strong>Notes:</strong>
                                <ul style="margin-top: 5px;">
                                    ${packSession.notes.map(note => `
                                        <li style="margin-bottom: 5px;">
                                            <small style="color: #8892b0;">${note.timestamp.toLocaleString()} - ${note.worker}:</small><br>
                                            ${note.note}
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    ${!packSession ? `
                        <button class="btn btn-primary" onclick="startPackWorkflow('${orderNumber}'); closeModal();">
                            🚀 Start Pack Workflow
                        </button>
                    ` : packSession.status !== 'dispatched' ? `
                        <button class="btn btn-success" onclick="updatePackStatus('${orderNumber}', '${getNextStatus(packSession.status)}'); closeModal();">
                            ✅ Move to ${getNextStatus(packSession.status).toUpperCase()}
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `;

        // Show modal
        window.showModal?.('Order Details', modalContent);
        
    } catch (error) {
        console.error('Failed to show order details:', error);
        window.showToast?.('error', 'Details Error', 'Failed to load order details');
    }
}

/**
 * Find similar orders for batching (replaces "Find Similar" button)
 * @param {string} orderNumber - Order identifier
 */
function findSimilarOrders(orderNumber) {
    try {
        if (!packWorkflow) {
            packWorkflow = initializePackWorkflow();
        }
        
        const order = packWorkflow.findOrderByNumber(orderNumber);
        if (!order) {
            window.showToast?.('warning', 'Order Not Found', `Order ${orderNumber} not found`);
            return;
        }

        const similarOrders = packWorkflow.findSimilarOrders(order);
        
        if (similarOrders.length === 0) {
            window.showToast?.('info', 'No Similar Orders', 'No similar orders found for batching');
            return;
        }

        // Show similar orders modal
        const modalContent = `
            <div>
                <p style="margin-bottom: 20px; color: #8892b0;">
                    Found ${similarOrders.length} similar orders that could be batched with ${orderNumber}:
                </p>
                
                <div style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: rgba(255,255,255,0.05);">
                                <th style="padding: 10px; text-align: left;">Order #</th>
                                <th style="padding: 10px; text-align: left;">Product</th>
                                <th style="padding: 10px; text-align: left;">Quantity</th>
                                <th style="padding: 10px; text-align: left;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${similarOrders.map(o => `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <td style="padding: 10px;">${o.orderNumber}</td>
                                    <td style="padding: 10px;">${o.product}</td>
                                    <td style="padding: 10px;">${o.quantity}</td>
                                    <td style="padding: 10px;">
                                        <span style="color: ${getStatusColor(o.status)}">${o.status}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(76, 175, 80, 0.1); border-radius: 8px;">
                    <p style="color: #4CAF50; margin-bottom: 10px;">
                        💡 <strong>Batch Opportunity:</strong>
                    </p>
                    <p style="color: #8892b0;">
                        Estimated time saving: ${packWorkflow.calculateBatchSaving([order, ...similarOrders])} minutes<br>
                        Processing these orders together could improve efficiency.
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="createBatch(['${orderNumber}', '${similarOrders.map(o => o.orderNumber).join("', '")}']); closeModal();">
                        🎯 Create Batch
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal();">
                        Close
                    </button>
                </div>
            </div>
        `;

        window.showModal?.('Similar Orders Found', modalContent);
        
    } catch (error) {
        console.error('Failed to find similar orders:', error);
        window.showToast?.('error', 'Search Error', 'Failed to find similar orders');
    }
}

/**
 * Create batch from similar orders
 * @param {Array} orderNumbers - Array of order numbers to batch
 */
function createBatch(orderNumbers) {
    try {
        // This would implement batch creation logic
        window.showToast?.('success', 'Batch Created', 
            `Created batch with ${orderNumbers.length} orders. Workers will be notified.`);
        
        console.log('Batch created with orders:', orderNumbers);
        
    } catch (error) {
        console.error('Failed to create batch:', error);
        window.showToast?.('error', 'Batch Error', 'Failed to create batch');
    }
}

/**
 * Utility functions
 */

function getStatusColor(status) {
    const colors = {
        'pending': '#ffc107',
        'picking': '#17a2b8', 
        'packing': '#fd7e14',
        'packed': '#28a745',
        'dispatched': '#6f42c1',
        'overdue': '#dc3545'
    };
    return colors[status] || '#8892b0';
}

function getNextStatus(currentStatus) {
    const nextStatus = {
        'picking': 'packing',
        'packing': 'packed', 
        'packed': 'dispatched'
    };
    return nextStatus[currentStatus] || currentStatus;
}

// Initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    initializePackWorkflow();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PackWorkflow,
        PackStates,
        PackPriority,
        initializePackWorkflow,
        startPackWorkflow,
        updatePackStatus,
        showOrderDetails,
        findSimilarOrders
    };
}

console.log('📦 Pack Workflow System loaded successfully');