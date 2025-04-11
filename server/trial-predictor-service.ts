import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { NotificationService, notificationService } from './notification-service';

/**
 * Service for predicting clinical trial success using the trained ML model
 */
export class TrialPredictorService {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Predict the success probability of a clinical trial based on its attributes
   * 
   * @param sampleSize Number of participants in the trial
   * @param durationWeeks Duration of the trial in weeks
   * @param dropoutRate Expected dropout rate (as a decimal, e.g., 0.15 for 15%)
   * @returns Promise<PredictionResult> with success probability and feature contributions
   */
  async predictTrialSuccess(
    sampleSize: number,
    durationWeeks: number,
    dropoutRate: number
  ): Promise<PredictionResult> {
    try {
      // Input validation
      if (sampleSize <= 0) throw new Error('Sample size must be positive');
      if (durationWeeks <= 0) throw new Error('Duration must be positive');
      if (dropoutRate < 0 || dropoutRate > 1) throw new Error('Dropout rate must be between 0 and 1');

      // Create a temporary input file for the prediction
      const inputData = {
        sample_size: sampleSize,
        duration_weeks: durationWeeks,
        dropout_rate: dropoutRate,
      };
      
      const tempInputFile = path.join('data', `prediction_input_${Date.now()}.json`);
      fs.writeFileSync(tempInputFile, JSON.stringify(inputData));

      // Run the Python prediction script
      const result = await this.runPredictionScript(tempInputFile);
      
      // Clean up temp file
      try {
        fs.unlinkSync(tempInputFile);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }

      // Log the prediction in the notification system
      this.notificationService.addNotification({
        type: 'trial_prediction',
        title: 'Trial Success Prediction',
        message: `Predicted ${result.success ? 'success' : 'failure'} (${Math.round(result.probability * 100)}%) for trial with ${sampleSize} participants, ${durationWeeks} weeks, ${dropoutRate * 100}% dropout`,
        timestamp: new Date(),
        metadata: {
          prediction: result,
          input: inputData
        }
      });

      return result;
    } catch (error) {
      console.error('Error predicting trial success:', error);
      throw new Error(`Failed to predict trial success: ${error.message}`);
    }
  }

  /**
   * Run the Python prediction script as a child process
   * 
   * @param inputFilePath Path to the temporary JSON input file
   * @returns Promise<PredictionResult> with prediction results
   */
  private runPredictionScript(inputFilePath: string): Promise<PredictionResult> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [
        'models/predict_success.py',
        inputFilePath
      ]);

      let resultData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Prediction script exited with code ${code}: ${errorData}`));
        }

        try {
          const result = JSON.parse(resultData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse prediction results: ${error.message}`));
        }
      });
    });
  }
}

/**
 * Interface for prediction results
 */
export interface PredictionResult {
  /** Probability of trial success (0-1) */
  probability: number;
  
  /** Boolean indicating predicted success or failure */
  success: boolean;
  
  /** Feature contributions to the prediction */
  featureContributions: {
    sampleSize: number;
    durationWeeks: number;
    dropoutRate: number;
  };
}

// Export singleton instance
export const trialPredictorService = new TrialPredictorService(notificationService);