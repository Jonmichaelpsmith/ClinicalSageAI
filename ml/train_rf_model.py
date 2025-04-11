#!/usr/bin/env python3
"""
Train a Random Forest model on the CSR dataset for predicting trial success
"""
import pandas as pd
import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

print("Training Random Forest model for clinical trial success prediction...")

# Load the dataset
df = pd.read_csv("data/csr_dataset.csv")

# Drop rows missing key data
df = df.dropna(subset=["sample_size", "duration_weeks", "dropout_rate", "success"])
print(f"Dataset shape after dropping rows with missing data: {df.shape}")

# Display success rate in the dataset
success_rate = df["success"].mean() * 100
print(f"Success rate in dataset: {success_rate:.1f}%")

# Select features and target
X = df[["sample_size", "duration_weeks", "dropout_rate"]]
y = df["success"]

# Fill missing values (should be none after dropna, but just in case)
X.fillna(X.mean(), inplace=True)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Training samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
train_accuracy = model.score(X_train, y_train)
test_accuracy = model.score(X_test, y_test)
print(f"Training accuracy: {train_accuracy:.2f}")
print(f"Test accuracy: {test_accuracy:.2f}")

# Cross-validation
cv_scores = cross_val_score(model, X, y, cv=5)
print(f"5-Fold CV accuracy: {cv_scores.mean():.2f} ± {cv_scores.std():.2f}")

# Make predictions
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# Calculate ROC AUC
roc_auc = roc_auc_score(y_test, y_prob)
print(f"ROC AUC score: {roc_auc:.2f}")

# Classification report
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Feature importance
feature_importance = dict(zip(X.columns, model.feature_importances_))
for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
    print(f"{feature}: {importance:.4f}")

# Save model
os.makedirs("models", exist_ok=True)
model_path = "models/trial_success_rf.pkl"
with open(model_path, "wb") as f:
    pickle.dump(model, f)

print(f"\nModel saved to {model_path}")