
import pickle
import pandas as pd

# Load the model
with open('models/trial_success_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Sample data function
def predict_trial_success(trial_data):
    """
    Predict success probability for a clinical trial
    
    Args:
        trial_data: Dictionary with trial parameters
    
    Returns:
        Dictionary with success probability and prediction
    """
    # Convert to DataFrame
    trial_df = pd.DataFrame([trial_data])
    
    # Make prediction
    success_prob = model.predict_proba(trial_df)[0][1]
    prediction = model.predict(trial_df)[0]
    
    return {
        'success_probability': float(success_prob),
        'prediction': bool(prediction),
        'confidence': abs(success_prob - 0.5) * 2  # Scale to 0-1
    }

# Example usage
if __name__ == '__main__':
    sample_trial = {
        'phase': 'Phase 3',
        'indication': 'Diabetes',
        'sample_size': 250,
        'duration_weeks': 52,
        'has_placebo_arm': True,
        'endpoint_count': 3
    }
    
    result = predict_trial_success(sample_trial)
    print(f"Success Probability: {result['success_probability']:.2f}")
    print(f"Prediction: {'Success' if result['prediction'] else 'Failure'}")
    print(f"Confidence: {result['confidence']:.2f}")
