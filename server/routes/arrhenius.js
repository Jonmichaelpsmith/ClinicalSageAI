/**
 * Arrhenius Prediction Routes - Server-side API routes for Arrhenius-based shelf-life prediction
 */

import express from 'express';

const router = express.Router();

// Constants
const GAS_CONSTANT = 8.314; // J/(mol·K) - Universal gas constant

/**
 * Calculate the rate constant (k) for a specific temperature using the Arrhenius equation
 * 
 * @param {number} activationEnergy - Activation energy in kJ/mol
 * @param {number} frequencyFactor - Pre-exponential factor (frequency factor) in 1/time
 * @param {number} temperature - Temperature in °C
 * @returns {number} - Rate constant at the specified temperature
 */
function calculateRateConstant(activationEnergy, frequencyFactor, temperature) {
  // Convert temperature from °C to K
  const temperatureK = temperature + 273.15;
  
  // Convert activation energy from kJ/mol to J/mol
  const Ea = activationEnergy * 1000;
  
  // Arrhenius equation: k = A * exp(-Ea / (R * T))
  return frequencyFactor * Math.exp(-Ea / (GAS_CONSTANT * temperatureK));
}

/**
 * Calculate the degradation at a specific time point
 * 
 * @param {number} initialContent - Initial content (%)
 * @param {number} rateConstant - Rate constant
 * @param {number} time - Time in months
 * @param {number} reactionOrder - Reaction order (0, 1, or 2)
 * @returns {number} - Remaining content (%) at the specified time
 */
function calculateDegradation(initialContent, rateConstant, time, reactionOrder) {
  // Convert time from months to days (approximate)
  const timeInDays = time * 30.44;
  
  // Scaling factor for rate constant (adjust if needed)
  const scaledRateConstant = rateConstant;
  
  switch (reactionOrder) {
    case 0: // Zero-order: C(t) = C0 - k*t
      return initialContent - scaledRateConstant * timeInDays;
      
    case 1: // First-order: C(t) = C0 * exp(-k*t)
      return initialContent * Math.exp(-scaledRateConstant * timeInDays);
      
    case 2: // Second-order: 1/C(t) = 1/C0 + k*t
      return 1 / (1/initialContent + scaledRateConstant * timeInDays);
      
    default: // Default to first-order
      return initialContent * Math.exp(-scaledRateConstant * timeInDays);
  }
}

/**
 * Calculate the shelf life (time to reach a specified limit)
 * 
 * @param {number} initialContent - Initial content (%)
 * @param {number} limit - Shelf life limit (%)
 * @param {number} rateConstant - Rate constant
 * @param {number} reactionOrder - Reaction order (0, 1, or 2)
 * @returns {number} - Shelf life in months
 */
function calculateShelfLife(initialContent, limit, rateConstant, reactionOrder) {
  // Adjust rate constant units if needed
  const scaledRateConstant = rateConstant;
  
  let shelfLifeDays;
  
  switch (reactionOrder) {
    case 0: // Zero-order: t = (C0 - limit) / k
      shelfLifeDays = (initialContent - limit) / scaledRateConstant;
      break;
      
    case 1: // First-order: t = ln(C0/limit) / k
      shelfLifeDays = Math.log(initialContent / limit) / scaledRateConstant;
      break;
      
    case 2: // Second-order: t = (1/limit - 1/C0) / k
      shelfLifeDays = (1/limit - 1/initialContent) / scaledRateConstant;
      break;
      
    default: // Default to first-order
      shelfLifeDays = Math.log(initialContent / limit) / scaledRateConstant;
  }
  
  // Convert days to months (approximate)
  return shelfLifeDays / 30.44;
}

/**
 * Estimate activation energy and frequency factor from stability data
 * 
 * @param {Array} data - Stability data at different temperatures
 * @returns {Object} - Estimated Arrhenius parameters
 */
