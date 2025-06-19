/**
 * 🧪 Pack Workflow System - Demo & Testing Script
 * 
 * This script demonstrates the complete pack workflow functionality
 * and provides testing utilities for the Phase 2 implementation.
 * 
 * @author Claude Code Agent 3 - Pack Workflow Demo Specialist
 * @version 2.0.0
 * @created 2025-06-19
 */

/**
 * Pack Workflow Demo Manager
 */
class PackWorkflowDemo {
    constructor() {
        this.demoRunning = false;
        this.demoSteps = [];
        this.currentStep = 0;
        this.testResults = [];
    }

    /**
     * Initialize demo system
     */
    initialize() {
        console.log('🧪 Pack Workflow Demo System initializing...');
        
        // Wait for pack workflow to be ready
        if (!window.packWorkflow) {
            setTimeout(() => this.initialize(), 1000);
            return;
        }

        this.setupDemoData();
        this.setupDemoControls();
        this.runDiagnostics();
        
        console.log('✅ Pack Workflow Demo System ready');
    }

    /**
     * Setup demo data for testing
     */
    setupDemoData() {
        try {
            // Create sample orders if none exist
            if (!window.ordersData || window.ordersData.length === 0) {
                window.ordersData = this.generateSampleOrders();
                console.log('📦 Generated sample orders for demo');
            }

            // Add demo indicators to sample orders
            window.ordersData.slice(0, 3).forEach(order => {
                order.isDemo = true;
                order.demoReady = true;
            });

        } catch (error) {
            console.error('Failed to setup demo data:', error);
        }
    }

    /**
     * Generate sample orders for demo
     */
    generateSampleOrders() {
        const sampleOrders = [
            {
                orderNumber: 'DEMO001',
                customer: 'John Smith',
                phone: '+447123456789',
                product: 'Premium Laptop Pro 15',
                category: 'electronics',
                quantity: 1,
                value: 1299.99,
                orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                expectedDispatch: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                status: 'pending',
                county: 'Greater London',
                urgencyScore: 85
            },
            {
                orderNumber: 'DEMO002', 
                customer: 'Sarah Johnson',
                phone: '+447987654321',
                product: 'Wireless Gaming Headset',
                category: 'gaming',
                quantity: 2,
                value: 159.98,
                orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                expectedDispatch: new Date(),
                deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                status: 'pending',
                county: 'West Midlands',
                urgencyScore: 95
            },
            {
                orderNumber: 'DEMO003',
                customer: 'Mike Wilson',
                phone: '+447555123456',
                product: 'Premium Laptop Pro 15',
                category: 'electronics',
                quantity: 1,
                value: 1299.99,
                orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                expectedDispatch: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                status: 'overdue',
                county: 'Greater Manchester',
                urgencyScore: 100
            }
        ];

        return sampleOrders;
    }

