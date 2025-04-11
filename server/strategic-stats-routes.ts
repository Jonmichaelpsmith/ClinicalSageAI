import { Router } from 'express';
import * as statsService from './statistics-service';

export const strategicStatsRouter = Router();

/**
 * API endpoint to perform meta-analysis on multiple studies
 */
strategicStatsRouter.post('/meta-analysis', async (req, res) => {
  try {
    const { studies, endpoint } = req.body;
    
    if (!studies || !Array.isArray(studies) || studies.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include an array of studies with effectSize and sampleSize.' 
      });
    }
    
    const result = statsService.performMetaAnalysis(studies, endpoint);
    res.json(result);
  } catch (error) {
    console.error('Error performing meta-analysis:', error);
    res.status(500).json({ error: 'Failed to perform meta-analysis' });
  }
});

/**
 * API endpoint to perform multivariate analysis on trial data
 */
strategicStatsRouter.post('/multivariate-analysis', async (req, res) => {
  try {
    const { trialData, variableNames } = req.body;
    
    if (!trialData || !Array.isArray(trialData) || !variableNames || !Array.isArray(variableNames)) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include trialData matrix and variableNames.' 
      });
    }
    
    const result = statsService.performMultivariateAnalysis(trialData, variableNames);
    res.json(result);
  } catch (error) {
    console.error('Error performing multivariate analysis:', error);
    res.status(500).json({ error: 'Failed to perform multivariate analysis' });
  }
});

/**
 * API endpoint to perform Bayesian analysis
 */
strategicStatsRouter.post('/bayesian-analysis', async (req, res) => {
  try {
    const { priorMean, priorVariance, likelihoodMean, likelihoodVariance } = req.body;
    
    if (priorMean === undefined || priorVariance === undefined || 
        likelihoodMean === undefined || likelihoodVariance === undefined) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include priorMean, priorVariance, likelihoodMean, and likelihoodVariance.' 
      });
    }
    
    const result = statsService.performBayesianAnalysis(
      priorMean, 
      priorVariance, 
      likelihoodMean, 
      likelihoodVariance
    );
    res.json(result);
  } catch (error) {
    console.error('Error performing Bayesian analysis:', error);
    res.status(500).json({ error: 'Failed to perform Bayesian analysis' });
  }
});

/**
 * API endpoint to perform survival analysis
 */
strategicStatsRouter.post('/survival-analysis', async (req, res) => {
  try {
    const { timeData, eventData, groupData } = req.body;
    
    if (!timeData || !Array.isArray(timeData) || !eventData || !Array.isArray(eventData)) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include timeData and eventData arrays.' 
      });
    }
    
    const result = statsService.performSurvivalAnalysis(timeData, eventData, groupData);
    res.json(result);
  } catch (error) {
    console.error('Error performing survival analysis:', error);
    res.status(500).json({ error: 'Failed to perform survival analysis' });
  }
});

/**
 * API endpoint to perform time series analysis
 */
strategicStatsRouter.post('/time-series-analysis', async (req, res) => {
  try {
    const { timePoints, values, forecastPeriods } = req.body;
    
    if (!timePoints || !Array.isArray(timePoints) || !values || !Array.isArray(values)) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include timePoints and values arrays.' 
      });
    }
    
    const result = statsService.analyzeTimeSeries(timePoints, values, forecastPeriods);
    res.json(result);
  } catch (error) {
    console.error('Error performing time series analysis:', error);
    res.status(500).json({ error: 'Failed to perform time series analysis' });
  }
});

/**
 * API endpoint to build regression model
 */
strategicStatsRouter.post('/regression-model', async (req, res) => {
  try {
    const { data, predictorNames, outcomeVariable, modelType } = req.body;
    
    if (!data || !Array.isArray(data) || !predictorNames || !Array.isArray(predictorNames) || !outcomeVariable) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include data, predictorNames, and outcomeVariable.' 
      });
    }
    
    const result = statsService.buildRegressionModel(data, predictorNames, outcomeVariable, modelType);
    res.json(result);
  } catch (error) {
    console.error('Error building regression model:', error);
    res.status(500).json({ error: 'Failed to build regression model' });
  }
});

/**
 * API endpoint to compare two trials
 */
strategicStatsRouter.post('/compare-trials', async (req, res) => {
  try {
    const { trial1, trial2, endpointName } = req.body;
    
    if (!trial1 || !trial2 || !endpointName) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include trial1, trial2, and endpointName.' 
      });
    }
    
    const result = statsService.compareTrials(trial1, trial2, endpointName);
    res.json(result);
  } catch (error) {
    console.error('Error comparing trials:', error);
    res.status(500).json({ error: 'Failed to compare trials' });
  }
});

/**
 * API endpoint to analyze efficacy trends
 */
strategicStatsRouter.post('/efficacy-trends', async (req, res) => {
  try {
    const { details } = req.body;
    
    if (!details || !Array.isArray(details)) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include an array of trial details.' 
      });
    }
    
    const result = statsService.analyzeEfficacyTrends(details);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing efficacy trends:', error);
    res.status(500).json({ error: 'Failed to analyze efficacy trends' });
  }
});

/**
 * API endpoint to generate predictive model
 */
strategicStatsRouter.post('/predictive-model', async (req, res) => {
  try {
    const { historicalDetails, endpoint } = req.body;
    
    if (!historicalDetails || !Array.isArray(historicalDetails)) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include an array of historical trial details.' 
      });
    }
    
    const result = statsService.generatePredictiveModel(historicalDetails, endpoint);
    res.json(result);
  } catch (error) {
    console.error('Error generating predictive model:', error);
    res.status(500).json({ error: 'Failed to generate predictive model' });
  }
});

/**
 * API endpoint to simulate virtual trial
 */
strategicStatsRouter.post('/virtual-trial', async (req, res) => {
  try {
    const { historicalDetails, endpoint, customParams } = req.body;
    
    if (!historicalDetails || !Array.isArray(historicalDetails)) {
      return res.status(400).json({ 
        error: 'Invalid request. Must include an array of historical trial details.' 
      });
    }
    
    const result = statsService.simulateVirtualTrial(historicalDetails, endpoint, customParams);
    res.json(result);
  } catch (error) {
    console.error('Error simulating virtual trial:', error);
    res.status(500).json({ error: 'Failed to simulate virtual trial' });
  }
});