#!/usr/bin/env python3
"""
Trial Success Predictor using scikit-learn
This script builds a model to predict clinical trial success using scikit-learn's RandomForest
"""

import pandas as pd
import numpy as np
import os
import pickle
import time
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report, confusion_matrix

print("Starting trial success predictor training...")

# Create models directory if it doesn't exist
os.makedirs("models", exist_ok=True)

# Load dataset
print("Loading CSR dataset...")
try:
    df = pd.read_csv("data/csr_dataset.csv")
    print(f"Loaded dataset with {len(df)} records and {len(df.columns)} features")
except Exception as e:
    print(f"Error loading dataset: {str(e)}")
    exit(1)

# Print column names for verification
print("Available columns:", df.columns.tolist())

# Check if success column exists
if 'success' not in df.columns:
    print("Error: Target column 'success' not found in dataset")
    exit(1)

# Drop non-feature columns
features_df = df.drop(columns=['nct_id', 'outcome', 'failure_reason'], errors='ignore')
print(f"Feature columns: {features_df.columns.tolist()}")

# Define target
target = 'success'
X = features_df.drop(columns=[target], errors='ignore')
y = features_df[target]

print(f"X shape: {X.shape}, y shape: {y.shape}")
print(f"Success rate in data: {y.mean():.2f}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
print(f"Training set: {X_train.shape}, Test set: {X_test.shape}")

# Identify numeric and categorical columns
numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()

print(f"Numeric features: {len(numeric_features)}")
print(f"Categorical features: {len(categorical_features)}")

# Define preprocessing steps
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Create preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ],
    remainder='drop'
)

# Create model pipeline
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))
])

# Train model
print("Training model (this may take a few minutes)...")
start_time = time.time()
model.fit(X_train, y_train)
training_time = time.time() - start_time
print(f"Model training completed in {training_time:.2f} seconds")

# Evaluate on test set
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
try:
    roc_auc = roc_auc_score(y_test, y_pred_proba)
except:
    roc_auc = "N/A"

print("\nModel Performance:")
print(f"Test Accuracy: {accuracy:.4f}")
print(f"ROC-AUC Score: {roc_auc}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Feature importance
if hasattr(model[-1], 'feature_importances_'):
    feature_names = []
    
    # Extract feature names from the preprocessor
    ohe_feature_names = []
    if categorical_features:
        try:
            # Get categorical feature names after one-hot encoding
            ohe_features = model[0].transformers_[1][1]['onehot'].get_feature_names_out(categorical_features)
            ohe_feature_names = list(ohe_features)
        except:
            pass
    
    # Combine numeric and OHE feature names
    feature_names = numeric_features + ohe_feature_names
    
    # Create feature importance dictionary
    if len(feature_names) == len(model[-1].feature_importances_):
        feature_importances = {
            feature_names[i]: model[-1].feature_importances_[i] 
            for i in range(len(feature_names))
        }
        
        # Sort by importance
        feature_importances = dict(sorted(
            feature_importances.items(), 
            key=lambda item: item[1],
            reverse=True
        ))
        
        print("\nFeature Importance:")
        for feature, importance in list(feature_importances.items())[:10]:
            print(f"{feature}: {importance:.4f}")
    else:
        print("\nFeature names and importances length mismatch, can't display feature importance")

# Save model
model_path = "models/trial_success_model.pkl"
with open(model_path, 'wb') as f:
    pickle.dump(model, f)
print(f"\nModel saved to {model_path}")

# Save a sample prediction script
prediction_script = """
import pickle
import pandas as pd

# Load the model
with open('models/trial_success_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Sample data function
def predict_trial_success(trial_data):
    \"\"\"
    Predict success probability for a clinical trial
    
    Args:
        trial_data: Dictionary with trial parameters
    
    Returns:
        Dictionary with success probability and prediction
    \"\"\"
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
"""

with open("models/predict_success.py", 'w') as f:
    f.write(prediction_script)
print("Prediction script saved to models/predict_success.py")

print("\nTraining complete! The model and prediction script are ready for use.")