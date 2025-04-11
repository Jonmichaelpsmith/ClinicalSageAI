/**
 * Trial Predictor Service
 * Integrates the scikit-learn model for predicting trial success
 */
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface PredictionResult {
  success_probability: number;
  prediction: boolean;
  confidence: number;
}

interface TrialData {
  phase: string;
  indication: string;
  sample_size: number;
  duration_weeks: number;
  has_placebo_arm?: boolean; 
  endpoint_count?: number;
  dropout_rate?: number;
  blinding?: string;
  control_type?: string;
  endpoint_primary?: string;
}

export class TrialPredictorService {
  private modelPath: string;
  private predictionScriptPath: string;

  constructor() {
    this.modelPath = path.join(process.cwd(), 'models', 'trial_success_model.pkl');
    this.predictionScriptPath = path.join(process.cwd(), 'models', 'predict_success.py');
  }

  /**
   * Check if the model file exists
   */
  public modelExists(): boolean {
    return fs.existsSync(this.modelPath);
  }

  /**
   * Predict trial success probability using the scikit-learn model
   * 
   * @param trialData Trial parameters
   * @returns Promise with prediction result
   */
  public async predictTrialSuccess(trialData: TrialData): Promise<PredictionResult> {
    return new Promise((resolve, reject) => {
      // Create a temporary input file
      const tempInput = path.join(process.cwd(), 'models', `temp_input_${Date.now()}.json`);
      fs.writeFileSync(tempInput, JSON.stringify(trialData));

      // Run the Python prediction script
      const pythonProcess = spawn('python', [
        '-c',
        `
import sys
import json
import pickle
import pandas as pd

# Load the model
try:
    with open('${this.modelPath}', 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    print(json.dumps({'error': f'Failed to load model: {str(e)}'}))
    sys.exit(1)

# Load input data
try:
    with open('${tempInput}', 'r') as f:
        trial_data = json.load(f)
    
    # Convert to DataFrame
    trial_df = pd.DataFrame([trial_data])
    
    # Make prediction
    success_prob = float(model.predict_proba(trial_df)[0][1])
    prediction = bool(model.predict(trial_df)[0])
    
    # Calculate confidence (distance from 0.5, scaled to 0-1)
    confidence = abs(success_prob - 0.5) * 2
    
    # Return result
    result = {
        'success_probability': success_prob,
        'prediction': prediction,
        'confidence': confidence
    }
    
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'error': f'Prediction failed: {str(e)}'}))
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
          console.error('Failed to parse prediction result:', e);
          console.error('Output was:', output);
          reject(new Error(`Failed to parse prediction result: ${e.message}`));
        }
      });
    });
  }

  /**
   * Get feature importance from the model
   * Returns top factors that influence trial success
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
    if hasattr(model[-1], 'feature_importances_'):
        importances = model[-1].feature_importances_
        
        # Get feature names
        feature_names = []
        try:
            # Attempt to extract feature names from pipeline
            # This won't work for all models
            numeric_features = model[0].transformers_[0][2]
            categorical_features = model[0].transformers_[1][2]
            
            # Get categorical feature names after one-hot encoding
            ohe_features = []
            if len(categorical_features) > 0:
                try:
                    ohe_features = model[0].transformers_[1][1]['onehot'].get_feature_names_out(categorical_features)
                except:
                    pass
                    
            # Combine numeric and OHE feature names
            feature_names = list(numeric_features) + list(ohe_features)
        except:
            # Fallback to index numbers if names can't be extracted
            feature_names = [f"feature_{i}" for i in range(len(importances))]
            
        # Create feature importance list
        if len(feature_names) == len(importances):
            feature_importance = [
                {"feature": feature_names[i], "importance": float(importances[i])}
                for i in range(len(feature_names))
            ]
            
            # Sort by importance
            feature_importance.sort(key=lambda x: x["importance"], reverse=True)
            
            # Return top factors
            print(json.dumps(feature_importance[:10]))
        else:
            print(json.dumps({"error": "Feature names and importances length mismatch"}))
    else:
        print(json.dumps({"error": "Model doesn't have feature_importances_ attribute"}))
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
          reject(new Error(`Failed to parse feature importance: ${e.message}`));
        }
      });
    });
  }
}

export const trialPredictorService = new TrialPredictorService();