function estimateArrheniusParameters(data) {
  // Calculate rate constants for each temperature
  const lnK = [];
  const invT = [];
  
  data.forEach(point => {
    // Calculate rate constant from initial and final content
    const rateConstant = Math.log(point.initialContent / point.finalContent) / (point.time * 30.44); // Converting months to days
    
    // Convert temperature from °C to K and calculate 1/T
    const temperatureK = point.temperature + 273.15;
    const invTemperature = 1 / temperatureK;
    
    lnK.push(Math.log(rateConstant));
    invT.push(invTemperature);
  });
  
  // Linear regression: ln(k) = ln(A) - Ea/(R*T)
  const n = lnK.length;
  const sumInvT = invT.reduce((a, b) => a + b, 0);
  const sumLnK = lnK.reduce((a, b) => a + b, 0);
  const sumInvTLnK = invT.map((t, i) => t * lnK[i]).reduce((a, b) => a + b, 0);
  const sumInvTSquared = invT.map(t => t * t).reduce((a, b) => a + b, 0);
  
  // Calculate slope and intercept
  const slope = (n * sumInvTLnK - sumInvT * sumLnK) / (n * sumInvTSquared - sumInvT * sumInvT);
  const intercept = (sumLnK - slope * sumInvT) / n;
  
  // Calculate activation energy and frequency factor
  const Ea = -slope * GAS_CONSTANT / 1000; // Convert to kJ/mol
  const A = Math.exp(intercept);
  
  return {
    activationEnergy: Ea,
    frequencyFactor: A,
    rsquared: calculateRSquared(lnK, invT, slope, intercept)
  };
}

/**
 * Calculate R-squared for linear regression
 * 
 * @param {Array} y - y values (ln(k))
 * @param {Array} x - x values (1/T)
 * @param {number} slope - Slope of regression line
 * @param {number} intercept - Intercept of regression line
 * @returns {number} - R-squared value
 */
function calculateRSquared(y, x, slope, intercept) {
  const yMean = y.reduce((a, b) => a + b, 0) / y.length;
  
  // Calculate total sum of squares
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  
  // Calculate residual sum of squares
  const ssResidual = y.reduce((sum, yi, i) => {
    const prediction = intercept + slope * x[i];
    return sum + Math.pow(yi - prediction, 2);
  }, 0);
  
  return 1 - (ssResidual / ssTotal);
}

/**
 * Predict shelf life using Arrhenius equation
 * 
 * @route POST /api/arrhenius/predict
 * @param {Object} req.body - Prediction parameters
 * @returns {Object} - Shelf life prediction results
 */
router.post('/predict', (req, res) => {
  try {
    const {
      initialContent = 100,
      limit = 90,
      activationEnergy,
      frequencyFactor,
      referenceTemperature = 25,
      temperatures = [5, 25, 30, 40],
      reactionOrder = 1,
      projectionMonths = 36
    } = req.body;
    
    // Validate required parameters
    if (!activationEnergy || !frequencyFactor) {
      return res.status(400).json({
        success: false,
        error: 'Activation energy and frequency factor are required'
      });
    }
    
    // Generate predictions for each temperature
    const predictions = temperatures.map(temperature => {
      const rateConstant = calculateRateConstant(activationEnergy, frequencyFactor, temperature);
      const shelfLife = calculateShelfLife(initialContent, limit, rateConstant, reactionOrder);
      
      // Generate degradation curve
      const degradationCurve = [];
      for (let month = 0; month <= projectionMonths; month += 1) {
        const remaining = calculateDegradation(initialContent, rateConstant, month, reactionOrder);
        degradationCurve.push({
          month,
          remaining
        });
      }
      
      return {
        temperature,
        rateConstant,
        shelfLife,
        timeToLimit: shelfLife,
        degradationCurve
      };
    });
    
    // Find reference temperature prediction
    const referencePrediction = predictions.find(p => p.temperature === referenceTemperature) || predictions[0];
    
    res.json({
      success: true,
      input: {
        initialContent,
        limit,
        activationEnergy,
        frequencyFactor,
        referenceTemperature,
        reactionOrder
      },
      predictions,
      summary: {
        proposedShelfLife: Math.floor(referencePrediction.shelfLife), // Round down to be conservative
        limitingFactor: `${limit}% remaining active ingredient`,
        reactionOrder,
        referenceTemperature
      }
    });
  } catch (error) {
    console.error('Error predicting shelf life:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to predict shelf life'
    });
  }
});

/**
 * Estimate Arrhenius parameters from stability data
 * 
 * @route POST /api/arrhenius/estimate
 * @param {Object} req.body - Stability data
 * @returns {Object} - Estimated Arrhenius parameters
 */
