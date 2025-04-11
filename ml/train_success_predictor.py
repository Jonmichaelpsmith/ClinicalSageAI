import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
from sklearn.impute import SimpleImputer

def train_success_predictor():
    """
    Trains a model to predict trial success based on trial characteristics.
    Uses Random Forest as a robust classifier.
    """
    print("Training trial success predictor...")
    
    # Check if the dataset exists
    if not os.path.exists("data/csr_dataset.csv"):
        print("Error: data/csr_dataset.csv not found. Run parse_csrs_to_csv.py first.")
        return
    
    # Load the dataset
    df = pd.read_csv("data/csr_dataset.csv")
    
    if len(df) == 0:
        print("Error: Empty dataset.")
        return
    
    print(f"Loaded dataset with {len(df)} records")
    
    # Check the column distribution
    print("\nFeature Distribution:")
    for col in ['phase', 'indication', 'blinding', 'control_type']:
        if col in df.columns:
            print(f"\n{col} value counts:")
            print(df[col].value_counts().head(5))
    
    # Define features to use
    numeric_features = ['sample_size', 'duration_weeks', 'dropout_rate']
    categorical_features = ['phase', 'blinding', 'control_type']
    
    # For indications, if there are too many unique values, we'll use only the top N
    if 'indication' in df.columns:
        top_indications = df['indication'].value_counts().head(15).index.tolist()
        df['indication_grouped'] = df['indication'].apply(lambda x: x if x in top_indications else 'Other')
        categorical_features.append('indication_grouped')
    
    # Define feature transformers
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    # Create the model pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # Prepare data
    X = df[numeric_features + categorical_features]
    y = df['success']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"\nTraining set: {len(X_train)} records")
    print(f"Test set: {len(X_test)} records")
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train, y_train, cv=5)
    print(f"\nCross-validation scores: {cv_scores}")
    print(f"Mean CV accuracy: {cv_scores.mean():.3f}")
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Evaluate on test set
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    print("\nModel Evaluation:")
    print(f"Test accuracy: {accuracy_score(y_test, y_pred):.3f}")
    
    if len(np.unique(y_test)) > 1:  # Check if test set has both classes
        try:
            print(f"ROC-AUC score: {roc_auc_score(y_test, y_pred_proba):.3f}")
        except Exception as e:
            print(f"Could not calculate ROC-AUC: {e}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Create models directory if it doesn't exist
    os.makedirs("models", exist_ok=True)
    
    # Save the model
    with open("models/success_predictor.pkl", "wb") as f:
        pickle.dump(model, f)
    
    print("\nModel saved to models/success_predictor.pkl")
    
    # Feature importance analysis
    feature_names = (
        numeric_features +
        model.named_steps['preprocessor'].transformers_[1][1].named_steps['onehot'].get_feature_names_out(categorical_features).tolist()
    )
    
    try:
        feature_importance = pd.DataFrame({
            'feature': feature_names,
            'importance': model.named_steps['classifier'].feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nTop 10 most important features:")
        print(feature_importance.head(10))
    except Exception as e:
        print(f"Could not get feature importances: {e}")
    
    return model

if __name__ == "__main__":
    train_success_predictor()