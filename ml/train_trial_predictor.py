from autogluon.tabular import TabularPredictor
import pandas as pd
import os
import sys
import time

print("Starting AutoGluon trial predictor training...")

# Create models directory if it doesn't exist
os.makedirs("models", exist_ok=True)

# Load parsed dataset
print("Loading CSR dataset...")
df = pd.read_csv("data/csr_dataset.csv")
print(f"Loaded dataset with {len(df)} records and {len(df.columns)} features")

# Print column names for verification
print("Available columns:", df.columns.tolist())

# Drop columns not used for training
features = df.drop(columns=["nct_id", "outcome", "failure_reason"], errors='ignore')
target = "success"

# Verify target column exists
if target not in df.columns:
    print(f"Error: Target column '{target}' not found in dataset")
    print("Available columns:", df.columns.tolist())
    sys.exit(1)

print(f"Training model to predict '{target}' using {len(features.columns)} features")

# Train AutoGluon model with progress reporting
print("Starting model training with AutoGluon (this may take a few minutes)...")
start_time = time.time()

try:
    predictor = TabularPredictor(label=target).fit(
        train_data=df,  # Use full dataframe since we already dropped columns above
        time_limit=300,  # 5 minutes
        presets="best_quality"
    )

    # Save model
    model_path = "models/trial_success_model"
    print(f"Training completed in {time.time() - start_time:.2f} seconds")
    print(f"Saving model to {model_path}")
    predictor.save(model_path)
    
    # Show model performance
    print("\nModel Performance:")
    leaderboard = predictor.leaderboard()
    print(leaderboard.head())
    
    # Show feature importance
    print("\nFeature Importance:")
    importance = predictor.feature_importance(df)
    if importance is not None:
        for feature, score in importance.items():
            print(f"{feature}: {score:.4f}")
    
    print("\nTraining complete! The model has been saved and is ready for predictions.")
    
except Exception as e:
    print(f"Error during model training: {str(e)}")
    sys.exit(1)