router.post('/estimate', (req, res) => {
  try {
    const { data } = req.body;
    
    // Validate data format
    if (!data || !Array.isArray(data) || data.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least two data points at different temperatures are required'
      });
    }
    
    // Validate each data point
    const invalidPoints = data.filter(point => 
      point.temperature === undefined || 
      point.initialContent === undefined || 
      point.finalContent === undefined || 
      point.time === undefined
    );
    
    if (invalidPoints.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Each data point must include temperature, initialContent, finalContent, and time'
      });
    }
    
    // Estimate Arrhenius parameters
    const parameters = estimateArrheniusParameters(data);
    
    res.json({
      success: true,
      parameters,
      interpretation: {
        qualityOfFit: parameters.rsquared > 0.95 ? 'Excellent' : 
                      parameters.rsquared > 0.9 ? 'Good' : 
                      parameters.rsquared > 0.8 ? 'Fair' : 'Poor',
        temperatureRange: `${Math.min(...data.map(p => p.temperature))}°C to ${Math.max(...data.map(p => p.temperature))}°C`,
        notes: 'Activation energy and frequency factor estimated from stability data using linear regression of Arrhenius equation.'
      }
    });
  } catch (error) {
    console.error('Error estimating Arrhenius parameters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to estimate Arrhenius parameters'
    });
  }
});

/**
 * Compare degradation models (zero, first, and second order)
 * 
 * @route POST /api/arrhenius/compare-models
 * @param {Object} req.body - Stability data
 * @returns {Object} - Model comparison results
 */
router.post('/compare-models', (req, res) => {
  try {
    const { data } = req.body;
    
    // Validate data format
    if (!data || !Array.isArray(data) || data.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'At least three data points are required'
      });
    }
    
    // Validate each data point
    const invalidPoints = data.filter(point => 
      point.time === undefined || 
      point.content === undefined
    );
    
    if (invalidPoints.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Each data point must include time and content'
      });
    }
    
    // Sort data by time
    const sortedData = [...data].sort((a, b) => a.time - b.time);
    const initialContent = sortedData[0].content;
    
    // Linear regression for zero-order model: C(t) = C0 - k*t
    const zeroOrderFit = linearRegression(
      sortedData.map(p => p.time),
      sortedData.map(p => p.content)
    );
    const zeroOrderRate = -zeroOrderFit.slope; // Negative because concentration decreases
    
    // Linear regression for first-order model: ln(C(t)) = ln(C0) - k*t
    const firstOrderFit = linearRegression(
      sortedData.map(p => p.time),
      sortedData.map(p => Math.log(p.content))
    );
    const firstOrderRate = -firstOrderFit.slope; // Negative because ln(concentration) decreases
    
    // Linear regression for second-order model: 1/C(t) = 1/C0 + k*t
    const secondOrderFit = linearRegression(
      sortedData.map(p => p.time),
      sortedData.map(p => 1 / p.content)
    );
    const secondOrderRate = secondOrderFit.slope;
    
    res.json({
      success: true,
      models: [
        {
          order: 0,
          rate: zeroOrderRate,
          rsquared: zeroOrderFit.rsquared,
          formula: `C(t) = ${initialContent.toFixed(2)} - ${zeroOrderRate.toFixed(6)} * t`
        },
        {
          order: 1,
          rate: firstOrderRate,
          rsquared: firstOrderFit.rsquared,
          formula: `C(t) = ${initialContent.toFixed(2)} * exp(-${firstOrderRate.toFixed(6)} * t)`
        },
        {
          order: 2,
          rate: secondOrderRate,
          rsquared: secondOrderFit.rsquared,
          formula: `C(t) = 1 / (${(1/initialContent).toFixed(6)} + ${secondOrderRate.toFixed(6)} * t)`
        }
      ],
      bestFit: [zeroOrderFit.rsquared, firstOrderFit.rsquared, secondOrderFit.rsquared].indexOf(
        Math.max(zeroOrderFit.rsquared, firstOrderFit.rsquared, secondOrderFit.rsquared)
      )
    });
  } catch (error) {
    console.error('Error comparing degradation models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare degradation models'
    });
  }
});

/**
 * Simple linear regression
 * 
 * @param {Array} x - x values
 * @param {Array} y - y values
 * @returns {Object} - Regression results
 */
function linearRegression(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
  const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
  const sumYY = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - (intercept + slope * x[i]), 2), 0);
  const rsquared = 1 - (ssResidual / ssTotal);
  
  return { slope, intercept, rsquared };
}

export default router;