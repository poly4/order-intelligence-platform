/**
 * Ultra-Advanced Batch Detection & Optimization Engine
 * Transforms warehouse picking efficiency through intelligent order grouping
 * 
 * @author Agent 4: Batch Detection Specialist
 * @version 2.0.0
 * @license MIT
 */

class BatchOptimizer {
    constructor() {
        this.config = {
            // Time efficiency calculations (in minutes)
            basePicking: 3.5,        // Base time to pick a single order
            batchSetup: 1.2,         // Additional setup time for batching
            itemPickingReduction: 0.6, // Time reduction per additional item of same SKU
            locationTravel: 0.8,     // Time to travel between warehouse locations
            packingEfficiency: 0.75, // Packing time reduction for similar items
            
            // Urgency thresholds
            criticalUrgencyScore: 85, // Never batch above this urgency
            riskUrgencyScore: 60,     // Careful evaluation required
            maxBatchDelayHours: 2,    // Maximum delay acceptable for batching
            
            // Efficiency requirements
            minTimeSavings: 1.5,      // Minimum minutes saved to recommend batch
            maxBatchSize: 8,          // Maximum orders in a single batch
            minEfficiencyGain: 15,    // Minimum percentage efficiency improvement
            
            // Geographic grouping
            sameCountyBonus: 0.3,     // Additional efficiency for same county
            adjacentCountyBonus: 0.15, // Bonus for adjacent counties
            
            // Cache settings
            cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
        };
        
        this.batchCache = new Map();
        this.analysisCache = new Map();
        this.lastAnalysis = null;
        
        // Performance tracking
        this.performanceMetrics = {
            batchesCreated: 0,
            totalTimeSaved: 0,
            efficiencyGains: [],
            rejectedBatches: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        // Initialize county adjacency mapping for geographic optimization
        this.initializeGeographicData();
        
        console.log('🚀 Ultra-Advanced Batch Optimizer initialized with precision algorithms');
    }
    
    /**
     * Initialize UK county adjacency data for geographic batching optimization
     */
    initializeGeographicData() {
        this.countyAdjacency = {
            'Greater London': ['Surrey', 'Kent', 'Essex', 'Hertfordshire'],
            'Surrey': ['Greater London', 'Kent', 'West Sussex', 'Hampshire', 'Berkshire'],
            'Kent': ['Greater London', 'Surrey', 'East Sussex'],
            'Essex': ['Greater London', 'Hertfordshire', 'Suffolk', 'Cambridgeshire'],
            'Birmingham': ['Warwickshire', 'Staffordshire', 'Worcestershire'],
            'Manchester': ['Lancashire', 'Cheshire', 'Derbyshire'],
            'Liverpool': ['Merseyside', 'Lancashire', 'Cheshire'],
            'Leeds': ['West Yorkshire', 'North Yorkshire', 'Lancashire'],
            'Sheffield': ['South Yorkshire', 'Derbyshire', 'Nottinghamshire'],
            'Bristol': ['Somerset', 'Gloucestershire', 'South Gloucestershire'],
            'Newcastle': ['Northumberland', 'Durham', 'Cumbria'],
            'Cardiff': ['Vale of Glamorgan', 'Rhondda Cynon Taf', 'Caerphilly'],
            'Edinburgh': ['Midlothian', 'East Lothian', 'West Lothian'],
            'Glasgow': ['East Dunbartonshire', 'North Lanarkshire', 'South Lanarkshire'],
            'Belfast': ['County Antrim', 'County Down']
        };
    }
    
    /**
     * Main entry point: Find optimal batch opportunities for a target order
     * @param {Object} targetOrder - The order to find batch opportunities for
     * @param {Array} availableOrders - Pool of orders to consider for batching
     * @returns {Object} Comprehensive batch analysis with recommendations
     */
    async findBatchOpportunities(targetOrder, availableOrders) {
        const startTime = performance.now();
        
        try {
            // Input validation
            if (!this.validateInputs(targetOrder, availableOrders)) {
                return this.createEmptyResult('Invalid input parameters');
            }
            
            // Check cache first
            const cacheKey = this.generateCacheKey(targetOrder, availableOrders);
            if (this.analysisCache.has(cacheKey)) {
                this.performanceMetrics.cacheHits++;
                return this.analysisCache.get(cacheKey);
            }
            
            this.performanceMetrics.cacheMisses++;
            
            // Filter eligible orders for batching
            const eligibleOrders = this.filterEligibleOrders(targetOrder, availableOrders);
            
            if (eligibleOrders.length === 0) {
                return this.createEmptyResult('No eligible orders found for batching');
            }
            
            // Perform multi-dimensional batch analysis
            const batchAnalysis = await this.performComprehensiveBatchAnalysis(
                targetOrder, 
                eligibleOrders
            );
            
            // Generate optimization recommendations
            const recommendations = this.generateBatchRecommendations(batchAnalysis);
            
            // Calculate performance metrics
            const processingTime = performance.now() - startTime;
            
            const result = {
                success: true,
                targetOrder: targetOrder.orderNumber,
                processingTimeMs: processingTime,
                totalEligibleOrders: eligibleOrders.length,
                batchOpportunities: recommendations,
                analysis: batchAnalysis,
                metadata: {
                    timestamp: new Date().toISOString(),
                    cacheStatus: 'miss',
                    algorithmVersion: '2.0.0'
                }
            };
            
            // Cache the result
            this.analysisCache.set(cacheKey, result);
            setTimeout(() => this.analysisCache.delete(cacheKey), this.config.cacheExpiry);
            
            return result;
            
        } catch (error) {
            console.error('❌ Batch optimization failed:', error);
            return this.createErrorResult(error.message);
        }
    }
    
    /**
     * Validate input parameters for batch analysis
     */
    validateInputs(targetOrder, availableOrders) {
        if (!targetOrder || !targetOrder.orderNumber) {
            console.warn('⚠️ Invalid target order provided');
            return false;
        }
        
        if (!Array.isArray(availableOrders) || availableOrders.length === 0) {
            console.warn('⚠️ No available orders provided for analysis');
            return false;
        }
        
        return true;
    }
    
    /**
     * Filter orders eligible for batching with the target order
     */
    filterEligibleOrders(targetOrder, availableOrders) {
        const currentTime = new Date();
        
        return availableOrders.filter(order => {
            // Exclude the target order itself
            if (order.orderNumber === targetOrder.orderNumber) {
                return false;
            }
            
            // Exclude orders with critical urgency
            if (order.urgencyScore > this.config.criticalUrgencyScore) {
                return false;
            }
            
            // Exclude orders that would cause significant delays
            const deliveryDelay = this.calculateDeliveryDelay(order, this.config.maxBatchDelayHours);
            if (deliveryDelay > this.config.maxBatchDelayHours * 60) { // Convert to minutes
                return false;
            }
            
            // Must have valid product and SKU information
            if (!order.product || !order.sku) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Perform comprehensive multi-dimensional batch analysis
     */
    async performComprehensiveBatchAnalysis(targetOrder, eligibleOrders) {
        const analysis = {
            skuBatches: this.analyzeSKUBatches(targetOrder, eligibleOrders),
            geographicBatches: this.analyzeGeographicBatches(targetOrder, eligibleOrders),
            urgencyBatches: this.analyzeUrgencyBatches(targetOrder, eligibleOrders),
            valueBatches: this.analyzeValueBatches(targetOrder, eligibleOrders),
            hybridBatches: []
        };
        
        // Create hybrid optimizations combining multiple factors
        analysis.hybridBatches = this.createHybridBatches(
            analysis.skuBatches,
            analysis.geographicBatches,
            analysis.urgencyBatches,
            analysis.valueBatches
        );
        
        // Rank all batch opportunities by efficiency
        analysis.rankedBatches = this.rankBatchesByEfficiency([
            ...analysis.skuBatches,
            ...analysis.geographicBatches,
            ...analysis.urgencyBatches,
            ...analysis.valueBatches,
            ...analysis.hybridBatches
        ]);
        
        return analysis;
    }
    
    /**
     * Analyze SKU-based batch opportunities
     */
    analyzeSKUBatches(targetOrder, eligibleOrders) {
        const skuBatches = [];
        const targetSKU = targetOrder.sku;
        
        // Find exact SKU matches
        const exactMatches = eligibleOrders.filter(order => order.sku === targetSKU);
        
        if (exactMatches.length > 0) {
            const batchOrders = [targetOrder, ...exactMatches].slice(0, this.config.maxBatchSize);
            const efficiency = this.calculateSKUBatchEfficiency(batchOrders);
            
            if (efficiency.timeSavings >= this.config.minTimeSavings) {
                skuBatches.push({
                    type: 'sku_exact',
                    orders: batchOrders,
                    sku: targetSKU,
                    efficiency: efficiency,
                    priority: 'high',
                    description: `Identical SKU batch: ${batchOrders.length} orders of ${targetOrder.product}`
                });
            }
        }
        
        // Find similar SKU patterns (same product family)
        const similarSKUs = this.findSimilarSKUs(targetSKU, eligibleOrders);
        if (similarSKUs.length > 0) {
            const batchOrders = [targetOrder, ...similarSKUs].slice(0, this.config.maxBatchSize);
            const efficiency = this.calculateSKUBatchEfficiency(batchOrders, 0.7); // Reduced efficiency for similar SKUs
            
            if (efficiency.timeSavings >= this.config.minTimeSavings) {
                skuBatches.push({
                    type: 'sku_similar',
                    orders: batchOrders,
                    sku: targetSKU,
                    efficiency: efficiency,
                    priority: 'medium',
                    description: `Similar SKU batch: ${batchOrders.length} orders of related products`
                });
            }
        }
        
        return skuBatches;
    }
    
    /**
     * Analyze geographic-based batch opportunities
     */
    analyzeGeographicBatches(targetOrder, eligibleOrders) {
        const geoBatches = [];
        const targetCounty = targetOrder.county;
        
        // Same county grouping
        const sameCountyOrders = eligibleOrders.filter(order => order.county === targetCounty);
        if (sameCountyOrders.length > 0) {
            const batchOrders = [targetOrder, ...sameCountyOrders].slice(0, this.config.maxBatchSize);
            const efficiency = this.calculateGeographicBatchEfficiency(batchOrders, 'same_county');
            
            if (efficiency.timeSavings >= this.config.minTimeSavings) {
                geoBatches.push({
                    type: 'geographic_same',
                    orders: batchOrders,
                    county: targetCounty,
                    efficiency: efficiency,
                    priority: 'medium',
                    description: `Same county delivery: ${batchOrders.length} orders to ${targetCounty}`
                });
            }
        }
        
        // Adjacent county grouping
        const adjacentCounties = this.countyAdjacency[targetCounty] || [];
        const adjacentOrders = eligibleOrders.filter(order => 
            adjacentCounties.includes(order.county)
        );
        
        if (adjacentOrders.length > 0) {
            const batchOrders = [targetOrder, ...adjacentOrders].slice(0, this.config.maxBatchSize);
            const efficiency = this.calculateGeographicBatchEfficiency(batchOrders, 'adjacent_county');
            
            if (efficiency.timeSavings >= this.config.minTimeSavings * 0.8) { // Lower threshold for adjacent
                geoBatches.push({
                    type: 'geographic_adjacent',
                    orders: batchOrders,
                    counties: [targetCounty, ...new Set(adjacentOrders.map(o => o.county))],
                    efficiency: efficiency,
                    priority: 'low',
                    description: `Adjacent counties: ${batchOrders.length} orders in nearby regions`
                });
            }
        }
        
        return geoBatches;
    }
    
    /**
     * Analyze urgency-based batch opportunities
     */
    analyzeUrgencyBatches(targetOrder, eligibleOrders) {
        const urgencyBatches = [];
        const targetUrgency = targetOrder.urgencyScore;
        
        // Group by similar urgency levels
        const urgencyTolerance = 15; // Points tolerance
        const similarUrgencyOrders = eligibleOrders.filter(order => 
            Math.abs(order.urgencyScore - targetUrgency) <= urgencyTolerance &&
            order.urgencyScore < this.config.riskUrgencyScore
        );
        
        if (similarUrgencyOrders.length > 0) {
            const batchOrders = [targetOrder, ...similarUrgencyOrders].slice(0, this.config.maxBatchSize);
            const efficiency = this.calculateUrgencyBatchEfficiency(batchOrders);
            
            if (efficiency.timeSavings >= this.config.minTimeSavings) {
                urgencyBatches.push({
                    type: 'urgency_similar',
                    orders: batchOrders,
                    urgencyRange: [
                        Math.min(...batchOrders.map(o => o.urgencyScore)),
                        Math.max(...batchOrders.map(o => o.urgencyScore))
                    ],
                    efficiency: efficiency,
                    priority: this.getUrgencyPriority(targetUrgency),
                    description: `Similar urgency batch: ${batchOrders.length} orders with compatible deadlines`
                });
            }
        }
        
        return urgencyBatches;
    }
    
    /**
     * Analyze value-based batch opportunities for high-value order protection
     */
    analyzeValueBatches(targetOrder, eligibleOrders) {
        const valueBatches = [];
        const targetValue = targetOrder.value;
        
        // High-value order grouping (>£500)
        if (targetValue >= 500) {
            const highValueOrders = eligibleOrders.filter(order => 
                order.value >= 500 && order.urgencyScore < this.config.riskUrgencyScore
            );
            
            if (highValueOrders.length > 0) {
                const batchOrders = [targetOrder, ...highValueOrders].slice(0, this.config.maxBatchSize);
                const efficiency = this.calculateValueBatchEfficiency(batchOrders);
                
                if (efficiency.timeSavings >= this.config.minTimeSavings) {
                    valueBatches.push({
                        type: 'value_high',
                        orders: batchOrders,
                        valueRange: [
                            Math.min(...batchOrders.map(o => o.value)),
                            Math.max(...batchOrders.map(o => o.value))
                        ],
                        efficiency: efficiency,
                        priority: 'high',
                        description: `High-value batch: ${batchOrders.length} premium orders worth £${batchOrders.reduce((sum, o) => sum + o.value, 0).toFixed(2)}`
                    });
                }
            }
        }
        
        return valueBatches;
    }
    
    /**
     * Create hybrid batch recommendations combining multiple optimization factors
     */
    createHybridBatches(skuBatches, geoBatches, urgencyBatches, valueBatches) {
        const hybridBatches = [];
        
        // SKU + Geographic hybrid
        skuBatches.forEach(skuBatch => {
            geoBatches.forEach(geoBatch => {
                const intersectionOrders = this.findOrderIntersection(skuBatch.orders, geoBatch.orders);
                if (intersectionOrders.length >= 3) { // Minimum viable hybrid batch
                    const efficiency = this.calculateHybridBatchEfficiency(intersectionOrders, ['sku', 'geographic']);
                    
                    if (efficiency.timeSavings >= this.config.minTimeSavings * 1.2) { // Higher threshold for hybrid
                        hybridBatches.push({
                            type: 'hybrid_sku_geo',
                            orders: intersectionOrders,
                            factors: ['sku', 'geographic'],
                            efficiency: efficiency,
                            priority: 'high',
                            description: `Hybrid optimization: Same SKU + Geographic grouping (${intersectionOrders.length} orders)`
                        });
                    }
                }
            });
        });
        
        return hybridBatches;
    }
    
    /**
     * Calculate SKU batch efficiency with precise time modeling
     */
    calculateSKUBatchEfficiency(batchOrders, efficiencyMultiplier = 1.0) {
        const baseTime = batchOrders.length * this.config.basePicking;
        const batchSetupTime = this.config.batchSetup;
        const pickingReduction = (batchOrders.length - 1) * this.config.itemPickingReduction * efficiencyMultiplier;
        const packingEfficiency = batchOrders.length * this.config.packingEfficiency * efficiencyMultiplier;
        
        const batchTime = batchSetupTime + baseTime - pickingReduction - packingEfficiency;
        const timeSavings = baseTime - batchTime;
        const efficiencyGain = (timeSavings / baseTime) * 100;
        
        return {
            baseTime: baseTime,
            batchTime: Math.max(batchTime, baseTime * 0.3), // Minimum 30% of base time
            timeSavings: Math.max(timeSavings, 0),
            efficiencyGain: Math.max(efficiencyGain, 0),
            costSavings: timeSavings * 0.5, // £0.50 per minute saved
            riskScore: this.calculateBatchRiskScore(batchOrders)
        };
    }
    
    /**
     * Calculate geographic batch efficiency
     */
    calculateGeographicBatchEfficiency(batchOrders, geoType) {
        const baseTime = batchOrders.length * this.config.basePicking;
        const travelReduction = geoType === 'same_county' ? 
            this.config.sameCountyBonus : this.config.adjacentCountyBonus;
        
        const batchTime = baseTime * (1 - travelReduction) + this.config.batchSetup;
        const timeSavings = baseTime - batchTime;
        const efficiencyGain = (timeSavings / baseTime) * 100;
        
        return {
            baseTime: baseTime,
            batchTime: batchTime,
            timeSavings: Math.max(timeSavings, 0),
            efficiencyGain: Math.max(efficiencyGain, 0),
            costSavings: timeSavings * 0.5,
            riskScore: this.calculateBatchRiskScore(batchOrders)
        };
    }
    
    /**
     * Calculate urgency batch efficiency with deadline risk assessment
     */
    calculateUrgencyBatchEfficiency(batchOrders) {
        const baseTime = batchOrders.length * this.config.basePicking;
        const avgUrgency = batchOrders.reduce((sum, o) => sum + o.urgencyScore, 0) / batchOrders.length;
        
        // Lower efficiency for higher urgency to account for careful handling
        const urgencyPenalty = avgUrgency / 100 * 0.2;
        const batchTime = baseTime * (1 - 0.15 + urgencyPenalty) + this.config.batchSetup;
        const timeSavings = baseTime - batchTime;
        const efficiencyGain = (timeSavings / baseTime) * 100;
        
        return {
            baseTime: baseTime,
            batchTime: batchTime,
            timeSavings: Math.max(timeSavings, 0),
            efficiencyGain: Math.max(efficiencyGain, 0),
            costSavings: timeSavings * 0.5,
            riskScore: this.calculateBatchRiskScore(batchOrders),
            avgUrgency: avgUrgency
        };
    }
    
    /**
     * Calculate value batch efficiency for premium order handling
     */
    calculateValueBatchEfficiency(batchOrders) {
        const baseTime = batchOrders.length * this.config.basePicking;
        const avgValue = batchOrders.reduce((sum, o) => sum + o.value, 0) / batchOrders.length;
        
        // Extra care time for high-value orders
        const premiumHandling = avgValue > 1000 ? 0.5 : 0.2;
        const batchTime = baseTime * (1 - 0.1) + this.config.batchSetup + premiumHandling;
        const timeSavings = baseTime - batchTime;
        const efficiencyGain = (timeSavings / baseTime) * 100;
        
        return {
            baseTime: baseTime,
            batchTime: batchTime,
            timeSavings: Math.max(timeSavings, 0),
            efficiencyGain: Math.max(efficiencyGain, 0),
            costSavings: timeSavings * 0.5,
            riskScore: this.calculateBatchRiskScore(batchOrders),
            avgValue: avgValue,
            totalValue: batchOrders.reduce((sum, o) => sum + o.value, 0)
        };
    }
    
    /**
     * Calculate hybrid batch efficiency with multiple optimization factors
     */
    calculateHybridBatchEfficiency(batchOrders, factors) {
        const baseTime = batchOrders.length * this.config.basePicking;
        
        // Compound efficiency gains from multiple factors
        let efficiencyBonus = 0;
        if (factors.includes('sku')) efficiencyBonus += 0.25;
        if (factors.includes('geographic')) efficiencyBonus += 0.15;
        if (factors.includes('urgency')) efficiencyBonus += 0.10;
        if (factors.includes('value')) efficiencyBonus += 0.05;
        
        const batchTime = baseTime * (1 - efficiencyBonus) + this.config.batchSetup;
        const timeSavings = baseTime - batchTime;
        const efficiencyGain = (timeSavings / baseTime) * 100;
        
        return {
            baseTime: baseTime,
            batchTime: batchTime,
            timeSavings: Math.max(timeSavings, 0),
            efficiencyGain: Math.max(efficiencyGain, 0),
            costSavings: timeSavings * 0.5,
            riskScore: this.calculateBatchRiskScore(batchOrders),
            factors: factors,
            efficiencyBonus: efficiencyBonus
        };
    }
    
    /**
     * Calculate comprehensive risk score for batch
     */
    calculateBatchRiskScore(batchOrders) {
        const urgencyRisk = Math.max(...batchOrders.map(o => o.urgencyScore)) / 100;
        const sizeRisk = batchOrders.length > 5 ? 0.2 : 0;
        const valueRisk = batchOrders.some(o => o.value > 1000) ? 0.1 : 0;
        
        return Math.min(urgencyRisk + sizeRisk + valueRisk, 1.0);
    }
    
    /**
     * Rank all batch opportunities by overall efficiency and feasibility
     */
    rankBatchesByEfficiency(allBatches) {
        return allBatches
            .filter(batch => batch.efficiency.timeSavings >= this.config.minTimeSavings)
            .sort((a, b) => {
                // Primary sort: efficiency gain
                const efficiencyDiff = b.efficiency.efficiencyGain - a.efficiency.efficiencyGain;
                if (Math.abs(efficiencyDiff) > 5) return efficiencyDiff;
                
                // Secondary sort: time savings
                const timeDiff = b.efficiency.timeSavings - a.efficiency.timeSavings;
                if (Math.abs(timeDiff) > 1) return timeDiff;
                
                // Tertiary sort: risk score (lower is better)
                return a.efficiency.riskScore - b.efficiency.riskScore;
            })
            .slice(0, 10); // Top 10 recommendations
    }
    
    /**
     * Generate final batch recommendations with actionable insights
     */
    generateBatchRecommendations(analysis) {
        const recommendations = [];
        
        analysis.rankedBatches.forEach((batch, index) => {
            const recommendation = {
                rank: index + 1,
                batchId: this.generateBatchId(batch),
                type: batch.type,
                priority: batch.priority,
                description: batch.description,
                orders: batch.orders.map(order => ({
                    orderNumber: order.orderNumber,
                    customer: order.customer,
                    product: order.product,
                    sku: order.sku,
                    value: order.value,
                    urgencyScore: order.urgencyScore,
                    county: order.county
                })),
                efficiency: {
                    timeSavingsMinutes: Math.round(batch.efficiency.timeSavings * 10) / 10,
                    efficiencyGainPercent: Math.round(batch.efficiency.efficiencyGain * 10) / 10,
                    costSavingsPounds: Math.round(batch.efficiency.costSavings * 100) / 100,
                    riskScore: Math.round(batch.efficiency.riskScore * 100) / 100
                },
                feasibility: this.assessBatchFeasibility(batch),
                actions: this.generateBatchActions(batch),
                warnings: this.generateBatchWarnings(batch)
            };
            
            recommendations.push(recommendation);
        });
        
        return recommendations;
    }
    
    /**
     * Assess practical feasibility of batch execution
     */
    assessBatchFeasibility(batch) {
        const feasibility = {
            score: 100,
            factors: [],
            overallRating: 'excellent'
        };
        
        // Urgency feasibility
        const maxUrgency = Math.max(...batch.orders.map(o => o.urgencyScore));
        if (maxUrgency > this.config.riskUrgencyScore) {
            feasibility.score -= 30;
            feasibility.factors.push('High urgency orders present');
        }
        
        // Size feasibility
        if (batch.orders.length > 6) {
            feasibility.score -= 15;
            feasibility.factors.push('Large batch size may be complex');
        }
        
        // Geographic feasibility
        const uniqueCounties = new Set(batch.orders.map(o => o.county)).size;
        if (uniqueCounties > 3) {
            feasibility.score -= 20;
            feasibility.factors.push('Multiple delivery counties');
        }
        
        // Determine overall rating
        if (feasibility.score >= 80) feasibility.overallRating = 'excellent';
        else if (feasibility.score >= 60) feasibility.overallRating = 'good';
        else if (feasibility.score >= 40) feasibility.overallRating = 'fair';
        else feasibility.overallRating = 'poor';
        
        return feasibility;
    }
    
    /**
     * Generate actionable batch execution steps
     */
    generateBatchActions(batch) {
        const actions = [];
        
        if (batch.type.includes('sku')) {
            actions.push({
                step: 1,
                action: 'Group identical SKUs for efficient picking',
                estimatedTime: '2 minutes',
                priority: 'high'
            });
        }
        
        if (batch.type.includes('geographic')) {
            actions.push({
                step: 2,
                action: 'Organize by delivery zones',
                estimatedTime: '1 minute',
                priority: 'medium'
            });
        }
        
        actions.push({
            step: actions.length + 1,
            action: 'Prepare batch packing materials',
            estimatedTime: '1 minute',
            priority: 'medium'
        });
        
        actions.push({
            step: actions.length + 1,
            action: 'Execute coordinated pick-pack workflow',
            estimatedTime: `${Math.round(batch.efficiency.batchTime)} minutes`,
            priority: 'high'
        });
        
        return actions;
    }
    
    /**
     * Generate batch execution warnings and considerations
     */
    generateBatchWarnings(batch) {
        const warnings = [];
        
        const maxUrgency = Math.max(...batch.orders.map(o => o.urgencyScore));
        if (maxUrgency > this.config.riskUrgencyScore) {
            warnings.push({
                type: 'urgency',
                severity: 'high',
                message: `Contains orders with urgency score ${maxUrgency.toFixed(1)} - monitor deadlines closely`
            });
        }
        
        const totalValue = batch.orders.reduce((sum, o) => sum + o.value, 0);
        if (totalValue > 5000) {
            warnings.push({
                type: 'value',
                severity: 'medium',
                message: `High-value batch (£${totalValue.toFixed(2)}) - ensure extra care in handling`
            });
        }
        
        if (batch.orders.length > 6) {
            warnings.push({
                type: 'complexity',
                severity: 'medium',
                message: `Large batch (${batch.orders.length} orders) - consider splitting if workflow becomes complex`
            });
        }
        
        return warnings;
    }
    
    /**
     * Execute approved batch with workflow coordination
     * @param {Array} batchOrders - Orders to batch together
     * @param {Object} options - Execution options
     * @returns {Object} Batch execution result
     */
    async executeBatch(batchOrders, options = {}) {
        const batchId = this.generateBatchId({ orders: batchOrders });
        const startTime = new Date();
        
        try {
            // Validate batch before execution
            const validation = this.validateBatchForExecution(batchOrders);
            if (!validation.valid) {
                throw new Error(`Batch validation failed: ${validation.reason}`);
            }
            
            // Initialize batch tracking
            const batchExecution = {
                batchId: batchId,
                startTime: startTime,
                status: 'in_progress',
                orders: batchOrders.map(order => ({
                    orderNumber: order.orderNumber,
                    status: 'pending',
                    startTime: null,
                    completionTime: null,
                    issues: []
                })),
                totalOrders: batchOrders.length,
                completedOrders: 0,
                estimatedCompletion: new Date(startTime.getTime() + this.estimateBatchDuration(batchOrders) * 60000),
                efficiency: this.calculateSKUBatchEfficiency(batchOrders)
            };
            
            // Update performance metrics
            this.performanceMetrics.batchesCreated++;
            this.performanceMetrics.totalTimeSaved += batchExecution.efficiency.timeSavings;
            this.performanceMetrics.efficiencyGains.push(batchExecution.efficiency.efficiencyGain);
            
            console.log(`🎯 Executing batch ${batchId} with ${batchOrders.length} orders`);
            console.log(`⏱️ Estimated time savings: ${batchExecution.efficiency.timeSavings.toFixed(1)} minutes`);
            
            return {
                success: true,
                batchId: batchId,
                execution: batchExecution,
                message: `Batch ${batchId} initiated successfully`,
                estimatedSavings: batchExecution.efficiency
            };
            
        } catch (error) {
            console.error(`❌ Failed to execute batch: ${error.message}`);
            return {
                success: false,
                error: error.message,
                batchId: batchId
            };
        }
    }
    
    /**
     * Get comprehensive performance analytics
     */
    getPerformanceAnalytics() {
        const avgEfficiencyGain = this.performanceMetrics.efficiencyGains.length > 0 ?
            this.performanceMetrics.efficiencyGains.reduce((sum, gain) => sum + gain, 0) / this.performanceMetrics.efficiencyGains.length :
            0;
        
        return {
            totalBatchesCreated: this.performanceMetrics.batchesCreated,
            totalTimeSavedMinutes: Math.round(this.performanceMetrics.totalTimeSaved * 10) / 10,
            totalCostSavings: Math.round(this.performanceMetrics.totalTimeSaved * 0.5 * 100) / 100,
            averageEfficiencyGain: Math.round(avgEfficiencyGain * 10) / 10,
            cachePerformance: {
                hits: this.performanceMetrics.cacheHits,
                misses: this.performanceMetrics.cacheMisses,
                hitRate: this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100
            },
            lastUpdated: new Date().toISOString()
        };
    }
    
    // Helper methods
    generateCacheKey(targetOrder, availableOrders) {
        const orderIds = [targetOrder.orderNumber, ...availableOrders.map(o => o.orderNumber)].sort();
        return `batch_${btoa(orderIds.join('_')).slice(0, 16)}`;
    }
    
    generateBatchId(batch) {
        const timestamp = Date.now().toString(36);
        const orderCount = batch.orders.length.toString(36);
        const random = Math.random().toString(36).substr(2, 4);
        return `BTH_${timestamp}_${orderCount}_${random}`.toUpperCase();
    }
    
    findSimilarSKUs(targetSKU, orders) {
        const basePattern = targetSKU.substring(0, Math.min(targetSKU.length - 2, 6));
        return orders.filter(order => 
            order.sku.startsWith(basePattern) && order.sku !== targetSKU
        );
    }
    
    findOrderIntersection(orders1, orders2) {
        const orderNumbers1 = new Set(orders1.map(o => o.orderNumber));
        return orders2.filter(order => orderNumbers1.has(order.orderNumber));
    }
    
    calculateDeliveryDelay(order, maxDelayHours) {
        const now = new Date();
        const deliveryDate = new Date(order.deliveryEndDate);
        const delayMinutes = (now.getTime() - deliveryDate.getTime()) / (1000 * 60);
        return Math.max(0, delayMinutes);
    }
    
    getUrgencyPriority(urgencyScore) {
        if (urgencyScore >= 70) return 'high';
        if (urgencyScore >= 40) return 'medium';
        return 'low';
    }
    
    validateBatchForExecution(batchOrders) {
        if (!Array.isArray(batchOrders) || batchOrders.length < 2) {
            return { valid: false, reason: 'Batch must contain at least 2 orders' };
        }
        
        if (batchOrders.length > this.config.maxBatchSize) {
            return { valid: false, reason: `Batch size exceeds maximum of ${this.config.maxBatchSize}` };
        }
        
        const criticalOrders = batchOrders.filter(o => o.urgencyScore > this.config.criticalUrgencyScore);
        if (criticalOrders.length > 0) {
            return { valid: false, reason: 'Batch contains critical urgency orders' };
        }
        
        return { valid: true };
    }
    
    estimateBatchDuration(batchOrders) {
        const efficiency = this.calculateSKUBatchEfficiency(batchOrders);
        return efficiency.batchTime;
    }
    
    createEmptyResult(reason) {
        return {
            success: false,
            reason: reason,
            batchOpportunities: [],
            analysis: null,
            metadata: {
                timestamp: new Date().toISOString(),
                cacheStatus: 'none'
            }
        };
    }
    
    createErrorResult(errorMessage) {
        return {
            success: false,
            error: errorMessage,
            batchOpportunities: [],
            analysis: null,
            metadata: {
                timestamp: new Date().toISOString(),
                cacheStatus: 'error'
            }
        };
    }
}

// Export for use in the main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BatchOptimizer;
}

// Global initialization for browser environment
if (typeof window !== 'undefined') {
    window.BatchOptimizer = BatchOptimizer;
    console.log('🎯 Batch Optimization Engine loaded and ready for warehouse intelligence');
}

/**
 * Integration functions for the main order visualization platform
 */

/**
 * Initialize batch optimization for the Action Center
 * @param {Array} ordersData - Current orders data
 * @returns {BatchOptimizer} Configured optimizer instance
 */
function initializeBatchOptimizer(ordersData) {
    const optimizer = new BatchOptimizer();
    
    // Add event listeners for batch detection buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('find-batch-btn')) {
            const orderNumber = event.target.dataset.orderNumber;
            handleFindBatchClick(orderNumber, ordersData, optimizer);
        }
        
        if (event.target.classList.contains('execute-batch-btn')) {
            const batchId = event.target.dataset.batchId;
            handleExecuteBatchClick(batchId, optimizer);
        }
    });
    
