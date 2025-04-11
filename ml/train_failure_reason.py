import os
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

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
    
    print(f"Loaded dataset with {len(df)} records")
    
    # Filter to unsuccessful trials with failure reasons
    failure_df = df[df['success'] == 0].dropna(subset=['failure_reason'])
    
    print(f"Working with {len(failure_df)} failure records")
    
    # Check if we have enough data to train a model
    if len(failure_df) < 10:
        print(f"Not enough failure data to train a meaningful model. Need at least 10 records, but only have {len(failure_df)}.")
        return
    
    # Extract failure categories by analyzing the text
    failure_categories = extract_failure_categories(failure_df)
    
    # Create text vectorizer
    vectorizer = TfidfVectorizer(
        min_df=1, 
        max_df=0.8,
        max_features=200,
        stop_words='english',
        ngram_range=(1, 2)
    )
    
    # Transform failure reasons to feature vectors
    X = vectorizer.fit_transform(failure_df['failure_reason'])
    y = failure_df['success']  # Always 0 in this case
    
    # Split data for training and testing
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )
    
    # Train model to predict success/failure based on failure reason text
    clf = LogisticRegression(C=1.0, class_weight='balanced', max_iter=1000, random_state=42)
    clf.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nAccuracy: {accuracy:.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Create models directory if it doesn't exist
    models_dir = os.path.join(project_root, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Save the trained failure reason classifier and vectorizer
    model_path = os.path.join(models_dir, "failure_reason_classifier.pkl")
    vectorizer_path = os.path.join(models_dir, "failure_reason_vectorizer.pkl")
    
    with open(model_path, 'wb') as f:
        pickle.dump(clf, f)
    
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    print(f"\nFailure reason model saved to: {model_path}")
    print(f"Vectorizer saved to: {vectorizer_path}")
    
    # Train a model to predict new categories
    if failure_categories:
        train_category_classifier(failure_df, failure_categories, project_root)
    
    return clf, vectorizer

def extract_failure_categories(df):
    """
    Extract common failure categories from failure reasons
    """
    failure_reasons = df['failure_reason'].tolist()
    
    # Simple keyword-based categorization
    categories = {
        'safety': ['safety', 'adverse', 'toxicity', 'side effect', 'tolerability'],
        'efficacy': ['efficacy', 'effectiveness', 'not effective', 'ineffective'],
        'statistical': ['statistical', 'power', 'underpowered', 'sample size'],
        'enrollment': ['enrollment', 'recruitment', 'patient', 'dropout'],
        'design': ['design', 'protocol', 'methodology', 'endpoint', 'outcome measure'],
        'pharmacology': ['pharmacokinetic', 'pharmacodynamic', 'absorption', 'metabolism'],
        'manufacturing': ['manufacturing', 'formulation', 'stability', 'quality'],
        'regulatory': ['regulatory', 'approval', 'compliance', 'requirement']
    }
    
    # Assign categories to each failure reason
    categorized_data = []
    
    for idx, reason in enumerate(failure_reasons):
        reason_lower = reason.lower()
        assigned_categories = []
        
        for category, keywords in categories.items():
            if any(keyword.lower() in reason_lower for keyword in keywords):
                assigned_categories.append(category)
        
        # If no categories match, assign 'other'
        if not assigned_categories:
            assigned_categories = ['other']
        
        # Add the first matching category to the dataframe
        categorized_data.append({
            'failure_reason': reason,
            'category': assigned_categories[0],
            'all_categories': assigned_categories
        })
    
    # Create a new dataframe with categorized data
    categorized_df = pd.DataFrame(categorized_data)
    
    # Print category distribution
    category_counts = categorized_df['category'].value_counts()
    print("\nFailure Reason Categories:")
    for category, count in category_counts.items():
        print(f"- {category}: {count}")
    
    return categories

def train_category_classifier(df, categories, project_root):
    """
    Train a classifier to predict failure categories from text
    """
    print("\nTraining category classifier...")
    
    # Flatten the list of all keywords
    all_keywords = []
    for category, keywords in categories.items():
        all_keywords.extend(keywords)
    
    # Assign labels based on keyword matching
    labels = []
    for reason in df['failure_reason']:
        reason_lower = reason.lower()
        for i, (category, keywords) in enumerate(categories.items()):
            if any(keyword.lower() in reason_lower for keyword in keywords):
                labels.append(category)
                break
        else:
            labels.append('other')
    
    # Add the labels to the dataframe
    df_with_labels = df.copy()
    df_with_labels['category'] = labels
    
    # Vectorize the text
    vectorizer = TfidfVectorizer(
        min_df=1, 
        max_df=0.9,
        max_features=200,
        stop_words='english',
        ngram_range=(1, 2)
    )
    
    X = vectorizer.fit_transform(df_with_labels['failure_reason'])
    y = df_with_labels['category']
    
    # Split data for training and testing
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    # Train model to predict category
    clf = LogisticRegression(C=1.0, class_weight='balanced', max_iter=1000, random_state=42, multi_class='multinomial')
    clf.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Category prediction accuracy: {accuracy:.2f}")
    
    # Save the trained models
    models_dir = os.path.join(project_root, "models")
    model_path = os.path.join(models_dir, "failure_category_classifier.pkl")
    vectorizer_path = os.path.join(models_dir, "failure_category_vectorizer.pkl")
    
    with open(model_path, 'wb') as f:
        pickle.dump(clf, f)
    
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vectorizer, f)
    
    print(f"Category classifier saved to: {model_path}")
    
    return clf, vectorizer

if __name__ == "__main__":
    train_failure_reason_classifier()