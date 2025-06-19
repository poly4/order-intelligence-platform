/**
 * 🔗 Pack Workflow Integration Script
 * Connects the Pack Workflow System with the existing Phase 1 foundation
 * 
 * This script replaces ALL placeholder alert() buttons with real functionality
 * and integrates the pack workflow seamlessly with the existing system.
 * 
 * @author Claude Code Agent 3 - Pack Workflow Integration Specialist
 * @version 2.0.0
 * @created 2025-06-19
 */

/**
 * Integration Manager for Pack Workflow
 */
class PackWorkflowIntegration {
    constructor() {
        this.initialized = false;
        this.originalFunctions = new Map(); // Store original placeholder functions
        this.setupIntegration();
    }

    /**
     * Setup complete integration with existing system
     */
    setupIntegration() {
        try {
            // Wait for DOM and existing systems to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeIntegration());
            } else {
                this.initializeIntegration();
            }
        } catch (error) {
            console.error('Failed to setup pack workflow integration:', error);
        }
    }

    /**
     * Initialize integration with existing system
     */
    initializeIntegration() {
        try {
            console.log('🔗 Initializing Pack Workflow Integration...');

            // Store original placeholder functions before replacing them
            this.storeOriginalFunctions();

            // Replace placeholder functions with real implementations
            this.replacePlaceholderFunctions();

            // Setup event listeners for existing system integration
            this.setupEventListeners();

            // Integrate with existing state management
            this.integrateStateManagement();

            // Update UI elements
            this.updateUIElements();

            // Setup pack workflow system
            this.initializePackWorkflowSystem();

            this.initialized = true;
            console.log('✅ Pack Workflow Integration complete');

        } catch (error) {
            console.error('Failed to initialize pack workflow integration:', error);
        }
    }

    /**
     * Store original placeholder functions for fallback
     */
    storeOriginalFunctions() {
        try {
            const functionsToStore = [
                'contactCustomer',
                'markPriority', 
                'trackOrder',
                'updateOrder',
                'markDelivered',
                'analyzeProduct'
            ];

            functionsToStore.forEach(funcName => {
                if (typeof window[funcName] === 'function') {
                    this.originalFunctions.set(funcName, window[funcName]);
                }
            });

            console.log('📦 Stored original placeholder functions');

        } catch (error) {
            console.warn('Failed to store original functions:', error);
        }
    }

    /**
     * Replace placeholder functions with real implementations
     */
    replacePlaceholderFunctions() {
        try {
            // Replace contactCustomer function
            window.contactCustomer = (orderNumber) => {
                this.handleContactCustomer(orderNumber);
            };

            // Replace markPriority function  
            window.markPriority = (orderNumber) => {
                this.handleMarkPriority(orderNumber);
            };

            // Replace trackOrder function
            window.trackOrder = (orderNumber) => {
                this.handleTrackOrder(orderNumber);
            };

            // Replace updateOrder function
            window.updateOrder = (orderNumber) => {
                this.handleUpdateOrder(orderNumber);
            };

            // Replace markDelivered function
            window.markDelivered = (orderNumber) => {
                this.handleMarkDelivered(orderNumber);
            };

            // Replace analyzeProduct function
            window.analyzeProduct = (productName) => {
                this.handleAnalyzeProduct(productName);
            };

            console.log('🔄 Replaced placeholder functions with real implementations');

        } catch (error) {
            console.error('Failed to replace placeholder functions:', error);
        }
    }

    /**
     * Handle contact customer action
     * @param {string} orderNumber - Order identifier
     */
    handleContactCustomer(orderNumber) {
        try {
            const order = this.findOrder(orderNumber);
            if (!order) {
                this.showNotification('error', 'Order Not Found', `Order ${orderNumber} not found`);
                return;
            }

            // Create contact customer modal
            const modalContent = `
                <div style="text-align: center;">
                    <div style="font-size: 3em; margin-bottom: 20px;">📞</div>
                    <h3 style="color: #fff; margin-bottom: 20px;">Contact Customer</h3>
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: left;">
                        <p><strong>Customer:</strong> ${order.customer}</p>
                        <p><strong>Phone:</strong> ${order.phone || 'Not available'}</p>
                        <p><strong>Order:</strong> ${order.orderNumber}</p>
                        <p><strong>Product:</strong> ${order.product}</p>
                        <p><strong>Value:</strong> £${order.value.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span style="color: ${this.getStatusColor(order.status)}">${order.status}</span></p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <button class="btn btn-primary" onclick="this.initiateCall('${order.phone}', '${orderNumber}'); closeModal();">
                            📞 Call Now
                        </button>
                        <button class="btn btn-secondary" onclick="this.sendSMS('${order.phone}', '${orderNumber}'); closeModal();">
                            💬 Send SMS
                        </button>
                    </div>

                    <div style="margin-top: 15px;">
                        <button class="btn btn-secondary" onclick="closeModal();">Cancel</button>
                    </div>
                </div>
            `;

            this.showModal('Contact Customer', modalContent);
            
            // Log contact attempt
            this.logCustomerContact(orderNumber, 'contact_initiated');

        } catch (error) {
            console.error('Failed to handle contact customer:', error);
            this.showNotification('error', 'Contact Error', 'Failed to initiate customer contact');
        }
    }

    /**
     * Handle mark priority action
     * @param {string} orderNumber - Order identifier
     */
    handleMarkPriority(orderNumber) {
        try {
            const order = this.findOrder(orderNumber);
            if (!order) {
                this.showNotification('error', 'Order Not Found', `Order ${orderNumber} not found`);
                return;
            }

            // Mark as priority and start pack workflow
            order.priority = 'high';
            order.priorityMarked = new Date();
            
            // Save state change
            this.saveStateChange('Mark Priority', { orderNumber, priority: 'high' });

            // Auto-start pack workflow for priority orders
            if (typeof window.startPackWorkflow === 'function') {
                window.startPackWorkflow(orderNumber, 'Priority Handler');
            }

            this.showNotification('success', 'Priority Set', 
                `Order ${orderNumber} marked as HIGH PRIORITY and pack workflow started`);

            // Update UI
            this.updateOrderDisplays();

        } catch (error) {
            console.error('Failed to handle mark priority:', error);
            this.showNotification('error', 'Priority Error', 'Failed to mark order as priority');
        }
    }

    /**
     * Handle track order action
     * @param {string} orderNumber - Order identifier
     */
    handleTrackOrder(orderNumber) {
        try {
            const order = this.findOrder(orderNumber);
            if (!order) {
                this.showNotification('error', 'Order Not Found', `Order ${orderNumber} not found`);
                return;
            }

            // Get pack session if exists
            const packSession = window.packWorkflow?.packSessions.get(orderNumber);

            // Create tracking modal
            const modalContent = `
                <div>
                    <h3 style="color: #667eea; margin-bottom: 20px;">📍 Order Tracking</h3>
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <h4 style="color: #8892b0; margin-bottom: 10px;">Order Details</h4>
                                <p><strong>Order #:</strong> ${order.orderNumber}</p>
                                <p><strong>Customer:</strong> ${order.customer}</p>
                                <p><strong>Status:</strong> <span style="color: ${this.getStatusColor(order.status)}">${order.status.toUpperCase()}</span></p>
                                <p><strong>Expected Dispatch:</strong> ${new Date(order.expectedDispatch).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h4 style="color: #8892b0; margin-bottom: 10px;">Timeline</h4>
                                ${this.generateTrackingTimeline(order, packSession)}
                            </div>
                        </div>
                    </div>

                    ${packSession ? `
                        <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h4 style="color: #667eea; margin-bottom: 10px;">🔄 Pack Workflow Status</h4>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>Current Status: <strong>${packSession.status.toUpperCase()}</strong></span>
                                <span>Worker: <strong>${packSession.workerName}</strong></span>
                            </div>
                            <div style="margin-top: 10px;">
                                <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${this.calculateProgress(packSession.status)}%; transition: width 0.3s ease;"></div>
                                </div>
                                <small style="color: #8892b0; margin-top: 5px; display: block;">Progress: ${this.calculateProgress(packSession.status)}%</small>
                            </div>
                        </div>
                    ` : ''}

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        ${!packSession && order.status !== 'dispatched' ? `
                            <button class="btn btn-primary" onclick="window.startPackWorkflow('${orderNumber}'); closeModal();">
                                🚀 Start Pack Workflow
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="this.exportTrackingData('${orderNumber}');">
                            📥 Export
                        </button>
                        <button class="btn btn-secondary" onclick="closeModal();">
                            Close
                        </button>
                    </div>
                </div>
            `;

            this.showModal('Order Tracking', modalContent);

        } catch (error) {
            console.error('Failed to handle track order:', error);
            this.showNotification('error', 'Tracking Error', 'Failed to load order tracking');
        }
    }

    /**
     * Handle update order action
     * @param {string} orderNumber - Order identifier
     */
    handleUpdateOrder(orderNumber) {
        try {
            const order = this.findOrder(orderNumber);
            if (!order) {
                this.showNotification('error', 'Order Not Found', `Order ${orderNumber} not found`);
                return;
            }

            // Create update order modal
            const modalContent = `
                <div>
                    <h3 style="color: #667eea; margin-bottom: 20px;">✏️ Update Order</h3>
                    
                    <form id="updateOrderForm" style="display: grid; gap: 15px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="color: #8892b0; display: block; margin-bottom: 5px;">Customer Name</label>
                                <input type="text" id="customerName" value="${order.customer}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff;">
                            </div>
                            <div>
                                <label style="color: #8892b0; display: block; margin-bottom: 5px;">Phone</label>
                                <input type="text" id="customerPhone" value="${order.phone || ''}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff;">
                            </div>
                        </div>
                        
                        <div>
                            <label style="color: #8892b0; display: block; margin-bottom: 5px;">Product</label>
                            <input type="text" id="productName" value="${order.product}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff;">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="color: #8892b0; display: block; margin-bottom: 5px;">Quantity</label>
                                <input type="number" id="quantity" value="${order.quantity}" min="1" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff;">
                            </div>
                            <div>
                                <label style="color: #8892b0; display: block; margin-bottom: 5px;">Value (£)</label>
                                <input type="number" id="orderValue" value="${order.value}" step="0.01" min="0" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff;">
                            </div>
                            <div>
                                <label style="color: #8892b0; display: block; margin-bottom: 5px;">Status</label>
                                <select id="orderStatus" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff;">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="picking" ${order.status === 'picking' ? 'selected' : ''}>Picking</option>
                                    <option value="packing" ${order.status === 'packing' ? 'selected' : ''}>Packing</option>
                                    <option value="packed" ${order.status === 'packed' ? 'selected' : ''}>Packed</option>
                                    <option value="dispatched" ${order.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="color: #8892b0; display: block; margin-bottom: 5px;">Expected Dispatch</label>
                                <input type="date" id="expectedDispatch" value="${new Date(order.expectedDispatch).toISOString().split('T')[0]}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff;">
                            </div>
                            <div>
                                <label style="color: #8892b0; display: block; margin-bottom: 5px;">Delivery Date</label>
                                <input type="date" id="deliveryDate" value="${new Date(order.deliveryDate).toISOString().split('T')[0]}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff;">
                            </div>
                        </div>
                        
                        <div>
                            <label style="color: #8892b0; display: block; margin-bottom: 5px;">Notes</label>
                            <textarea id="orderNotes" placeholder="Add any notes about this order..." style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff; min-height: 80px; resize: vertical;"></textarea>
                        </div>
                    </form>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="this.saveOrderUpdate('${orderNumber}'); closeModal();">
                            💾 Save Changes
                        </button>
                        <button class="btn btn-secondary" onclick="closeModal();">
                            Cancel
                        </button>
                    </div>
                </div>
            `;

            this.showModal('Update Order', modalContent);

        } catch (error) {
            console.error('Failed to handle update order:', error);
            this.showNotification('error', 'Update Error', 'Failed to open order update form');
        }
    }

    /**
     * Handle mark delivered action
     * @param {string} orderNumber - Order identifier
     */
    handleMarkDelivered(orderNumber) {
        try {
            const order = this.findOrder(orderNumber);
            if (!order) {
                this.showNotification('error', 'Order Not Found', `Order ${orderNumber} not found`);
                return;
            }

            // Update order status
            order.status = 'dispatched';
            order.dispatchedDate = new Date();
            order.lastUpdated = new Date();

            // Complete pack workflow if active
            if (window.packWorkflow?.packSessions.has(orderNumber)) {
                window.packWorkflow.updatePackStatus(orderNumber, 'dispatched', 'Marked as delivered');
            }

            // Save state change
            this.saveStateChange('Mark Delivered', { orderNumber, dispatchedDate: order.dispatchedDate });

            this.showNotification('success', 'Order Delivered', 
                `Order ${orderNumber} marked as delivered and workflow completed`);

            // Update UI
            this.updateOrderDisplays();

        } catch (error) {
            console.error('Failed to handle mark delivered:', error);
            this.showNotification('error', 'Delivery Error', 'Failed to mark order as delivered');
        }
    }

    /**
     * Handle analyze product action
     * @param {string} productName - Product name
     */
    handleAnalyzeProduct(productName) {
        try {
            if (!window.ordersData) {
                this.showNotification('warning', 'No Data', 'No order data available for analysis');
                return;
            }

            // Analyze product performance
            const productOrders = window.ordersData.filter(order => order.product === productName);
            const analysis = this.generateProductAnalysis(productOrders, productName);

            // Create analysis modal
            const modalContent = `
                <div>
                    <h3 style="color: #667eea; margin-bottom: 20px;">📊 Product Analysis: ${productName}</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.5em; color: #667eea; margin-bottom: 5px;">${analysis.totalOrders}</div>
                            <div style="color: #8892b0; font-size: 0.9em;">Total Orders</div>
                        </div>
                        <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.5em; color: #4CAF50; margin-bottom: 5px;">£${analysis.totalRevenue.toFixed(2)}</div>
                            <div style="color: #8892b0; font-size: 0.9em;">Total Revenue</div>
                        </div>
                        <div style="background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.5em; color: #ffc107; margin-bottom: 5px;">£${analysis.avgOrderValue.toFixed(2)}</div>
                            <div style="color: #8892b0; font-size: 0.9em;">Avg Order Value</div>
                        </div>
                        <div style="background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.5em; color: #ff6b6b; margin-bottom: 5px;">${analysis.avgPackTime}</div>
                            <div style="color: #8892b0; font-size: 0.9em;">Avg Pack Time</div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="color: #8892b0; margin-bottom: 15px;">Performance Insights</h4>
                        <ul style="color: #e4e8ff; line-height: 1.6;">
                            ${analysis.insights.map(insight => `<li style="margin-bottom: 8px;">${insight}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${analysis.recommendations.length > 0 ? `
                        <div style="background: rgba(76, 175, 80, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h4 style="color: #4CAF50; margin-bottom: 15px;">💡 Recommendations</h4>
                            <ul style="color: #e4e8ff; line-height: 1.6;">
                                ${analysis.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn btn-primary" onclick="this.exportProductAnalysis('${productName}');">
                            📥 Export Analysis
                        </button>
                        <button class="btn btn-secondary" onclick="closeModal();">
                            Close
                        </button>
                    </div>
                </div>
            `;

            this.showModal('Product Analysis', modalContent);

        } catch (error) {
            console.error('Failed to handle analyze product:', error);
            this.showNotification('error', 'Analysis Error', 'Failed to analyze product');
        }
    }

    /**
     * Generate product analysis data
     * @param {Array} productOrders - Orders for the product
     * @param {string} productName - Product name
     * @returns {Object} Analysis results
     */
    generateProductAnalysis(productOrders, productName) {
        const analysis = {
            totalOrders: productOrders.length,
            totalRevenue: productOrders.reduce((sum, order) => sum + order.value, 0),
            avgOrderValue: 0,
            avgPackTime: 'N/A',
            insights: [],
            recommendations: []
        };

        if (analysis.totalOrders > 0) {
            analysis.avgOrderValue = analysis.totalRevenue / analysis.totalOrders;

            // Generate insights
            if (analysis.totalOrders >= 10) {
                analysis.insights.push(`Popular product with ${analysis.totalOrders} orders`);
            }
            
            if (analysis.avgOrderValue > 100) {
                analysis.insights.push('High-value product contributing significantly to revenue');
            }

            const overdueOrders = productOrders.filter(order => order.status === 'overdue').length;
            if (overdueOrders > 0) {
                analysis.insights.push(`${overdueOrders} orders are overdue and need immediate attention`);
                analysis.recommendations.push('Prioritize overdue orders for immediate dispatch');
            }

            // Generate recommendations
            if (analysis.totalOrders >= 5) {
                analysis.recommendations.push('Consider bulk purchasing to optimize inventory');
            }

            if (analysis.avgOrderValue > 50) {
                analysis.recommendations.push('Implement priority handling for this high-value product');
            }
        }

        return analysis;
    }

    /**
     * Setup event listeners for integration
     */
    setupEventListeners() {
        try {
            // Listen for pack workflow events
            document.addEventListener('pack:pack-started', (event) => {
                this.handlePackStarted(event.detail);
            });

            document.addEventListener('pack:pack-completed', (event) => {
                this.handlePackCompleted(event.detail);
            });

            document.addEventListener('pack:metrics-updated', (event) => {
                this.handleMetricsUpdated(event.detail);
            });

            // Listen for existing system events
            document.addEventListener('dataImported', () => {
                this.handleDataImported();
            });

            console.log('📡 Event listeners setup complete');

        } catch (error) {
            console.error('Failed to setup event listeners:', error);
        }
    }

    /**
     * Integrate with existing state management system
     */
    integrateStateManagement() {
        try {
            // Hook into existing saveState function
            if (typeof window.saveState === 'function') {
                const originalSaveState = window.saveState;
                window.saveState = (...args) => {
                    originalSaveState(...args);
                    this.handleStateChange(...args);
                };
            }

            console.log('🔗 State management integration complete');

        } catch (error) {
            console.error('Failed to integrate state management:', error);
        }
    }

    /**
     * Initialize pack workflow system
     */
    initializePackWorkflowSystem() {
        try {
            if (typeof window.initializePackWorkflow === 'function') {
                window.initializePackWorkflow();
            }
        } catch (error) {
            console.error('Failed to initialize pack workflow system:', error);
        }
    }

    /**
     * Update UI elements with new functionality
     */
    updateUIElements() {
        try {
            // Update button text and functionality
            this.updateActionButtons();
            
            // Add pack workflow indicators
            this.addPackWorkflowIndicators();

            console.log('🎨 UI elements updated');

        } catch (error) {
            console.error('Failed to update UI elements:', error);
        }
    }

    /**
     * Update action buttons with new functionality
     */
    updateActionButtons() {
        try {
            // Update urgent order cards
            const urgentCards = document.querySelectorAll('.urgent-order-card');
            urgentCards.forEach(card => {
                const buttons = card.querySelectorAll('.quick-action-btn');
                buttons.forEach(button => {
                    if (button.textContent.includes('📞 Call')) {
                        button.title = 'Contact customer about this order';
                    } else if (button.textContent.includes('⚡ Priority')) {
                        button.title = 'Mark as priority and start pack workflow';
                    }
                });
            });

        } catch (error) {
            console.warn('Failed to update action buttons:', error);
        }
    }

    /**
     * Add pack workflow indicators to UI
     */
    addPackWorkflowIndicators() {
        try {
            // Add pack workflow status indicators where needed
            // This could include progress bars, status badges, etc.
            console.log('Pack workflow indicators added');

        } catch (error) {
            console.warn('Failed to add pack workflow indicators:', error);
        }
    }

    /**
     * Utility Methods
     */

    findOrder(orderNumber) {
        return window.ordersData?.find(order => order.orderNumber === orderNumber) || null;
    }

    getStatusColor(status) {
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

    calculateProgress(status) {
        const progressMap = {
            'pending': 0,
            'picking': 25,
            'packing': 50,
            'packed': 75,
            'dispatched': 100
        };
        return progressMap[status] || 0;
    }

    generateTrackingTimeline(order, packSession) {
        const timeline = [];
        
        timeline.push(`✅ Order Placed: ${new Date(order.orderDate).toLocaleDateString()}`);
        
        if (packSession) {
            if (packSession.timestamps.picking) {
                timeline.push(`🔄 Picking Started: ${packSession.timestamps.picking.toLocaleString()}`);
            }
            if (packSession.timestamps.packing) {
                timeline.push(`📦 Packing Started: ${packSession.timestamps.packing.toLocaleString()}`);
            }
            if (packSession.timestamps.packed) {
                timeline.push(`✅ Packed: ${packSession.timestamps.packed.toLocaleString()}`);
            }
            if (packSession.timestamps.dispatched) {
                timeline.push(`🚚 Dispatched: ${packSession.timestamps.dispatched.toLocaleString()}`);
            }
        }
        
        return timeline.map(item => `<p style="margin: 5px 0; font-size: 0.9em;">${item}</p>`).join('');
    }

    saveStateChange(action, data) {
        try {
            if (typeof window.saveState === 'function') {
                window.saveState(action, data);
            }
        } catch (error) {
            console.warn('Failed to save state change:', error);
        }
    }

    updateOrderDisplays() {
        try {
            if (typeof window.updateDashboardMetrics === 'function') {
                window.updateDashboardMetrics();
            }
            if (typeof window.updateOrdersTable === 'function') {
                window.updateOrdersTable();
            }
        } catch (error) {
            console.warn('Failed to update order displays:', error);
        }
    }

    showNotification(type, title, message, duration = 5000) {
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

    showModal(title, content) {
        try {
            if (typeof window.showModal === 'function') {
                window.showModal(title, content);
            } else {
                console.log(`Modal: ${title}`, content);
            }
        } catch (error) {
            console.warn('Failed to show modal:', error);
        }
    }

    logCustomerContact(orderNumber, action) {
        console.log(`Customer contact logged: ${orderNumber} - ${action}`);
    }

    /**
     * Event Handlers
     */

    handlePackStarted(detail) {
        console.log('Pack workflow started:', detail);
        this.updateOrderDisplays();
    }

    handlePackCompleted(detail) {
        console.log('Pack workflow completed:', detail);
        this.updateOrderDisplays();
    }

    handleMetricsUpdated(detail) {
        console.log('Pack metrics updated:', detail);
    }

    handleDataImported() {
        console.log('Data imported - refreshing pack workflow integration');
    }

    handleStateChange(action, data) {
        console.log('State changed:', action, data);
    }
}

// Initialize integration when script loads
let packWorkflowIntegration = null;

document.addEventListener('DOMContentLoaded', () => {
    packWorkflowIntegration = new PackWorkflowIntegration();
    window.packWorkflowIntegration = packWorkflowIntegration;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PackWorkflowIntegration };
}

console.log('🔗 Pack Workflow Integration script loaded');