    return optimizer;
}

/**
 * Handle "Find Batch" button click in the Action Center
 */
async function handleFindBatchClick(orderNumber, ordersData, optimizer) {
    try {
        // Show loading state
        showBatchAnalysisLoading();
        
        // Find the target order
        const targetOrder = ordersData.find(order => order.orderNumber === orderNumber);
        if (!targetOrder) {
            handleError({
                severity: ErrorSeverity.MEDIUM,
                title: 'Order Not Found',
                message: `Could not find order ${orderNumber}`
            });
            return;
        }
        
        // Get available orders (exclude target)
        const availableOrders = ordersData.filter(order => order.orderNumber !== orderNumber);
        
        // Perform batch analysis
        const analysis = await optimizer.findBatchOpportunities(targetOrder, availableOrders);
        
        if (analysis.success && analysis.batchOpportunities.length > 0) {
            displayBatchRecommendations(analysis);
        } else {
            showNoBatchOpportunities(targetOrder, analysis.reason);
        }
        
    } catch (error) {
        console.error('Batch analysis failed:', error);
        showToast('error', 'Analysis Failed', 'Unable to analyze batch opportunities');
    }
}

/**
 * Display batch recommendations in a modal
 */
function displayBatchRecommendations(analysis) {
    const modalContent = createBatchRecommendationsModal(analysis);
    showModal('Batch Opportunities Found', modalContent);
}

