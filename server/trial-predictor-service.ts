/**
 * Trial Predictor Service
 * Integrates the simplified scikit-learn RandomForest model for predicting trial success
 */
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface PredictionResult {
  success_probability: number;
  prediction: boolean;
  confidence: number;
  key_factors: Record<string, number>;
}

interface TrialData {
  sample_size: number;
  duration_weeks: number;
  dropout_rate: number;
  // Additional data for context but not used in prediction
  indication?: string;
  phase?: string;
  primary_endpoints?: string[];
  control_arm?: string;
  blinding?: string;
}

export class TrialPredictorService {
  private modelPath: string;

  constructor() {
    this.modelPath = path.join(process.cwd(), 'models', 'trial_success_rf.pkl');
  }

  /**
   * Check if the model file exists
   */
  public modelExists(): boolean {
    return fs.existsSync(this.modelPath);
  }

  /**
   * Predict trial success probability using the scikit-learn RandomForest model
   * 
   * @param trialData Trial parameters (only sample_size, duration_weeks, and dropout_rate are used)
   * @returns Promise with prediction result
   */
  public async predictTrialSuccess(trialData: TrialData): Promise<PredictionResult> {
    return new Promise((resolve, reject) => {
      // Create a temporary input file with just the needed features
      const tempInput = path.join(process.cwd(), 'models', `temp_input_${Date.now()}.json`);
      fs.writeFileSync(tempInput, JSON.stringify({
        sample_size: trialData.sample_size,
        duration_weeks: trialData.duration_weeks,
        dropout_rate: trialData.dropout_rate
      }));

      // Run the Python prediction script
      const pythonProcess = spawn('python', [
        '-c',
        `
import sys
import json
import pickle
import pandas as pd
import numpy as np

# Load input data
try:
    with open('${tempInput}', 'r') as f:
        trial_data = json.load(f)
        
    # Load the model
    with open('${this.modelPath}', 'rb') as f:
        model = pickle.load(f)
    
    # Create input dataframe
    X = pd.DataFrame({
        "sample_size": [trial_data["sample_size"]],
        "duration_weeks": [trial_data["duration_weeks"]],
        "dropout_rate": [trial_data["dropout_rate"]]
    })
    
    # Make prediction
    success_probability = float(model.predict_proba(X)[0][1])
    prediction = bool(model.predict(X)[0])
    
    # Calculate confidence (distance from 0.5, scaled to 0-1)
    confidence = abs(success_probability - 0.5) * 2
    
    # Calculate feature impacts
    feature_impacts = {}
    for i, feature in enumerate(["sample_size", "duration_weeks", "dropout_rate"]):
        feature_impacts[feature] = float(model.feature_importances_[i])
    
    # Return result
    result = {
        "success_probability": success_probability,
        "prediction": prediction,
        "confidence": confidence,
        "key_factors": feature_impacts
    }
    
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
finally:
    import os
    if os.path.exists('${tempInput}'):
        os.remove('${tempInput}')
        `
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // Clean up temp file
        try {
          if (fs.existsSync(tempInput)) {
            fs.unlinkSync(tempInput);
          }
        } catch (e) {
          console.error('Failed to clean up temp file:', e);
        }

        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error('Error output:', errorOutput);
          reject(new Error(`Prediction failed with code ${code}: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result as PredictionResult);
          }
        } catch (e) {
          reject(new Error(`Failed to parse prediction result: ${e}`));
        }
      });
    });
  }

  /**
   * Get feature importance from the model
   */
  public async getFeatureImportance(): Promise<{feature: string, importance: number}[]> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        '-c',
        `
import pickle
import json

try:
    # Load the model
    with open('${this.modelPath}', 'rb') as f:
        model = pickle.load(f)
    
    # Get feature importances
    feature_names = ["sample_size", "duration_weeks", "dropout_rate"]
    importances = model.feature_importances_
    
    # Create feature importance list
    feature_importance = [
        {"feature": feature_names[i], "importance": float(importances[i])}
        for i in range(len(feature_names))
    ]
    
    # Sort by importance
    feature_importance.sort(key=lambda x: x["importance"], reverse=True)
    
    # Return top factors
    print(json.dumps(feature_importance))
except Exception as e:
    print(json.dumps({"error": str(e)}))
        `
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Failed to get feature importance: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(`Failed to parse feature importance: ${e}`));
        }
      });
    });
  }
}

export const trialPredictorService = new TrialPredictorService();