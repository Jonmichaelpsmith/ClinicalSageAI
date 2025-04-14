"""
FAIL MAP (Failure Analysis and Intelligent Learning for Medical Advancement Protocol)
A clinical trial failure prediction and analysis tool by Trialsage.ai

This application analyzes clinical trial protocols and predicts failure risks
based on a database of 3,000 simulated clinical studies.
"""

import os
import json
import sqlite3
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify, redirect, url_for
from werkzeug.utils import secure_filename
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import random
import re
import plotly.express as px
import plotly.graph_objects as go
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from io import BytesIO
import base64

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['DATABASE'] = 'failmap.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Connect to database
def get_db_connection():
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

# Initialize the database with 3,000 simulated clinical studies
def init_db():
    """Initialize the database with 3,000 simulated clinical studies"""
    conn = get_db_connection()
    
    # Drop tables if they exist
    conn.execute('DROP TABLE IF EXISTS studies')
    
    # Create new tables
    conn.execute('''
    CREATE TABLE studies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        therapeutic_area TEXT,
        indication TEXT,
        phase TEXT,
        sample_size INTEGER,
        randomization TEXT,
        blinding TEXT,
        primary_endpoint TEXT,
        region TEXT,
        success INTEGER
    )
    ''')
    
    # Generate and insert simulated data
    therapeutic_areas = ['Oncology', 'Neurology', 'Cardiology', 'Infectious Disease', 
                          'Psychiatry', 'Immunology', 'Metabolic', 'Respiratory']
    
    indications = generate_indications()
    phases = ['I', 'II', 'III', 'IV']
    randomizations = ['Yes', 'No']
    blindings = ['Double-blind', 'Single-blind', 'Open-label']
    primary_endpoints = ['Surrogate', 'Clinical', 'Biomarker']
    regions = ['North America', 'Europe', 'Asia', 'Global']
    
    # Generate 3,000 studies
    for i in range(3000):
        therapeutic_area = random.choice(therapeutic_areas)
        indication = random.choice(indications[therapeutic_area])
        phase = random.choice(phases)
        sample_size = generate_sample_size(phase, therapeutic_area)
        randomization = random.choice(randomizations)
        blinding = random.choice(blindings)
        primary_endpoint = random.choice(primary_endpoints)
        region = random.choice(regions)
        
        # Calculate success probability
        success_probability = calculate_success_probability(
            therapeutic_area, phase, sample_size, randomization, blinding
        )
        
        # Determine success based on probability
        success = 1 if random.random() < success_probability else 0
        
        # Insert into database
        conn.execute('''
        INSERT INTO studies 
        (therapeutic_area, indication, phase, sample_size, randomization, 
         blinding, primary_endpoint, region, success)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (therapeutic_area, indication, phase, sample_size, randomization, 
              blinding, primary_endpoint, region, success))
    
    conn.commit()
    conn.close()
    print(f"Database initialized with 3,000 simulated studies")

def generate_indications():
    """Generate realistic indications for each therapeutic area"""
    return {
        'Oncology': [
            'Metastatic Breast Cancer', 'Non-Small Cell Lung Cancer', 
            'Colorectal Cancer', 'Melanoma', 'Multiple Myeloma',
            'Pancreatic Cancer', 'Ovarian Cancer', 'Prostate Cancer'
        ],
        'Neurology': [
            'Alzheimer\'s Disease', 'Multiple Sclerosis', 'Parkinson\'s Disease',
            'Epilepsy', 'ALS', 'Migraine', 'Stroke', 'Neuropathic Pain'
        ],
        'Cardiology': [
            'Heart Failure', 'Hypertension', 'Atrial Fibrillation',
            'Coronary Artery Disease', 'Dyslipidemia', 'Pulmonary Hypertension'
        ],
        'Infectious Disease': [
            'HIV', 'Hepatitis C', 'Pneumonia', 'Influenza',
            'Tuberculosis', 'COVID-19', 'Sepsis', 'Malaria'
        ],
        'Psychiatry': [
            'Major Depressive Disorder', 'Schizophrenia', 'Bipolar Disorder',
            'Generalized Anxiety Disorder', 'ADHD', 'PTSD', 'Insomnia'
        ],
        'Immunology': [
            'Rheumatoid Arthritis', 'Lupus', 'Psoriasis', 'Crohn\'s Disease',
            'Ulcerative Colitis', 'Ankylosing Spondylitis', 'Atopic Dermatitis'
        ],
        'Metabolic': [
            'Type 2 Diabetes', 'Obesity', 'Non-alcoholic Steatohepatitis',
            'Hypercholesterolemia', 'Gout', 'Osteoporosis'
        ],
        'Respiratory': [
            'Asthma', 'COPD', 'Cystic Fibrosis', 'Idiopathic Pulmonary Fibrosis',
            'Allergic Rhinitis', 'Pulmonary Arterial Hypertension'
        ]
    }

def generate_sample_size(phase, therapeutic_area):
    """Generate realistic sample sizes based on phase and therapeutic area"""
    base_sizes = {
        'I': (20, 100),
        'II': (100, 300),
        'III': (300, 1500),
        'IV': (1000, 5000)
    }
    
    # Adjust based on therapeutic area
    modifiers = {
        'Oncology': 0.8,  # Typically smaller
        'Neurology': 1.1,
        'Cardiology': 1.3,  # Typically larger
        'Infectious Disease': 1.2,
        'Psychiatry': 1.1,
        'Immunology': 0.9,
        'Metabolic': 1.2,
        'Respiratory': 1.0
    }
    
    min_size, max_size = base_sizes[phase]
    modifier = modifiers[therapeutic_area]
    
    # Apply modifier and add randomness
    adjusted_min = int(min_size * modifier * (0.9 + 0.2 * random.random()))
    adjusted_max = int(max_size * modifier * (0.9 + 0.2 * random.random()))
    
    return random.randint(adjusted_min, adjusted_max)

def calculate_success_probability(therapeutic_area, phase, sample_size, randomization, blinding):
    """Calculate a realistic success probability based on various factors"""
    # Base probabilities by phase
    base_probs = {
        'I': 0.65,   # Phase I typically has higher success rates
        'II': 0.40,  # Phase II has the lowest success rates
        'III': 0.60, # Phase III is better but still challenging
        'IV': 0.90   # Phase IV usually confirms what's already known
    }
    
    # Therapeutic area modifiers
    ta_modifiers = {
        'Oncology': 0.8,         # Harder than average
        'Neurology': 0.7,        # Very challenging
        'Cardiology': 0.9,       # Better success rates
        'Infectious Disease': 1.0, # Average
        'Psychiatry': 0.75,      # Difficult placebo response
        'Immunology': 0.85,      # Moderately challenging
        'Metabolic': 0.9,        # Better success rates 
        'Respiratory': 0.95      # Generally good success rates
    }
    
    # Study design modifiers
    randomization_mod = 1.1 if randomization == 'Yes' else 0.7
    
    blinding_mods = {
        'Double-blind': 1.2,
        'Single-blind': 1.0,
        'Open-label': 0.8
    }
    
    # Sample size modifier - studies that are appropriately sized do better
    sample_size_mod = 1.0
    
    if phase == 'I' and sample_size < 20:
        sample_size_mod = 0.8
    elif phase == 'I' and sample_size > 100:
        sample_size_mod = 0.9
    elif phase == 'II' and sample_size < 100:
        sample_size_mod = 0.7
    elif phase == 'II' and sample_size > 300:
        sample_size_mod = 0.9
    elif phase == 'III' and sample_size < 300:
        sample_size_mod = 0.6
    elif phase == 'III' and sample_size > 2000:
        sample_size_mod = 0.9
    elif phase == 'IV' and sample_size < 1000:
        sample_size_mod = 0.8
    
    # Calculate overall probability
    probability = (
        base_probs[phase] * 
        ta_modifiers[therapeutic_area] * 
        randomization_mod * 
        blinding_mods[blinding] * 
        sample_size_mod
    )
    
    # Add some randomness and cap between 0 and 1
    probability = min(max(probability * (0.9 + 0.2 * random.random()), 0.0), 1.0)
    
    return probability

def weighted_random_choice(choices_dict):
    """Choose a random item from a dictionary with probability weights"""
    values = list(choices_dict.keys())
    weights = list(choices_dict.values())
    return random.choices(values, weights=weights, k=1)[0]

def generate_random_date(start_year, end_year):
    """Generate a random date between start_year and end_year"""
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)  # Simplified to avoid month-specific logic
    return f"{year}-{month:02d}-{day:02d}"

def load_data():
    """Load all studies from the database"""
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM studies", conn)
    conn.close()
    return df

def train_model(df):
    """Train a RandomForest model to predict study outcomes"""
    # Convert categorical variables to one-hot encoding
    X = pd.get_dummies(df[[
        'therapeutic_area', 'phase', 'randomization', 
        'blinding', 'primary_endpoint', 'region'
    ]], drop_first=True)
    
    # Add numerical features
    X['sample_size'] = df['sample_size']
    
    # Target variable
    y = df['success']
    
    # Scale numerical features
    scaler = StandardScaler()
    X['sample_size'] = scaler.fit_transform(X[['sample_size']])
    
    # Train the model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    return model, X.columns

def extract_features(form_data):
    """Extract and validate study features from form input"""
    protocol_text = form_data.get('protocol', '')
    
    # Initial empty dict for extracted features
    features = {}
    
    # Extract features using regular expressions and patterns
    
    # Therapeutic area and indication
    ta_patterns = {
        'oncology': r'(?i)(cancer|oncology|tumor|neoplasm|carcinoma|sarcoma|leukemia|lymphoma|myeloma)',
        'neurology': r'(?i)(neuro|brain|alzheimer|parkinson|epilepsy|seizure|multiple sclerosis|stroke|als)',
        'cardiology': r'(?i)(heart|cardio|cardiac|hypertension|blood pressure|arterial|ventricular|atrial|fibrillation)',
        'infectious disease': r'(?i)(infection|virus|bacterial|pathogen|hiv|hepatitis|pneumonia|covid|influenza|tuberculosis)',
        'psychiatry': r'(?i)(psych|depression|anxiety|bipolar|schizophrenia|mental health|adhd|ptsd)',
        'immunology': r'(?i)(immun|autoimmune|rheumatoid|lupus|psoriasis|crohn|colitis|inflammatory)',
        'metabolic': r'(?i)(metabolic|diabetes|obesity|nash|cholesterol|lipid|gout|osteoporosis)',
        'respiratory': r'(?i)(respiratory|lung|pulmonary|asthma|copd|cystic fibrosis|bronchitis|emphysema)'
    }
    
    for area, pattern in ta_patterns.items():
        if re.search(pattern, protocol_text):
            if 'therapeutic_area' not in features:
                features['therapeutic_area'] = area.capitalize()
    
    if 'therapeutic_area' not in features:
        # Default if no match
        features['therapeutic_area'] = 'Oncology'
    
    # Now try to extract the specific indication
    indications = generate_indications()
    features['indication'] = 'Not specified'
    
    for indication in indications[features['therapeutic_area']]:
        if re.search(f"(?i){indication}", protocol_text):
            features['indication'] = indication
            break
    
    # Phase
    phase_match = re.search(r'(?i)phase\s+([I|II|III|IV|1|2|3|4]{1,4})', protocol_text)
    if phase_match:
        phase = phase_match.group(1).upper()
        # Convert numerical phases to Roman numerals
        if phase == '1': phase = 'I'
        elif phase == '2': phase = 'II'
        elif phase == '3': phase = 'III'
        elif phase == '4': phase = 'IV'
        features['phase'] = phase
    else:
        # Default if no match
        features['phase'] = 'II'
    
    # Sample size
    sample_size_match = re.search(r'(?i)(\d+)\s*(?:patients|subjects|participants|individuals|people)', protocol_text)
    if sample_size_match:
        features['sample_size'] = int(sample_size_match.group(1))
    else:
        # Default if no match - will be based on phase
        features['sample_size'] = generate_sample_size(features['phase'], features['therapeutic_area'])
    
    # Randomization
    if re.search(r'(?i)random', protocol_text):
        features['randomization'] = 'Yes'
    else:
        features['randomization'] = 'No'
    
    # Blinding
    if re.search(r'(?i)double.?blind', protocol_text):
        features['blinding'] = 'Double-blind'
    elif re.search(r'(?i)single.?blind', protocol_text):
        features['blinding'] = 'Single-blind'
    else:
        features['blinding'] = 'Open-label'
    
    # Primary endpoint
    endpoint_patterns = {
        'Surrogate': r'(?i)(biomarker|imaging|laboratory|surrogate)',
        'Clinical': r'(?i)(survival|progression.free|response|remission|clinical|symptom|quality.of.life|outcome)',
        'Biomarker': r'(?i)(plasma|blood|serum|urine|biopsy|genomic|proteomic|immunologic)'
    }
    
    for endpoint, pattern in endpoint_patterns.items():
        if re.search(pattern, protocol_text):
            features['primary_endpoint'] = endpoint
            break
    
    if 'primary_endpoint' not in features:
        # Default if no match
        features['primary_endpoint'] = 'Clinical'
    
    # Region
    region_patterns = {
        'North America': r'(?i)(north.america|united.states|canada|usa|u\.s\.)',
        'Europe': r'(?i)(europe|eu|uk|england|france|germany|italy|spain)',
        'Asia': r'(?i)(asia|china|japan|korea|india|singapore)',
        'Global': r'(?i)(global|international|world.?wide|multi.?national|multi.?region)'
    }
    
    for region, pattern in region_patterns.items():
        if re.search(pattern, protocol_text):
            features['region'] = region
            break
    
    if 'region' not in features:
        # Default if no match
        features['region'] = 'Global'
    
    return features

def find_similar_studies(features, df):
    """Find similar studies based on multiple criteria"""
    # Get the therapeutic area first
    ta_studies = df[df['therapeutic_area'] == features['therapeutic_area']]
    
    # Then narrow down by phase
    similar_studies = ta_studies[ta_studies['phase'] == features['phase']]
    
    # If we have too few results, relax constraints gradually
    if len(similar_studies) < 5:
        # Try matching only therapeutic area
        similar_studies = ta_studies
    
    # If still too few, include all phases for this therapeutic area
    if len(similar_studies) < 5:
        similar_studies = df[df['therapeutic_area'] == features['therapeutic_area']]
    
    # If still too few, return anything
    if len(similar_studies) < 5:
        return df.sample(min(10, len(df)))
    
    # Limit to top 10 most similar
    return similar_studies.head(10)

def analyze_failures(similar_studies, features, model_data):
    """Analyze failure patterns and generate recommendations"""
    # Unpack model and feature columns
    model, feature_cols = model_data
    
    # Create feature vector for prediction
    features_x = pd.DataFrame([{
        'therapeutic_area': features['therapeutic_area'],
        'phase': features['phase'],
        'randomization': features['randomization'],
        'blinding': features['blinding'],
        'primary_endpoint': features['primary_endpoint'],
        'region': features['region'],
        'sample_size': features['sample_size']
    }])
    
    # Convert to one-hot encoding to match training data
    X = pd.get_dummies(features_x[[
        'therapeutic_area', 'phase', 'randomization', 
        'blinding', 'primary_endpoint', 'region'
    ]], drop_first=True)
    
    # Add numerical features
    X['sample_size'] = features_x['sample_size']
    
    # Scale numerical features
    scaler = StandardScaler()
    X['sample_size'] = scaler.fit_transform(X[['sample_size']])
    
    # Ensure X has same columns as training data
    for col in feature_cols:
        if col not in X.columns:
            X[col] = 0
    X = X[feature_cols]  # Ensure same column order
    
    # Make prediction
    success_prob = model.predict_proba(X)[0][1]  # Probability of class 1 (success)
    
    # Analyze key risk factors
    risk_factors = []
    recommendations = []
    
    # Check sample size
    phase = features['phase']
    if phase == 'I' and features['sample_size'] < 20:
        risk_factors.append("Sample size is below typical range for Phase I trials (20-100)")
        recommendations.append("Consider increasing sample size to at least 20 participants")
    elif phase == 'II' and features['sample_size'] < 100:
        risk_factors.append("Sample size is too small for Phase II (typically 100-300)")
        recommendations.append("Increase sample size to at least 100 participants for adequate power")
    elif phase == 'III' and features['sample_size'] < 300:
        risk_factors.append("Sample size is insufficient for Phase III (typically 300-1500)")
        recommendations.append("Significantly increase sample size for Phase III to ensure regulatory acceptance")
    elif phase == 'IV' and features['sample_size'] < 1000:
        risk_factors.append("Post-marketing study (Phase IV) typically requires larger populations (1000+)")
        recommendations.append("Increase sample size to at least 1000 for meaningful post-marketing insights")
    
    # Check blinding
    if features['blinding'] == 'Open-label' and features['phase'] in ['II', 'III']:
        risk_factors.append("Open-label design introduces significant bias in Phase II/III trials")
        recommendations.append("Consider implementing at least single-blinding to reduce bias")
    
    # Check randomization
    if features['randomization'] == 'No':
        risk_factors.append("Non-randomized design may lead to selection bias and confounding")
        recommendations.append("Implement randomization to enhance study validity and credibility")
    
    # Therapeutic area specific risks
    ta = features['therapeutic_area']
    if ta == 'Oncology' and features['primary_endpoint'] != 'Surrogate' and phase == 'II':
        risk_factors.append("Phase II oncology trials often benefit from surrogate endpoints")
        recommendations.append("Consider including surrogate endpoints like objective response rate or PFS")
    
    if ta == 'Neurology':
        risk_factors.append("Neurological studies have high historic failure rates (~86%)")
        recommendations.append("Implement robust patient selection criteria and consider biomarker-guided approach")
    
    # Generate failure analysis report
    analysis = {
        'success_probability': success_prob,
        'risk_factors': risk_factors,
        'recommendations': recommendations,
        'similar_studies': similar_studies.to_dict('records')
    }
    
    return analysis

# Routes
@app.route('/')
def index():
    """Main route handling form submission and study analysis"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """API endpoint for analysis (for frontend AJAX calls)"""
    if request.method == 'POST':
        # Extract study features from the protocol text
        features = extract_features(request.form)
        
        # Load training data and train model
        df = load_data()
        model_data = train_model(df)
        
        # Find similar studies
        similar_studies = find_similar_studies(features, df)
        
        # Analyze failure patterns and generate recommendations
        analysis = analyze_failures(similar_studies, features, model_data)
        
        return render_template('results.html', features=features, analysis=analysis)
    
    return redirect(url_for('index'))

@app.route('/about')
def about():
    """About page with application information"""
    return render_template('about.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_api():
    """API endpoint for analysis (for frontend AJAX calls)"""
    try:
        # Get JSON data
        data = request.get_json()
        protocol_text = data.get('protocol', '')
        
        # Extract features
        form_data = {'protocol': protocol_text}
        features = extract_features(form_data)
        
        # Load data and train model
        df = load_data()
        model_data = train_model(df)
        
        # Find similar studies
        similar_studies = find_similar_studies(features, df)
        
        # Generate analysis
        analysis = analyze_failures(similar_studies, features, model_data)
        
        # Return JSON response
        return jsonify({
            'features': features,
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_form_data_from_protocol(protocol_text):
    """Extract structured data from protocol text using basic pattern matching
    
    In a production app, this would use advanced NLP to extract information.
    For this demo, we'll use simple pattern matching.
    """
    # This is a simplified version of the extract_features function
    form_data = {'protocol': protocol_text}
    return extract_features(form_data)

@app.errorhandler(500)
def server_error(e):
    return render_template('error.html', error=str(e)), 500

@app.errorhandler(404)
def not_found(e):
    return render_template('error.html', error="Page not found"), 404

# Initialize database with sample studies on first run
if not os.path.exists(app.config['DATABASE']):
    init_db()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)