/**
 * Create the batch recommendations modal content
 */
function createBatchRecommendationsModal(analysis) {
    const recommendations = analysis.batchOpportunities;
    const topRecommendation = recommendations[0];
    
    return `
        <div class="batch-recommendations">
            <div class="batch-summary">
                <h3>🎯 Optimization Analysis Complete</h3>
                <p>Found <strong>${recommendations.length}</strong> batch opportunities for order ${analysis.targetOrder}</p>
                <p>Processing time: <span class="highlight">${analysis.processingTimeMs.toFixed(1)}ms</span></p>
            </div>
            
            <div class="top-recommendation">
                <h4>🥇 Best Recommendation</h4>
                <div class="recommendation-card priority-${topRecommendation.priority}">
                    <div class="rec-header">
                        <span class="batch-type">${topRecommendation.type.replace('_', ' ').toUpperCase()}</span>
                        <span class="efficiency-badge">
                            ${topRecommendation.efficiency.efficiencyGainPercent}% efficiency gain
                        </span>
                    </div>
                    <p class="rec-description">${topRecommendation.description}</p>
                    <div class="efficiency-metrics">
                        <div class="metric">
                            <span class="metric-label">Time Savings:</span>
                            <span class="metric-value">${topRecommendation.efficiency.timeSavingsMinutes} min</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Cost Savings:</span>
                            <span class="metric-value">£${topRecommendation.efficiency.costSavingsPounds}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Risk Score:</span>
                            <span class="metric-value risk-${getRiskLevel(topRecommendation.efficiency.riskScore)}">${topRecommendation.efficiency.riskScore}%</span>
                        </div>
                    </div>
                    <div class="batch-orders">
                        <h5>Orders in Batch (${topRecommendation.orders.length}):</h5>
                        <div class="orders-list">
                            ${topRecommendation.orders.map(order => `
                                <div class="order-item">
                                    <span class="order-number">${order.orderNumber}</span>
                                    <span class="order-customer">${order.customer}</span>
                                    <span class="order-value">£${order.value.toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="batch-actions-container">
                        <button class="btn btn-success execute-batch-btn" data-batch-id="${topRecommendation.batchId}">
                            🚀 Execute This Batch
                        </button>
                        <button class="btn btn-secondary" onclick="showBatchDetails('${topRecommendation.batchId}')">
                            📋 View Details
                        </button>
                    </div>
                </div>
            </div>
            
            ${recommendations.length > 1 ? `
                <div class="other-recommendations">
                    <h4>Other Opportunities</h4>
                    ${recommendations.slice(1, 4).map((rec, index) => `
                        <div class="alt-recommendation">
                            <div class="alt-rec-summary">
                                <span class="rank">#${rec.rank}</span>
                                <span class="type">${rec.type.replace('_', ' ')}</span>
                                <span class="savings">${rec.efficiency.timeSavingsMinutes}min saved</span>
                                <button class="btn btn-sm btn-secondary" onclick="showBatchDetails('${rec.batchId}')">
                                    View
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <style>
        .batch-recommendations {
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .batch-summary {
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .highlight {
            color: #4CAF50;
            font-weight: 600;
        }
        
        .recommendation-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
        }
        
        .priority-high { border-left: 4px solid #4CAF50; }
        .priority-medium { border-left: 4px solid #FF9800; }
        .priority-low { border-left: 4px solid #2196F3; }
        
        .rec-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .batch-type {
            background: rgba(102, 126, 234, 0.3);
            color: #667eea;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        
        .efficiency-badge {
            background: rgba(76, 175, 80, 0.3);
            color: #4CAF50;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        
        .efficiency-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 15px 0;
        }
        
        .metric {
            text-align: center;
        }
        
        .metric-label {
            display: block;
            color: #8892b0;
            font-size: 0.85em;
            margin-bottom: 4px;
        }
        
        .metric-value {
            display: block;
            color: #fff;
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .risk-low { color: #4CAF50; }
        .risk-medium { color: #FF9800; }
        .risk-high { color: #f44336; }
        
        .orders-list {
            max-height: 150px;
            overflow-y: auto;
            background: rgba(0,0,0,0.2);
            border-radius: 6px;
            padding: 10px;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .order-item:last-child {
            border-bottom: none;
        }
        
        .order-number {
            color: #667eea;
            font-weight: 600;
        }
        
        .order-customer {
            color: #8892b0;
            flex: 1;
            text-align: center;
        }
        
        .order-value {
            color: #4CAF50;
            font-weight: 600;
        }
        
        .batch-actions-container {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .alt-recommendation {
            background: rgba(255,255,255,0.02);
            border-radius: 6px;
            margin-bottom: 8px;
        }
        
        .alt-rec-summary {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            gap: 15px;
        }
        
        .rank {
            background: rgba(255,255,255,0.1);
            color: #8892b0;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            min-width: 30px;
            text-align: center;
        }
        
        .type {
            flex: 1;
            color: #fff;
            text-transform: capitalize;
        }
        
        .savings {
            color: #4CAF50;
            font-weight: 600;
            font-size: 0.9em;
        }
        </style>
    `;
}

/**
 * Show modal when no batch opportunities are found
 */
function showNoBatchOpportunities(targetOrder, reason) {
    const content = `
        <div class="no-batch-result">
            <div class="empty-state-icon">🔍</div>
            <h3>No Batch Opportunities Found</h3>
            <p>Order <strong>${targetOrder.orderNumber}</strong> cannot be efficiently batched at this time.</p>
            <div class="reason-box">
                <h4>Analysis Result:</h4>
                <p>${reason || 'No compatible orders meet the batching criteria for optimal efficiency.'}</p>
            </div>
            <div class="suggestions">
                <h4>Suggestions:</h4>
                <ul>
                    <li>Process this order individually for fastest completion</li>
                    <li>Check again after new orders arrive</li>
                    <li>Consider priority processing if deadline is critical</li>
                </ul>
            </div>
        </div>
        
        <style>
        .no-batch-result {
            text-align: center;
            padding: 40px 20px;
        }
        
        .empty-state-icon {
            font-size: 4em;
            margin-bottom: 20px;
            opacity: 0.6;
        }
        
        .reason-box {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
        }
        
        .suggestions {
            background: rgba(102, 126, 234, 0.1);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
        }
        
        .suggestions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .suggestions li {
            margin: 8px 0;
            color: #8892b0;
        }
        </style>
    `;
    
    showModal('Batch Analysis Complete', content);
}

/**
 * Handle batch execution
 */
async function handleExecuteBatchClick(batchId, optimizer) {
    try {
        // In a real implementation, this would execute the actual batch
        showToast('success', 'Batch Initiated', `Batch ${batchId} has been queued for execution`);
        
        // Close the modal
        const modal = document.querySelector('.modal');
        if (modal) modal.style.display = 'none';
        
        // Update the action center to reflect the batch execution
        // This would integrate with the existing order management system
        
    } catch (error) {
        console.error('Batch execution failed:', error);
        showToast('error', 'Execution Failed', 'Unable to execute batch workflow');
    }
}

/**
 * Utility function to determine risk level color coding
 */
function getRiskLevel(riskScore) {
    if (riskScore < 30) return 'low';
    if (riskScore < 70) return 'medium';
    return 'high';
}

/**
 * Show loading state for batch analysis
 */
function showBatchAnalysisLoading() {
    const content = `
        <div class="loading-analysis">
            <div class="loading-spinner"></div>
            <h3>Analyzing Batch Opportunities...</h3>
            <p>Processing order relationships and efficiency calculations</p>
        </div>
        
        <style>
        .loading-analysis {
            text-align: center;
            padding: 60px 20px;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.1);
            border-left: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        </style>
    `;
    
    showModal('Batch Analysis', content);
}

console.log('🎯 Batch Optimizer integration functions loaded successfully');