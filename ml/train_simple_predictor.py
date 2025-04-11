import pandas as pd
import os
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

print("Starting simple trial success predictor training...")

# Load dataset
df = pd.read_csv("data/csr_dataset.csv")
print(f"Loaded dataset with {len(df)} records")

# Select features and target
X = df[["sample_size", "duration_weeks", "dropout_rate"]]
y = df["success"]

print(f"Using key features: {X.columns.tolist()}")
print(f"Success rate in data: {y.mean():.2f}")

# Fill missing values
X.fillna(X.mean(), inplace=True)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Training set: {X_train.shape}, Test set: {X_test.shape}")

# Train model
print("Training RandomForest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
try:
    roc_auc = roc_auc_score(y_test, y_proba)
except:
    roc_auc = "N/A"

print(f"Test accuracy: {accuracy:.4f}")
print(f"ROC-AUC score: {roc_auc}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Show feature importance
feature_importance = {X.columns[i]: model.feature_importances_[i] for i in range(len(X.columns))}
sorted_importance = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)

print("\nFeature Importance:")
for feature, importance in sorted_importance:
    print(f"{feature}: {importance:.4f}")

# Save model
os.makedirs("models", exist_ok=True)
with open("models/trial_success_rf.pkl", "wb") as f:
    pickle.dump(model, f)

print("\nModel trained and saved as models/trial_success_rf.pkl")

# Create a prediction script
prediction_script = """
import pickle
import pandas as pd
import numpy as np

# Load model
with open("models/trial_success_rf.pkl", "rb") as f:
    model = pickle.load(f)

def predict_trial_success(sample_size, duration_weeks, dropout_rate):
    '''
    Predict trial success probability
    
    Args:
        sample_size (int): Number of participants
        duration_weeks (int): Trial duration in weeks
        dropout_rate (float): Expected dropout rate (0-1)
        
    Returns:
        dict: Prediction result with probability and key factors
    '''
    # Create input dataframe
    X = pd.DataFrame({
        "sample_size": [sample_size],
        "duration_weeks": [duration_weeks],
        "dropout_rate": [dropout_rate]
    })
    
    # Make prediction
    success_probability = float(model.predict_proba(X)[0][1])
    prediction = bool(model.predict(X)[0])
    
    # Calculate feature impacts
    feature_impacts = {}
    for i, feature in enumerate(["sample_size", "duration_weeks", "dropout_rate"]):
        feature_impacts[feature] = float(model.feature_importances_[i])
    
    return {
        "success_probability": success_probability,
        "prediction": prediction,
        "confidence": abs(success_probability - 0.5) * 2,  # 0-1 scale
        "key_factors": feature_impacts
    }

# Example usage
if __name__ == "__main__":
    result = predict_trial_success(
        sample_size=250,
        duration_weeks=52,
        dropout_rate=0.15
    )
    
    print(f"Success Probability: {result['success_probability']:.2f}")
    print(f"Prediction: {'Success' if result['prediction'] else 'Failure'}")
    print(f"Confidence: {result['confidence']:.2f}")
    print("Key Factors:")
    for factor, impact in sorted(result['key_factors'].items(), key=lambda x: x[1], reverse=True):
        print(f"  - {factor}: {impact:.4f}")
"""

with open("models/simple_predict.py", "w") as f:
    f.write(prediction_script)

print("Created prediction script at models/simple_predict.py")