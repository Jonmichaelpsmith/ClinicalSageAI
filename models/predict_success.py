#!/usr/bin/env python3
"""
Trial Success Prediction Script

This script loads the trained RandomForest model and predicts
the success probability of a clinical trial based on its attributes.
"""
import sys
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

MODEL_PATH = 'models/trial_success_rf.pkl'

def load_model():
    """Load the trained model from a pickle file"""
    try:
        with open(MODEL_PATH, 'rb') as file:
            model = pickle.load(file)
        return model
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model: {str(e)}"}))
        sys.exit(1)

def predict_success(sample_size, duration_weeks, dropout_rate):
    """
    Predict the success probability of a clinical trial
    
    Args:
        sample_size: Number of participants
        duration_weeks: Duration of the trial in weeks
        dropout_rate: Expected dropout rate (0-1)
        
    Returns:
        Dict with prediction results
    """
    try:
        # Load the model
        model = load_model()
        
        # Create input data frame
        input_data = pd.DataFrame({
            'sample_size': [sample_size],
            'duration_weeks': [duration_weeks],
            'dropout_rate': [dropout_rate]
        })
        
        # Make prediction
        probability = model.predict_proba(input_data)[0, 1]
        prediction = model.predict(input_data)[0]
        
        # Calculate feature contributions
        feature_importances = model.feature_importances_
        feature_names = ['sample_size', 'duration_weeks', 'dropout_rate']
        
        # Normalize feature contributions based on the prediction
        total_contribution = sum(feature_importances)
        feature_contributions = {
            'sampleSize': float(feature_importances[0] / total_contribution),
            'durationWeeks': float(feature_importances[1] / total_contribution),
            'dropoutRate': float(feature_importances[2] / total_contribution)
        }
        
        # Create result
        result = {
            'probability': float(probability),
            'success': bool(prediction),
            'featureContributions': feature_contributions
        }
        
        return result
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Input file path required"}))
        sys.exit(1)
    
    try:
        # Read input data from JSON file
        with open(sys.argv[1], 'r') as file:
            input_data = json.load(file)
        
        # Extract parameters
        sample_size = input_data.get('sample_size')
        duration_weeks = input_data.get('duration_weeks')
        dropout_rate = input_data.get('dropout_rate')
        
        # Validate input
        if sample_size is None or duration_weeks is None or dropout_rate is None:
            print(json.dumps({"error": "Missing required parameters"}))
            sys.exit(1)
            
        # Predict success
        result = predict_success(sample_size, duration_weeks, dropout_rate)
        
        # Return result as JSON
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": f"Failed to process input: {str(e)}"}))
        sys.exit(1)