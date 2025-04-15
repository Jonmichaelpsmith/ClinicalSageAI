/**
 * Simplified SPRA Test
 * 
 * This script tests the functionality of the SPRA algorithm without relying on the full server setup.
 */

// SPRA algorithm implementation based on spra-routes.ts
function calculateSuccessProbability(params) {
  const { sample_size, duration, therapeutic_area, phase } = params;
  
  // Base success rate by phase
  const phaseFactors = {
    "Phase 1": 0.85,
    "Phase 1/2": 0.75,
    "Phase 2": 0.65,
    "Phase 2/3": 0.6,
    "Phase 3": 0.55,
    "Phase 4": 0.85
  };
  
  // Therapeutic area adjustments
  const areaFactors = {
    "Oncology": 0.9,
    "Cardiology": 1.05,
    "Neurology": 0.85,
    "Immunology": 0.95,
    "Infectious Disease": 1.0,
    "Respiratory": 1.1,
    "Gastroenterology": 1.05,
    "Endocrinology": 1.0
  };
  
  // Sample size factor (larger trials tend to have higher power)
  const sampleSizeFactor = Math.min(1.15, 0.8 + (sample_size / 1000) * 0.35);
  
  // Duration factor (optimal duration improves success)
  const optimalDuration = {
    "Phase 1": 12,
    "Phase 1/2": 24,
    "Phase 2": 40,
    "Phase 2/3": 52,
    "Phase 3": 52,
    "Phase 4": 48
  };
  
  const phaseDuration = optimalDuration[phase] || 52;
  const durationFactor = 1 - Math.abs(duration - phaseDuration) / 100;
  
  // Calculate base probability
  const baseFactor = phaseFactors[phase] || 0.6;
  const areaFactor = areaFactors[therapeutic_area] || 1.0;
  
  // Combined probability calculation
  let probability = baseFactor * areaFactor * sampleSizeFactor * durationFactor;
  
  // Add some randomness to represent unknown variables
  probability += (Math.random() * 0.05) - 0.025;
  
  // Ensure probability is between 0.1 and 0.95
  return Math.max(0.1, Math.min(0.95, probability));
}

// Find optimized parameters
function optimize(currentSampleSize, currentDuration, therapeuticArea, phase, prediction, randomization, primary_endpoint) {
  let bestSampleSize = currentSampleSize;
  let bestDuration = currentDuration;
  let bestProb = prediction;
  
  // Try 20 different sample sizes and durations to find best combination
  for (let i = 0; i < 20; i++) {
    // Vary sample size between 70% and 150% of current
    const sampleSizeVariation = currentSampleSize * (0.7 + (0.8 * i / 20));
    const testSampleSize = Math.round(sampleSizeVariation);
    
    for (let j = 0; j < 20; j++) {
      // Vary duration between 70% and 130% of current
      const durationVariation = currentDuration * (0.7 + (0.6 * j / 20));
      const testDuration = Math.round(durationVariation);
      
      // Skip invalid values
      if (testSampleSize < 10 || testDuration < 4) continue;
      
      // Calculate success probability for this combination
      const testProb = calculateSuccessProbability({
        sample_size: testSampleSize,
        duration: testDuration,
        therapeutic_area: therapeuticArea,
        phase,
        randomization,
        primary_endpoint
      });
      
      // Update best parameters if better
      if (testProb > bestProb) {
        bestProb = testProb;
        bestSampleSize = testSampleSize;
        bestDuration = testDuration;
      }
    }
  }
  
  return {
    best_sample_size: bestSampleSize,
    best_duration: bestDuration,
    mean_prob: bestProb
  };
}

