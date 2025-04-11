import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
from sklearn.impute import SimpleImputer

def train_success_predictor():
    """
    Trains a model to predict trial success based on trial characteristics.
    Uses Random Forest as a robust classifier.
    """
    print("Training trial success predictor...")
    
    # Get the absolute path to the dataset from the project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))
    dataset_path = os.path.join(project_root, "data", "csr_dataset.csv")
    
    # Check if the dataset exists
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found. Run parse_csrs_to_csv.py first.")
        return
    
    # Load the dataset
    df = pd.read_csv(dataset_path)
    
    print(f"Loaded dataset with {len(df)} records")
    
    # Drop records with missing target
    df = df.dropna(subset=['success'])
    
    print(f"Working with {len(df)} records after dropping missing targets")
    print(f"Success rate in dataset: {df['success'].mean():.2f}")
    
    # Define features based on actual column names in CSV
    categorical_features = ['indication', 'phase', 'blinding', 'control_type']
    numerical_features = ['sample_size', 'duration_weeks', 'dropout_rate']
    
    # Check which columns actually exist in the dataframe
    available_cat_features = [col for col in categorical_features if col in df.columns]
    available_num_features = [col for col in numerical_features if col in df.columns]
    
    print(f"Available categorical features: {available_cat_features}")
    print(f"Available numerical features: {available_num_features}")
    
    # Drop rows where all available features are missing
    required_columns = available_cat_features + available_num_features
    df = df.dropna(subset=required_columns, how='all')
    
    print(f"Final dataset size: {len(df)} records")
    
    # Split the data
    available_features = available_cat_features + available_num_features
    X = df[available_features]
    y = df['success'].astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training set: {len(X_train)} records")
    print(f"Test set: {len(X_test)} records")
    
    # Build preprocessing pipeline
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    numerical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Only use available features in the transformers
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', categorical_transformer, available_cat_features) if available_cat_features else None,
            ('num', numerical_transformer, available_num_features) if available_num_features else None
        ],
        remainder='drop'
    )
    
    # Filter out None transformers
    preprocessor.transformers = [t for t in preprocessor.transformers if t is not None]
    
    # Build the full pipeline
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, 
                                             max_depth=10,
                                             min_samples_split=5,
                                             random_state=42))
    ])
    
    # Train the model
    clf.fit(X_train, y_train)
    
    # Evaluate the model
    train_pred = clf.predict(X_train)
    test_pred = clf.predict(X_test)
    test_prob = clf.predict_proba(X_test)[:, 1]
    
    print("\nModel Evaluation:")
    print(f"Training accuracy: {accuracy_score(y_train, train_pred):.3f}")
    print(f"Test accuracy: {accuracy_score(y_test, test_pred):.3f}")
    
    if len(np.unique(y_test)) > 1:  # Check if test set has both classes
        try:
            print(f"ROC-AUC score: {roc_auc_score(y_test, test_prob):.3f}")
        except Exception as e:
            print(f"Could not calculate ROC-AUC: {e}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, test_pred))
    
    # Create models directory if it doesn't exist
    models_dir = os.path.join(project_root, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Save the model
    model_path = os.path.join(models_dir, "success_predictor.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(clf, f)
    
    print(f"\nModel saved to: {model_path}")
    
    # Try to extract feature importance (for Random Forest)
    try:
        feature_names = available_cat_features + available_num_features
        rf_model = clf.named_steps['classifier']
        
        # Determine feature names after one-hot encoding
        if available_cat_features and len(clf.named_steps['preprocessor'].transformers_) > 0:
            cat_transformer_idx = 0
            if clf.named_steps['preprocessor'].transformers_[0][0] == 'cat':
                cat_transformer_idx = 0
            elif len(clf.named_steps['preprocessor'].transformers_) > 1 and clf.named_steps['preprocessor'].transformers_[1][0] == 'cat':
                cat_transformer_idx = 1
                
            cat_encoder = clf.named_steps['preprocessor'].transformers_[cat_transformer_idx][1].named_steps['onehot']
            if hasattr(cat_encoder, 'get_feature_names_out'):
                cat_features = cat_encoder.get_feature_names_out(available_cat_features)
                all_features = list(cat_features) + available_num_features
            else:
                all_features = feature_names
        else:
            all_features = feature_names
        
        # Get importance scores
        importance = rf_model.feature_importances_
        
        # If the lengths don't match, use generic feature names
        if len(importance) != len(all_features):
            all_features = [f"feature_{i}" for i in range(len(importance))]
        
        # Print top 10 important features
        feature_importance = pd.DataFrame({
            'feature': all_features[:len(importance)],
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        print("\nTop 10 important features:")
        for _, row in feature_importance.head(10).iterrows():
            print(f"- {row['feature']}: {row['importance']:.3f}")
    
    except Exception as e:
        print(f"Could not extract feature importance: {e}")
    
    return clf

if __name__ == "__main__":
    train_success_predictor()