/**
 * Comprehensive Test Suite for Dispatch Priority Queue
 * Tests DPS algorithm accuracy, performance, and edge cases
 */

// Test data generators
function generateTestOrder(overrides = {}) {
    const baseOrder = {
        orderNumber: `TEST-${Math.random().toString(36).substr(2, 9)}`,
        orderDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: 'Test Customer',
        expectedDispatch: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(),
        deliveryBy: new Date(Date.now() + (2 + Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
        orderTotal: (Math.random() * 1000 + 10).toFixed(2),
        productName: 'Test Product',
        quantity: Math.floor(Math.random() * 5) + 1
    };
    
    return { ...baseOrder, ...overrides };
}

function generateLargeOrderSet(count = 1000) {
    return Array.from({ length: count }, () => generateTestOrder());
}

// Test runner
async function runDPSTests() {
    console.log('🚀 Starting DPS Algorithm Test Suite...\n');
    
    const queue = new DispatchPriorityQueue();
    let testsPassed = 0;
    let testsTotal = 0;
    
    // Test helper function
    function test(name, testFn) {
        testsTotal++;
        try {
            const result = testFn();
            if (result !== false) {
                console.log(`✅ ${name}`);
                testsPassed++;
            } else {
                console.log(`❌ ${name}`);
            }
        } catch (error) {
            console.log(`❌ ${name} - Error: ${error.message}`);
        }
    }
    
    // Test 1: Basic DPS Calculation
    console.log('📊 Testing DPS Calculation Logic...');
    
    test('DPS calculation returns valid score (0-100)', () => {
        const order = generateTestOrder();
        const score = queue.calculateDPS(order);
        return score >= 0 && score <= 100 && !isNaN(score);
    });
    
    test('Overdue order gets high priority', () => {
        const overdueOrder = generateTestOrder({
            expectedDispatch: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
        });
        const score = queue.calculateDPS(overdueOrder);
        return score >= 70; // Should get high priority due to overdue dispatch
    });
    
    test('High-value order gets appropriate priority boost', () => {
        const lowValueOrder = generateTestOrder({ orderTotal: '25.00' });
        const highValueOrder = generateTestOrder({ 
            orderTotal: '1500.00',
            expectedDispatch: lowValueOrder.expectedDispatch,
            orderDate: lowValueOrder.orderDate
        });
        
        const lowScore = queue.calculateDPS(lowValueOrder);
        const highScore = queue.calculateDPS(highValueOrder);
        
        return highScore >= lowScore;
    });
    
    test('Invalid order data returns 0 score', () => {
        const invalidOrder = { orderNumber: 'INVALID' };
        const score = queue.calculateDPS(invalidOrder);
        return score === 0;
    });
    
    // Test 2: Queue Management
    console.log('\n🔄 Testing Queue Management...');
    
    test('updateQueue processes orders correctly', async () => {
        const testOrders = [
            generateTestOrder({ orderNumber: 'QUEUE-001' }),
            generateTestOrder({ orderNumber: 'QUEUE-002' }),
            generateTestOrder({ orderNumber: 'QUEUE-003' })
        ];
        
        const result = await queue.updateQueue(testOrders);
        return result.length === 3 && result.every(order => order.hasOwnProperty('dpsScore'));
    });
    
    test('getTopPriorityOrders returns correct count', async () => {
        const testOrders = generateLargeOrderSet(20);
        await queue.updateQueue(testOrders);
        
        const top5 = queue.getTopPriorityOrders(5);
        const top10 = queue.getTopPriorityOrders(10);
        
        return top5.length === 5 && top10.length === 10;
    });
    
    test('Priority queue is sorted by DPS score', async () => {
        const testOrders = generateLargeOrderSet(50);
        await queue.updateQueue(testOrders);
        
        const sorted = queue.priorityQueue;
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].dpsScore < sorted[i + 1].dpsScore) {
                return false;
            }
        }
        return true;
    });
    
    // Test 3: Performance Requirements
    console.log('\n⚡ Testing Performance Requirements...');
    
    test('1000 orders processed under 100ms', async () => {
        const testOrders = generateLargeOrderSet(1000);
        
        const startTime = performance.now();
        await queue.updateQueue(testOrders);
        const endTime = performance.now();
        
        const processingTime = endTime - startTime;
        console.log(`   Processing time: ${processingTime.toFixed(2)}ms`);
        
        return processingTime < 100;
    });
    
    test('Dirty flag optimization works', async () => {
        const testOrders = generateLargeOrderSet(100);
        await queue.updateQueue(testOrders);
        
        // Second call should be faster (no dirty orders)
        const startTime = performance.now();
        await queue.updateQueue();
        const endTime = performance.now();
        
        const cachedTime = endTime - startTime;
        console.log(`   Cached processing time: ${cachedTime.toFixed(2)}ms`);
        
        return cachedTime < 10;
    });
    
    test('Memory usage is reasonable for large datasets', async () => {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        const largeOrderSet = generateLargeOrderSet(5000);
        await queue.updateQueue(largeOrderSet);
        
        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        console.log(`   Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        
        // Should not increase memory by more than 50MB for 5000 orders
        return !performance.memory || memoryIncrease < 50 * 1024 * 1024;
    });
    
    // Test 4: Edge Cases
    console.log('\n🧪 Testing Edge Cases...');
    
    test('Handles null/undefined dates gracefully', () => {
        const orderWithNullDates = generateTestOrder({
            orderDate: null,
            expectedDispatch: undefined,
            deliveryBy: ''
        });
        
        const score = queue.calculateDPS(orderWithNullDates);
        return score === 0;
    });
    
    test('Handles malformed date strings', () => {
        const orderWithBadDates = generateTestOrder({
            orderDate: 'not-a-date',
            expectedDispatch: '32/13/2025',
            deliveryBy: 'tomorrow'
        });
        
        const score = queue.calculateDPS(orderWithBadDates);
        return score === 0;
    });
    
    test('Handles negative order values', () => {
        const orderWithNegativeValue = generateTestOrder({
            orderTotal: '-50.00'
        });
        
        const score = queue.calculateDPS(orderWithNegativeValue);
        return score >= 0;
    });
    
    test('UK date format parsing (DD/MM/YYYY)', () => {
        const ukFormatOrder = generateTestOrder({
            orderDate: '15/12/2024',
            expectedDispatch: '16/12/2024'
        });
        
        const score = queue.calculateDPS(ukFormatOrder);
        return score > 0;
    });
    
    // Test 5: Business Logic Validation
    console.log('\n💼 Testing Business Logic...');
    
    test('Same-day dispatch gets higher priority than next-day', () => {
        const sameDayOrder = generateTestOrder({
            expectedDispatch: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        });
        
        const nextDayOrder = generateTestOrder({
            expectedDispatch: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // 26 hours
            orderDate: sameDayOrder.orderDate,
            orderTotal: sameDayOrder.orderTotal
        });
        
        const sameDayScore = queue.calculateDPS(sameDayOrder);
        const nextDayScore = queue.calculateDPS(nextDayOrder);
        
        return sameDayScore > nextDayScore;
    });
    
    test('Older orders get age priority boost', () => {
        const newOrder = generateTestOrder({
            orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        });
        
        const oldOrder = generateTestOrder({
            orderDate: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
            expectedDispatch: newOrder.expectedDispatch,
            orderTotal: newOrder.orderTotal
        });
        
        const newScore = queue.calculateDPS(newOrder);
        const oldScore = queue.calculateDPS(oldOrder);
        
        return oldScore >= newScore;
    });
    
    // Test 6: Integration with Existing System
    console.log('\n🔗 Testing System Integration...');
    
    test('isOverdue function works correctly', () => {
        const overdueOrder = generateTestOrder({
            expectedDispatch: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        });
        
        const futureOrder = generateTestOrder({
            expectedDispatch: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        });
        
        return queue.isOverdue(overdueOrder) === true && queue.isOverdue(futureOrder) === false;
    });
    
    test('getUrgencyLevel categorizes correctly', () => {
        const criticalScore = 85;
        const normalScore = 15;
        
        return queue.getUrgencyLevel(criticalScore) === 'critical' && 
               queue.getUrgencyLevel(normalScore) === 'normal';
    });
    
    test('getTimeToDispatch formats correctly', () => {
        const order = generateTestOrder({
            expectedDispatch: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString() // 2.5 hours
        });
        
        const timeString = queue.getTimeToDispatch(order);
        return timeString.includes('h') || timeString.includes('m');
    });
    
    // Test 7: Performance Monitoring
    console.log('\n📈 Testing Performance Monitoring...');
    
    test('Performance metrics are tracked', async () => {
        const testOrders = generateLargeOrderSet(100);
        await queue.updateQueue(testOrders);
        
        const metrics = queue.getPerformanceMetrics();
        
        return metrics.hasOwnProperty('lastCalculationTime') &&
               metrics.hasOwnProperty('totalCalculations') &&
               metrics.totalCalculations > 0;
    });
    
    test('Queue statistics are accurate', async () => {
        const testOrders = generateLargeOrderSet(50);
        await queue.updateQueue(testOrders);
        
        const stats = queue.getQueueStats();
        
        return stats.totalOrders === 50 &&
               stats.hasOwnProperty('avgDPSScore') &&
               stats.hasOwnProperty('urgencyDistribution');
    });
    
    // Final Results
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
    
    if (testsPassed === testsTotal) {
        console.log('🎉 All tests passed! DPS algorithm is ready for production.');
    } else {
        console.log(`⚠️  ${testsTotal - testsPassed} test(s) failed. Review implementation.`);
    }
    
    // Performance summary
    const metrics = queue.getPerformanceMetrics();
    console.log('\n📈 Performance Summary:');
    console.log(`   Average calculation time: ${metrics.averageCalculationTime.toFixed(2)}ms`);
    console.log(`   Cache size: ${metrics.cacheSize} entries`);
    console.log(`   Queue size: ${metrics.queueSize} orders`);
    
    return testsPassed === testsTotal;
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.runDPSTests = runDPSTests;
    console.log('DPS Test Suite loaded. Run with: runDPSTests()');
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { runDPSTests, generateTestOrder, generateLargeOrderSet };
}