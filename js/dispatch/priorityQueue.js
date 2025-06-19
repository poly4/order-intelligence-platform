/**
 * Dispatch Priority Score (DPS) Algorithm & Queue Management System
 * Order Intelligence Platform - Phase 2
 * 
 * Core algorithm for intelligent dispatch queue management with real-time priority scoring.
 * Performance optimized for 1000+ orders with dirty flag pattern and efficient sorting.
 */

class DispatchPriorityQueue {
    constructor() {
        // DPS Algorithm Weights (must sum to 1.0)
        this.DPS_WEIGHTS = {
            dispatchDeadline: 0.60,  // Time until Expected Dispatch (highest priority)
            deliveryPromise: 0.20,   // Delivery By - Order Date window
            orderAge: 0.10,          // Time since Order Date
            orderValue: 0.10         // Order Total amount
        };

        // Queue state management
        this.orders = [];
        this.priorityQueue = [];
        this.dirtyOrders = new Set();
        this.lastCalculation = null;
        this.isCalculating = false;

        // Performance tracking
        this.performanceMetrics = {
            lastCalculationTime: 0,
            totalCalculations: 0,
            averageCalculationTime: 0
        };

        // Cache for expensive calculations
        this.calculationCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Calculate Dispatch Priority Score for a single order
     * @param {Object} order - Order object with required fields
     * @returns {number} DPS score (0-100 scale)
     */
    calculateDPS(order) {
        try {
            // Validate required fields
            if (!this.validateOrderForDPS(order)) {
                console.warn(`Order ${order.orderNumber} missing required fields for DPS calculation`);
                return 0;
            }

            const now = new Date();
            const cacheKey = this.getCacheKey(order, now);

            // Check cache first
            if (this.calculationCache.has(cacheKey)) {
                const cached = this.calculationCache.get(cacheKey);
                if (now.getTime() - cached.timestamp < this.cacheExpiry) {
                    return cached.score;
                }
            }

            // Parse dates with error handling
            const orderDate = this.parseDate(order.orderDate);
            const expectedDispatch = this.parseDate(order.expectedDispatch);
            const deliveryBy = this.parseDate(order.deliveryBy);
            const orderValue = parseFloat(order.orderTotal) || 0;

            if (!orderDate || !expectedDispatch) {
                console.warn(`Order ${order.orderNumber} has invalid dates`);
                return 0;
            }

            // Calculate individual score components (0-100 scale each)
            const dispatchDeadlineScore = this.calculateDispatchDeadlineScore(now, expectedDispatch);
            const deliveryPromiseScore = this.calculateDeliveryPromiseScore(orderDate, deliveryBy);
            const orderAgeScore = this.calculateOrderAgeScore(now, orderDate);
            const orderValueScore = this.calculateOrderValueScore(orderValue);

            // Calculate weighted DPS score
            const dpsScore = (
                (dispatchDeadlineScore * this.DPS_WEIGHTS.dispatchDeadline) +
                (deliveryPromiseScore * this.DPS_WEIGHTS.deliveryPromise) +
                (orderAgeScore * this.DPS_WEIGHTS.orderAge) +
                (orderValueScore * this.DPS_WEIGHTS.orderValue)
            );

            // Clamp to 0-100 range
            const finalScore = Math.max(0, Math.min(100, Math.round(dpsScore * 100) / 100));

            // Cache the result
            this.calculationCache.set(cacheKey, {
                score: finalScore,
                timestamp: now.getTime()
            });

            return finalScore;

        } catch (error) {
            console.error(`Error calculating DPS for order ${order.orderNumber}:`, error);
            return 0;
        }
    }

    /**
     * Calculate dispatch deadline component score (60% weight)
     * Higher score = closer to deadline = higher priority
     */
    calculateDispatchDeadlineScore(now, expectedDispatch) {
        const hoursUntilDispatch = (expectedDispatch.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Overdue orders get maximum priority
        if (hoursUntilDispatch <= 0) {
            return 100;
        }
        
        // Score decreases as time to dispatch increases
        // 100 points for < 2 hours, decreasing to 0 at 48+ hours
        if (hoursUntilDispatch <= 2) return 100;
        if (hoursUntilDispatch <= 4) return 90;
        if (hoursUntilDispatch <= 8) return 80;
        if (hoursUntilDispatch <= 12) return 70;
        if (hoursUntilDispatch <= 24) return 50;
        if (hoursUntilDispatch <= 48) return 25;
        
        return Math.max(0, 25 - (hoursUntilDispatch - 48) / 10);
    }

    /**
     * Calculate delivery promise component score (20% weight)
     * Tighter delivery windows get higher priority
     */
    calculateDeliveryPromiseScore(orderDate, deliveryBy) {
        if (!deliveryBy) return 50; // Neutral score if no delivery date
        
        const deliveryWindowHours = (deliveryBy.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        
        // Shorter delivery windows = higher priority
        if (deliveryWindowHours <= 24) return 100;      // Same day delivery
        if (deliveryWindowHours <= 48) return 80;       // Next day delivery
        if (deliveryWindowHours <= 72) return 60;       // 2-3 day delivery
        if (deliveryWindowHours <= 120) return 40;      // 4-5 day delivery
        if (deliveryWindowHours <= 168) return 20;      // 1 week delivery
        
        return 10; // Standard delivery (7+ days)
    }

    /**
     * Calculate order age component score (10% weight)
     * Older orders get higher priority to prevent stagnation
     */
    calculateOrderAgeScore(now, orderDate) {
        const ageHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        
        // Gradual increase in priority as order ages
        if (ageHours <= 2) return 10;
        if (ageHours <= 6) return 20;
        if (ageHours <= 12) return 30;
        if (ageHours <= 24) return 50;
        if (ageHours <= 48) return 70;
        if (ageHours <= 72) return 85;
        
        return 100; // Orders older than 3 days get maximum age priority
    }

    /**
     * Calculate order value component score (10% weight)
     * Higher value orders get higher priority
     */
    calculateOrderValueScore(orderValue) {
        // Logarithmic scaling for order value priority
        if (orderValue <= 0) return 0;
        if (orderValue <= 25) return 10;
        if (orderValue <= 50) return 20;
        if (orderValue <= 100) return 30;
        if (orderValue <= 250) return 50;
        if (orderValue <= 500) return 70;
        if (orderValue <= 1000) return 85;
        
        return 100; // High-value orders (£1000+) get maximum value priority
    }

    /**
     * Update the priority queue with current order data
     * Uses dirty flag pattern for performance optimization
     */
    async updateQueue(orders = null) {
        if (this.isCalculating) {
            console.log('Queue calculation already in progress, skipping...');
            return this.priorityQueue;
        }

        const startTime = performance.now();
        this.isCalculating = true;

        try {
            // Use provided orders or existing ones
            if (orders) {
                this.orders = orders;
                // Mark all orders as dirty when new data is provided
                this.dirtyOrders = new Set(orders.map(order => order.orderNumber));
            }

            // Only recalculate dirty orders or if forced
            if (this.dirtyOrders.size === 0 && this.priorityQueue.length > 0) {
                console.log('No dirty orders found, using cached priority queue');
                return this.priorityQueue;
            }

            console.log(`Calculating DPS for ${this.dirtyOrders.size} orders...`);

            // Calculate DPS scores for dirty orders
            const updatedOrders = this.orders.map(order => {
                if (this.dirtyOrders.has(order.orderNumber) || !order.hasOwnProperty('dpsScore')) {
                    const dpsScore = this.calculateDPS(order);
                    return {
                        ...order,
                        dpsScore,
                        isOverdue: this.isOverdue(order),
                        lastDPSCalculation: new Date().toISOString()
                    };
                }
                return order;
            });

            // Sort by DPS score (highest first) with tie-breaking
            this.priorityQueue = updatedOrders.sort((a, b) => {
                // Primary sort: DPS score (descending)
                if (b.dpsScore !== a.dpsScore) {
                    return b.dpsScore - a.dpsScore;
                }
                
                // Tie-breaker 1: Overdue orders first
                if (a.isOverdue !== b.isOverdue) {
                    return b.isOverdue - a.isOverdue;
                }
                
                // Tie-breaker 2: Order value (descending)
                const aValue = parseFloat(a.orderTotal) || 0;
                const bValue = parseFloat(b.orderTotal) || 0;
                if (bValue !== aValue) {
                    return bValue - aValue;
                }
                
                // Tie-breaker 3: Order date (oldest first)
                const aDate = this.parseDate(a.orderDate);
                const bDate = this.parseDate(b.orderDate);
                return aDate - bDate;
            });

            // Clear dirty flags
            this.dirtyOrders.clear();
            this.lastCalculation = new Date();

            // Update performance metrics
            const calculationTime = performance.now() - startTime;
            this.updatePerformanceMetrics(calculationTime);

            console.log(`Queue updated: ${this.priorityQueue.length} orders processed in ${calculationTime.toFixed(2)}ms`);
            
            return this.priorityQueue;

        } catch (error) {
            console.error('Error updating priority queue:', error);
            throw error;
        } finally {
            this.isCalculating = false;
        }
    }

    /**
     * Get top priority orders for Action Center display
     * @param {number} count - Number of top orders to return (default: 5)
     * @returns {Array} Top priority orders
     */
    getTopPriorityOrders(count = 5) {
        if (this.priorityQueue.length === 0) {
            console.warn('Priority queue is empty. Call updateQueue() first.');
            return [];
        }

        const topOrders = this.priorityQueue.slice(0, count);
        
        // Add additional context for UI display
        return topOrders.map(order => ({
            ...order,
            priorityRank: this.priorityQueue.indexOf(order) + 1,
            urgencyLevel: this.getUrgencyLevel(order.dpsScore),
            timeToDispatch: this.getTimeToDispatch(order),
            dispatchCountdown: this.getDispatchCountdown(order)
        }));
    }

    /**
     * Mark specific order as dirty for recalculation
     * @param {string} orderNumber - Order number to mark dirty
     */
    markOrderDirty(orderNumber) {
        this.dirtyOrders.add(orderNumber);
        console.log(`Order ${orderNumber} marked for DPS recalculation`);
    }

    /**
     * Mark all orders as dirty (force full recalculation)
     */
    markAllOrdersDirty() {
        this.dirtyOrders = new Set(this.orders.map(order => order.orderNumber));
        console.log(`All ${this.dirtyOrders.size} orders marked for DPS recalculation`);
    }

    /**
     * Check if order is overdue for dispatch
     * @param {Object} order - Order object
     * @returns {boolean} True if overdue
     */
    isOverdue(order) {
        try {
            const now = new Date();
            const expectedDispatch = this.parseDate(order.expectedDispatch);
            
            if (!expectedDispatch) return false;
            
            return now > expectedDispatch;
        } catch (error) {
            console.error(`Error checking overdue status for order ${order.orderNumber}:`, error);
            return false;
        }
    }

    /**
     * Get urgency level based on DPS score
     * @param {number} dpsScore - DPS score (0-100)
     * @returns {string} Urgency level
     */
    getUrgencyLevel(dpsScore) {
        if (dpsScore >= 80) return 'critical';
        if (dpsScore >= 60) return 'high';
        if (dpsScore >= 40) return 'medium';
        if (dpsScore >= 20) return 'low';
        return 'normal';
    }

    /**
     * Get human-readable time to dispatch
     * @param {Object} order - Order object
     * @returns {string} Time to dispatch description
     */
    getTimeToDispatch(order) {
        try {
            const now = new Date();
            const expectedDispatch = this.parseDate(order.expectedDispatch);
            
            if (!expectedDispatch) return 'Unknown';
            
            const diffMs = expectedDispatch.getTime() - now.getTime();
            
            if (diffMs <= 0) return 'OVERDUE';
            
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (diffHours <= 0) return `${diffMinutes}m`;
            if (diffHours < 24) return `${diffHours}h ${diffMinutes}m`;
            
            const diffDays = Math.floor(diffHours / 24);
            const remainingHours = diffHours % 24;
            return `${diffDays}d ${remainingHours}h`;
            
        } catch (error) {
            console.error(`Error calculating time to dispatch for order ${order.orderNumber}:`, error);
            return 'Error';
        }
    }

    /**
     * Get dispatch countdown in milliseconds for real-time updates
     * @param {Object} order - Order object
     * @returns {number} Milliseconds until dispatch deadline
     */
    getDispatchCountdown(order) {
        try {
            const now = new Date();
            const expectedDispatch = this.parseDate(order.expectedDispatch);
            
            if (!expectedDispatch) return 0;
            
            return Math.max(0, expectedDispatch.getTime() - now.getTime());
        } catch (error) {
            console.error(`Error calculating dispatch countdown for order ${order.orderNumber}:`, error);
            return 0;
        }
    }

    /**
     * Validate order has required fields for DPS calculation
     * @param {Object} order - Order object to validate
     * @returns {boolean} True if valid
     */
    validateOrderForDPS(order) {
        const requiredFields = ['orderNumber', 'orderDate', 'expectedDispatch', 'orderTotal'];
        
        for (const field of requiredFields) {
            if (!order.hasOwnProperty(field) || order[field] === null || order[field] === undefined) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Parse date string with comprehensive error handling
     * @param {string|Date} dateInput - Date string or Date object
     * @returns {Date|null} Parsed date or null if invalid
     */
    parseDate(dateInput) {
        if (!dateInput) return null;
        
        if (dateInput instanceof Date) {
            return isNaN(dateInput.getTime()) ? null : dateInput;
        }
        
        try {
            // Handle various date formats
            let dateStr = dateInput.toString().trim();
            
            // Convert common UK date formats
            if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
                // DD/MM/YYYY or MM/DD/YYYY - assume DD/MM for UK
                const parts = dateStr.split('/');
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            
            const parsed = new Date(dateStr);
            return isNaN(parsed.getTime()) ? null : parsed;
            
        } catch (error) {
            console.error('Date parsing error:', error);
            return null;
        }
    }

    /**
     * Generate cache key for DPS calculation
     * @param {Object} order - Order object
     * @param {Date} now - Current timestamp
     * @returns {string} Cache key
     */
    getCacheKey(order, now) {
        // Cache key includes order number and hour (for time-sensitive calculations)
        const hour = Math.floor(now.getTime() / (1000 * 60 * 60));
        return `${order.orderNumber}_${hour}`;
    }

    /**
     * Update performance metrics
     * @param {number} calculationTime - Time taken for calculation in ms
     */
    updatePerformanceMetrics(calculationTime) {
        this.performanceMetrics.lastCalculationTime = calculationTime;
        this.performanceMetrics.totalCalculations++;
        
        // Calculate rolling average
        const currentAvg = this.performanceMetrics.averageCalculationTime;
        const count = this.performanceMetrics.totalCalculations;
        this.performanceMetrics.averageCalculationTime = 
            ((currentAvg * (count - 1)) + calculationTime) / count;
    }

    /**
     * Get performance metrics for monitoring
     * @returns {Object} Performance metrics object
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            cacheSize: this.calculationCache.size,
            queueSize: this.priorityQueue.length,
            dirtyOrders: this.dirtyOrders.size,
            lastCalculation: this.lastCalculation
        };
    }

    /**
     * Clear calculation cache (useful for testing or memory management)
     */
    clearCache() {
        this.calculationCache.clear();
        console.log('DPS calculation cache cleared');
    }

    /**
     * Get queue statistics for monitoring and debugging
     * @returns {Object} Queue statistics
     */
    getQueueStats() {
        if (this.priorityQueue.length === 0) {
            return {
                totalOrders: 0,
                avgDPSScore: 0,
                overdueCount: 0,
                urgencyDistribution: {}
            };
        }

        const totalOrders = this.priorityQueue.length;
        const avgDPSScore = this.priorityQueue.reduce((sum, order) => sum + order.dpsScore, 0) / totalOrders;
        const overdueCount = this.priorityQueue.filter(order => order.isOverdue).length;
        
        const urgencyDistribution = this.priorityQueue.reduce((dist, order) => {
            const level = this.getUrgencyLevel(order.dpsScore);
            dist[level] = (dist[level] || 0) + 1;
            return dist;
        }, {});

        return {
            totalOrders,
            avgDPSScore: Math.round(avgDPSScore * 100) / 100,
            overdueCount,
            urgencyDistribution,
            topDPSScore: this.priorityQueue[0]?.dpsScore || 0,
            lowestDPSScore: this.priorityQueue[totalOrders - 1]?.dpsScore || 0
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DispatchPriorityQueue;
}

// Global instance for browser usage
if (typeof window !== 'undefined') {
    window.DispatchPriorityQueue = DispatchPriorityQueue;
}

// Performance monitoring and automatic cleanup
setInterval(() => {
    if (typeof window !== 'undefined' && window.dispatchQueue instanceof DispatchPriorityQueue) {
        // Clean old cache entries every 10 minutes
        const now = Date.now();
        for (const [key, value] of window.dispatchQueue.calculationCache.entries()) {
            if (now - value.timestamp > window.dispatchQueue.cacheExpiry) {
                window.dispatchQueue.calculationCache.delete(key);
            }
        }
    }
}, 10 * 60 * 1000);