// Run Monte Carlo simulation to determine robustness
function runMonteCarlo(
  best_sample_size,
  best_duration,
  therapeutic_area,
  phase,
  randomization,
  primary_endpoint,
  simulations = 100
) {
  const probs = [];
  
  for (let i = 0; i < simulations; i++) {
    // Add small random variation to parameters
    const mcSampleSize = Math.max(10, Math.round(best_sample_size * (0.95 + 0.1 * Math.random())));
    const mcDuration = Math.max(4, Math.round(best_duration * (0.95 + 0.1 * Math.random())));
    
    // Calculate probability with variation
    const prob = calculateSuccessProbability({
      sample_size: mcSampleSize,
      duration: mcDuration,
      therapeutic_area,
      phase,
      randomization,
      primary_endpoint
    });
    
    probs.push(prob);
  }
  
  // Calculate mean and standard deviation
  const meanProb = probs.reduce((sum, val) => sum + val, 0) / probs.length;
  const variance = probs.reduce((sum, val) => sum + Math.pow(val - meanProb, 2), 0) / probs.length;
  const stdProb = Math.sqrt(variance);
  
  return {
    mean_prob: meanProb,
    std_prob: stdProb
  };
}

// Main test function
function testSPRA() {
  // Mock a sample protocol for testing
  const testProtocol = {
    sample_size: 300,
    duration: 52,
    therapeutic_area: "Oncology",
    phase: "Phase 3",
    randomization: "Simple",
    primary_endpoint: "Clinical"
  };
  
  console.log("Testing SPRA with protocol:", testProtocol);
  
  // Extract parameters
  const { sample_size, duration, therapeutic_area, phase, randomization, primary_endpoint } = testProtocol;
  
  // Calculate current predicted success
  const prediction = calculateSuccessProbability(testProtocol);
  console.log(`Initial success prediction: ${(prediction * 100).toFixed(2)}%`);
  
  // Get optimized parameters
  const { best_sample_size, best_duration, mean_prob } = optimize(
    sample_size,
    duration,
    therapeutic_area,
    phase,
    prediction,
    randomization,
    primary_endpoint
  );
  
  console.log(`Optimized sample size: ${best_sample_size}`);
  console.log(`Optimized duration: ${best_duration} weeks`);
  console.log(`Improved success prediction: ${(mean_prob * 100).toFixed(2)}%`);
  
  // Run Monte Carlo simulation
  const mcResults = runMonteCarlo(
    best_sample_size, 
    best_duration, 
    therapeutic_area, 
    phase,
    randomization,
    primary_endpoint
  );
  
  console.log(`Monte Carlo mean probability: ${(mcResults.mean_prob * 100).toFixed(2)}%`);
  console.log(`Standard deviation: ${(mcResults.std_prob * 100).toFixed(2)}%`);
  
  // Return final results
  return {
    prediction,
    best_sample_size,
    best_duration,
    mean_prob: mcResults.mean_prob,
    std_prob: mcResults.std_prob,
    insights: {
      therapeutic_area,
      phase
    }
  };
}

// Run the test
const result = testSPRA();
console.log("\nSPRA Analysis Result:");
console.log(JSON.stringify(result, null, 2));

// Test additional therapeutic areas and phases
const testCases = [
  {
    name: "Cardiology Phase 2",
    params: {
      sample_size: 250,
      duration: 48,
      therapeutic_area: "Cardiology",
      phase: "Phase 2",
      randomization: "Stratified",
      primary_endpoint: "Biomarker"
    }
  },
  {
    name: "Neurology Phase 1",
    params: {
      sample_size: 100,
      duration: 16,
      therapeutic_area: "Neurology",
      phase: "Phase 1",
      randomization: "Open",
      primary_endpoint: "Safety"
    }
  }
];

console.log("\nAdditional Test Cases:");
testCases.forEach(test => {
  console.log(`\nRunning test case: ${test.name}`);
  const { sample_size, duration, therapeutic_area, phase, randomization, primary_endpoint } = test.params;
  
  // Calculate prediction
  const prediction = calculateSuccessProbability(test.params);
  console.log(`Initial success prediction: ${(prediction * 100).toFixed(2)}%`);
  
  // Get optimized parameters
  const { best_sample_size, best_duration, mean_prob } = optimize(
    sample_size,
    duration,
    therapeutic_area,
    phase,
    prediction,
    randomization,
    primary_endpoint
  );
  
  console.log(`Optimized sample size: ${best_sample_size}`);
  console.log(`Optimized duration: ${best_duration} weeks`);
  console.log(`Improved success prediction: ${(mean_prob * 100).toFixed(2)}%`);
});