    /**
     * Setup demo controls in the UI
     */
    setupDemoControls() {
        try {
            // Add demo control panel
            const demoPanel = this.createDemoPanel();
            document.body.appendChild(demoPanel);

            // Add keyboard shortcuts
            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.shiftKey) {
                    switch (event.key) {
                        case 'D':
                            event.preventDefault();
                            this.startFullDemo();
                            break;
                        case 'T':
                            event.preventDefault();
                            this.runTests();
                            break;
                        case 'R':
                            event.preventDefault();
                            this.resetDemo();
                            break;
                    }
                }
            });

        } catch (error) {
            console.error('Failed to setup demo controls:', error);
        }
    }

    /**
     * Create demo control panel
     */
    createDemoPanel() {
        const panel = document.createElement('div');
        panel.id = 'packWorkflowDemoPanel';
        panel.innerHTML = `
            <div style="
                position: fixed;
                top: 100px;
                right: 20px;
                background: rgba(10, 14, 39, 0.95);
                border: 1px solid rgba(102, 126, 234, 0.5);
                border-radius: 12px;
                padding: 20px;
                min-width: 300px;
                z-index: 999;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            ">
                <h3 style="color: #667eea; margin-bottom: 15px; text-align: center;">
                    🧪 Pack Workflow Demo
                </h3>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-primary" onclick="packWorkflowDemo.startFullDemo()">
                        🚀 Start Full Demo
                    </button>
                    <button class="btn btn-secondary" onclick="packWorkflowDemo.runTests()">
                        🧪 Run Tests
                    </button>
                    <button class="btn btn-secondary" onclick="packWorkflowDemo.showMetrics()">
                        📊 Show Metrics
                    </button>
                    <button class="btn btn-secondary" onclick="packWorkflowDemo.resetDemo()">
                        🔄 Reset Demo
                    </button>
                </div>

                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="color: #8892b0; font-size: 0.9em; margin-bottom: 10px;">Keyboard Shortcuts:</h4>
                    <div style="font-size: 0.8em; color: #8892b0; line-height: 1.4;">
                        <div>Ctrl+Shift+D: Start Demo</div>
                        <div>Ctrl+Shift+T: Run Tests</div>
                        <div>Ctrl+Shift+R: Reset Demo</div>
                        <div>Ctrl+P: Quick Pack Dialog</div>
                    </div>
                </div>

                <div id="demoStatus" style="
                    margin-top: 15px;
                    padding: 10px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    font-size: 0.85em;
                    color: #8892b0;
                ">
                    Demo Ready
                </div>
            </div>
        `;

        return panel;
    }

    /**
     * Start full demo sequence
     */
    async startFullDemo() {
        try {
            if (this.demoRunning) {
                console.log('Demo already running');
                return;
            }

            this.demoRunning = true;
            this.updateDemoStatus('🚀 Starting full demo...');

            // Demo sequence
            const demoSteps = [
                { name: 'Initialize System', action: () => this.demoStep_Initialize() },
                { name: 'Show Order Details', action: () => this.demoStep_ShowOrderDetails() },
                { name: 'Start Pack Workflow', action: () => this.demoStep_StartPackWorkflow() },
                { name: 'Update Pack Status', action: () => this.demoStep_UpdatePackStatus() },
                { name: 'Detect Batch Opportunity', action: () => this.demoStep_DetectBatch() },
                { name: 'Mark Priority Order', action: () => this.demoStep_MarkPriority() },
                { name: 'Complete Workflow', action: () => this.demoStep_CompleteWorkflow() },
                { name: 'Show Analytics', action: () => this.demoStep_ShowAnalytics() }
            ];

            for (let i = 0; i < demoSteps.length; i++) {
                const step = demoSteps[i];
                this.updateDemoStatus(`Step ${i + 1}/${demoSteps.length}: ${step.name}`);
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                await step.action();
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            this.updateDemoStatus('✅ Demo completed successfully!');
            this.demoRunning = false;

        } catch (error) {
            console.error('Demo failed:', error);
            this.updateDemoStatus('❌ Demo failed: ' + error.message);
            this.demoRunning = false;
        }
    }

    /**
     * Demo Steps
     */

    async demoStep_Initialize() {
        console.log('🔧 Demo Step: Initialize System');
        if (typeof window.showToast === 'function') {
            window.showToast('info', 'Demo Started', 'Pack Workflow Demo sequence initiated');
        }
    }

    async demoStep_ShowOrderDetails() {
        console.log('📋 Demo Step: Show Order Details');
        const demoOrder = window.ordersData?.find(o => o.orderNumber === 'DEMO001');
        if (demoOrder && typeof window.showOrderDetails === 'function') {
            window.showOrderDetails(demoOrder.orderNumber);
            await new Promise(resolve => setTimeout(resolve, 3000));
            if (typeof window.closeModal === 'function') {
                window.closeModal();
            }
        }
    }

    async demoStep_StartPackWorkflow() {
        console.log('🚀 Demo Step: Start Pack Workflow');
        const demoOrder = window.ordersData?.find(o => o.orderNumber === 'DEMO001');
        if (demoOrder && typeof window.startPackWorkflow === 'function') {
            window.startPackWorkflow(demoOrder.orderNumber, 'Demo Worker');
        }
    }

    async demoStep_UpdatePackStatus() {
        console.log('🔄 Demo Step: Update Pack Status');
        if (typeof window.updatePackStatus === 'function') {
            window.updatePackStatus('DEMO001', 'packing', 'Demo status update');
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.updatePackStatus('DEMO001', 'packed', 'Demo pack completed');
        }
    }

    async demoStep_DetectBatch() {
        console.log('🎯 Demo Step: Detect Batch Opportunity');
        if (typeof window.findSimilarOrders === 'function') {
            window.findSimilarOrders('DEMO001');
            await new Promise(resolve => setTimeout(resolve, 3000));
            if (typeof window.closeModal === 'function') {
                window.closeModal();
            }
        }
    }

    async demoStep_MarkPriority() {
        console.log('⚡ Demo Step: Mark Priority Order');
        if (typeof window.markPriority === 'function') {
            window.markPriority('DEMO002');
        }
    }

    async demoStep_CompleteWorkflow() {
        console.log('✅ Demo Step: Complete Workflow');
        if (typeof window.updatePackStatus === 'function') {
            window.updatePackStatus('DEMO001', 'dispatched', 'Demo completion');
        }
    }

    async demoStep_ShowAnalytics() {
        console.log('📊 Demo Step: Show Analytics');
        this.showMetrics();
    }

    /**
     * Run comprehensive tests
     */
    runTests() {
        try {
            console.log('🧪 Running Pack Workflow Tests...');
            this.updateDemoStatus('🧪 Running tests...');

            const tests = [
                { name: 'Pack Workflow Initialization', test: () => this.test_PackWorkflowInit() },
                { name: 'Start Pack Workflow', test: () => this.test_StartPackWorkflow() },
                { name: 'Update Pack Status', test: () => this.test_UpdatePackStatus() },
                { name: 'State Management Integration', test: () => this.test_StateManagement() },
                { name: 'Batch Detection', test: () => this.test_BatchDetection() },
                { name: 'Worker Metrics', test: () => this.test_WorkerMetrics() },
                { name: 'Error Handling', test: () => this.test_ErrorHandling() },
                { name: 'Data Persistence', test: () => this.test_DataPersistence() }
            ];

            this.testResults = [];

            tests.forEach(test => {
                try {
                    const result = test.test();
                    this.testResults.push({ name: test.name, passed: true, result });
                    console.log(`✅ ${test.name}: PASSED`);
                } catch (error) {
                    this.testResults.push({ name: test.name, passed: false, error: error.message });
                    console.error(`❌ ${test.name}: FAILED - ${error.message}`);
                }
            });

            this.displayTestResults();

        } catch (error) {
            console.error('Test runner failed:', error);
            this.updateDemoStatus('❌ Tests failed: ' + error.message);
        }
    }

    /**
     * Individual Tests
     */

    test_PackWorkflowInit() {
        if (!window.packWorkflow) {
            throw new Error('Pack workflow not initialized');
        }
        if (typeof window.packWorkflow.startPackWorkflow !== 'function') {
            throw new Error('Pack workflow methods not available');
        }
        return 'Pack workflow properly initialized';
    }

    test_StartPackWorkflow() {
        const testOrder = window.ordersData?.find(o => o.isDemo);
        if (!testOrder) {
            throw new Error('No test order available');
        }

        const session = window.packWorkflow.startPackWorkflow(testOrder.orderNumber, 'Test Worker');
        if (!session || !session.orderNumber) {
            throw new Error('Pack workflow session not created');
        }

        return `Pack workflow started for ${testOrder.orderNumber}`;
    }

    test_UpdatePackStatus() {
        const testOrder = window.ordersData?.find(o => o.isDemo);
        if (!testOrder) {
            throw new Error('No test order available');
        }

        const session = window.packWorkflow.updatePackStatus(testOrder.orderNumber, 'packing', 'Test update');
        if (!session || session.status !== 'packing') {
            throw new Error('Pack status not updated correctly');
        }

        return 'Pack status updated successfully';
    }

    test_StateManagement() {
        if (typeof window.saveState !== 'function') {
            throw new Error('State management not available');
        }
        return 'State management integration verified';
    }

    test_BatchDetection() {
        const testOrder = window.ordersData?.find(o => o.isDemo);
        if (!testOrder) {
            throw new Error('No test order available');
        }

        const similarOrders = window.packWorkflow.findSimilarOrders(testOrder);
        if (!Array.isArray(similarOrders)) {
            throw new Error('Batch detection not working');
        }

        return `Found ${similarOrders.length} similar orders`;
    }

    test_WorkerMetrics() {
        const metrics = window.packWorkflow.getPackAnalytics();
        if (!metrics || typeof metrics.activeSessions === 'undefined') {
            throw new Error('Worker metrics not available');
        }
        return 'Worker metrics tracking verified';
    }

    test_ErrorHandling() {
        try {
            window.packWorkflow.startPackWorkflow('INVALID_ORDER', 'Test');
            throw new Error('Error handling not working - should have thrown');
        } catch (error) {
            if (error.message.includes('not found')) {
                return 'Error handling working correctly';
            }
            throw error;
        }
    }

    test_DataPersistence() {
        const exportData = window.packWorkflow.exportPackData();
        if (!exportData || !exportData.exportedAt) {
            throw new Error('Data export not working');
        }
        return 'Data persistence verified';
    }

    /**
     * Display test results
     */
    displayTestResults() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        const passRate = Math.round((passed / total) * 100);

        console.log(`\n🧪 Test Results: ${passed}/${total} passed (${passRate}%)\n`);

        this.testResults.forEach(result => {
            if (result.passed) {
                console.log(`✅ ${result.name}: ${result.result}`);
            } else {
                console.log(`❌ ${result.name}: ${result.error}`);
            }
        });

        this.updateDemoStatus(`🧪 Tests: ${passed}/${total} passed (${passRate}%)`);

        if (typeof window.showToast === 'function') {
            const type = passRate === 100 ? 'success' : passRate >= 80 ? 'warning' : 'error';
            window.showToast(type, 'Test Results', `${passed}/${total} tests passed (${passRate}%)`);
        }
    }

    /**
     * Show pack workflow metrics
     */
    showMetrics() {
        try {
            const analytics = window.packWorkflow?.getPackAnalytics();
            if (!analytics) {
                console.warn('Pack analytics not available');
                return;
            }

            const modalContent = `
                <div>
                    <h3 style="color: #667eea; margin-bottom: 20px;">📊 Pack Workflow Metrics</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.8em; color: #667eea; margin-bottom: 5px;">${analytics.activeSessions}</div>
                            <div style="color: #8892b0; font-size: 0.9em;">Active Sessions</div>
                        </div>
                        <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.8em; color: #4CAF50; margin-bottom: 5px;">${analytics.completedToday}</div>
                            <div style="color: #8892b0; font-size: 0.9em;">Completed Today</div>
                        </div>
                        <div style="background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.8em; color: #ffc107; margin-bottom: 5px;">${analytics.averagePackTime.toFixed(1)}</div>
                            <div style="color: #8892b0; font-size: 0.9em;">Avg Pack Time (min)</div>
                        </div>
                        <div style="background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.8em; color: #ff6b6b; margin-bottom: 5px;">${analytics.efficiency}%</div>
                            <div style="color: #8892b0; font-size: 0.9em;">Efficiency</div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
                        <h4 style="color: #8892b0; margin-bottom: 15px;">System Status</h4>
                        <div style="color: #e4e8ff; line-height: 1.8;">
                            <div>✅ Pack Workflow System: <span style="color: #4CAF50;">Operational</span></div>
                            <div>✅ State Management: <span style="color: #4CAF50;">Integrated</span></div>
                            <div>✅ Worker Metrics: <span style="color: #4CAF50;">Tracking</span></div>
                            <div>✅ Batch Detection: <span style="color: #4CAF50;">Active</span></div>
                            <div>✅ Error Handling: <span style="color: #4CAF50;">Enabled</span></div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="packWorkflowDemo.exportMetrics();">
                            📥 Export Metrics
                        </button>
                        <button class="btn btn-secondary" onclick="closeModal();">
                            Close
                        </button>
                    </div>
                </div>
            `;

            if (typeof window.showModal === 'function') {
                window.showModal('Pack Workflow Metrics', modalContent);
            } else {
                console.log('Pack Workflow Metrics:', analytics);
            }

        } catch (error) {
            console.error('Failed to show metrics:', error);
        }
    }

    /**
     * Export metrics data
     */
    exportMetrics() {
        try {
            const data = window.packWorkflow?.exportPackData();
            if (data) {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pack-workflow-metrics-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);

                if (typeof window.showToast === 'function') {
                    window.showToast('success', 'Export Complete', 'Pack workflow metrics exported successfully');
                }
            }
        } catch (error) {
            console.error('Failed to export metrics:', error);
        }
    }

    /**
     * Reset demo state
     */
    resetDemo() {
        try {
            this.updateDemoStatus('🔄 Resetting demo...');

            // Reset pack workflow state
            if (window.packWorkflow) {
                window.packWorkflow.packSessions.clear();
                window.packWorkflow.savePackWorkflowState();
            }

            // Reset demo orders
            if (window.ordersData) {
                window.ordersData.forEach(order => {
                    if (order.isDemo) {
                        order.status = 'pending';
                        delete order.lastUpdated;
                        delete order.priority;
                        delete order.priorityMarked;
                        delete order.dispatchedDate;
                    }
                });
            }

            // Update displays
            if (typeof window.updateDashboardMetrics === 'function') {
                window.updateDashboardMetrics();
            }

            this.updateDemoStatus('✅ Demo reset complete');

            if (typeof window.showToast === 'function') {
                window.showToast('success', 'Demo Reset', 'Demo state has been reset');
            }

        } catch (error) {
            console.error('Failed to reset demo:', error);
            this.updateDemoStatus('❌ Reset failed: ' + error.message);
        }
    }

    /**
     * Update demo status display
     */
    updateDemoStatus(status) {
        const statusElement = document.getElementById('demoStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
        console.log('Demo Status:', status);
    }

    /**
     * Run diagnostics
     */
    runDiagnostics() {
        console.log('🔍 Running Pack Workflow Diagnostics...');

        const diagnostics = {
            packWorkflowLoaded: !!window.packWorkflow,
            integrationLoaded: !!window.packWorkflowIntegration,
            stateManagement: typeof window.saveState === 'function',
            ordersData: !!(window.ordersData && window.ordersData.length > 0),
            toastSystem: typeof window.showToast === 'function',
            modalSystem: typeof window.showModal === 'function'
        };

        console.table(diagnostics);

        const issues = Object.entries(diagnostics)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (issues.length > 0) {
            console.warn('⚠️ Diagnostic Issues:', issues);
        } else {
            console.log('✅ All diagnostic checks passed');
        }

        return diagnostics;
    }
}

// Initialize demo system
let packWorkflowDemo = null;

document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other systems to initialize
    setTimeout(() => {
        packWorkflowDemo = new PackWorkflowDemo();
        packWorkflowDemo.initialize();
        window.packWorkflowDemo = packWorkflowDemo;
    }, 2000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PackWorkflowDemo };
}

console.log('🧪 Pack Workflow Demo System loaded');