import os
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score

def train_failure_reason_classifier():
    """
    Trains a model to classify text-based failure reasons and predict
    the likelihood of trial success/failure based on the description.
    """
    print("Training failure reason classifier...")
    
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
    
    # Filter out rows with empty failure_reason
    df = df[df['failure_reason'].notna() & (df['failure_reason'] != '')]
    
    if len(df) == 0:
        print("Error: No valid failure reason data found in the dataset.")
        return
    
    print(f"Found {len(df)} records with failure reason text")
    
    # Split into features and target
    X = df["failure_reason"]
    y = df["success"]  # Binary success/fail
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training set: {len(X_train)} records")
    print(f"Test set: {len(X_test)} records")
    
    # Vectorize the text data
    vectorizer = TfidfVectorizer(max_features=300,
                                min_df=2,
                                max_df=0.85,
                                ngram_range=(1, 2))
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Train a logistic regression model
    clf = LogisticRegression(max_iter=1000, C=0.1)
    clf.fit(X_train_vec, y_train)
    
    # Evaluate the model
    train_pred = clf.predict(X_train_vec)
    test_pred = clf.predict(X_test_vec)
    test_prob = clf.predict_proba(X_test_vec)[:, 1]
    
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
    
    # Save the models
    vectorizer_path = os.path.join(models_dir, "failure_vec.pkl")
    with open(vectorizer_path, "wb") as f:
        pickle.dump(vectorizer, f)
    
    clf_path = os.path.join(models_dir, "failure_clf.pkl")
    with open(clf_path, "wb") as f:
        pickle.dump(clf, f)
    
    print("\nModel saved to:")
    print(f"- {vectorizer_path}")
    print(f"- {clf_path}")
    
    # Display some important features
    feature_importance = pd.DataFrame({
        'feature': vectorizer.get_feature_names_out(),
        'importance': clf.coef_[0]
    })
    
    # Sort by absolute importance
    feature_importance['abs_importance'] = np.abs(feature_importance['importance'])
    feature_importance = feature_importance.sort_values('abs_importance', ascending=False)
    
    print("\nTop 10 failure indicators:")
    for _, row in feature_importance[feature_importance['importance'] < 0].head(10).iterrows():
        print(f"- {row['feature']}: {row['importance']:.3f}")
    
    print("\nTop 10 success indicators:")
    for _, row in feature_importance[feature_importance['importance'] > 0].head(10).iterrows():
        print(f"- {row['feature']}: {row['importance']:.3f}")
    
    return clf, vectorizer

if __name__ == "__main__":
    train_failure_reason_classifier()