import os
import re
import time
import numpy as np
import pandas as pd
import sqlite3
import json
import random
import logging
from flask import Flask, request, redirect, url_for, render_template, jsonify, abort
from werkzeug.utils import secure_filename
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('trialsage')

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['DATABASE'] = 'trialsage.db'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Therapeutic areas with their associated common endpoints
THERAPEUTIC_AREAS = {
    'Oncology': ['Overall Survival (OS)', 'Progression-Free Survival (PFS)', 'Objective Response Rate (ORR)', 'Disease-Free Survival (DFS)'],
    'Cardiology': ['Major Adverse Cardiac Events (MACE)', 'Left Ventricular Ejection Fraction (LVEF)', 'Blood Pressure', 'Cholesterol Levels'],
    'Neurology': ['Modified Rankin Scale (mRS)', 'Mini-Mental State Examination (MMSE)', 'Seizure Frequency', 'Pain Score'],
    'Endocrinology': ['HbA1c Level', 'Fasting Plasma Glucose', 'Body Mass Index (BMI)', 'Insulin Sensitivity'],
    'Immunology': ['Disease Activity Score (DAS)', 'American College of Rheumatology (ACR) Response', 'Antibody Levels', 'C-Reactive Protein (CRP)'],
    'Respiratory': ['Forced Expiratory Volume (FEV1)', 'Asthma Exacerbations', 'Oxygen Saturation', 'Exercise Capacity'],
    'Infectious Disease': ['Viral Load', 'Antibody Titers', 'Time to Resolution of Symptoms', 'Infection Rate']
}

# Common phases
PHASES = ['I', 'II', 'III', 'IV']

# Common geographies
GEOGRAPHIES = ['USA', 'EU', 'Asia', 'Global', 'Africa', 'South America']

# Sample randomization methodologies
RANDOMIZATION_METHODS = ['1:1', '2:1', '3:1', '1:1:1', '2:2:1', 'None']

# Common failure reasons with probability weights
FAILURE_REASONS = {
    'Lack of Efficacy': 0.4,
    'Safety Concerns': 0.25,
    'Recruitment Issues': 0.15,
    'Protocol Deviations': 0.1,
    'Funding/Business Decision': 0.05,
    'Operational Challenges': 0.05
}

# Initialize database with simulated 3,000 CSR dataset
def init_db():
    """Initialize the database with 3,000 simulated clinical studies"""
    logger.info("Initializing database with 3,000 simulated studies...")
    
    conn = sqlite3.connect(app.config['DATABASE'])
    c = conn.cursor()
    
    # Create studies table
    c.execute('''CREATE TABLE IF NOT EXISTS studies (
                 id INTEGER PRIMARY KEY,
                 therapeutic_area TEXT,
                 indication TEXT,
                 phase TEXT,
                 geography TEXT,
                 sample_size INTEGER,
                 endpoint TEXT,
                 randomization TEXT,
                 blinding TEXT,
                 outcome TEXT,
                 failure_reason TEXT,
                 similarity_score REAL,
                 created_at TEXT,
                 description TEXT
    )''')
    
    # Check if we already have data
    c.execute("SELECT COUNT(*) FROM studies")
    count = c.fetchone()[0]
    
    if count == 0:
        # Generate 3,000 simulated studies
        studies = []
        indications = generate_indications()
        
        for i in range(3000):
            therapeutic_area = random.choice(list(THERAPEUTIC_AREAS.keys()))
            indication = random.choice(indications[therapeutic_area])
            phase = random.choice(PHASES)
            geography = random.choice(GEOGRAPHIES)
            sample_size = generate_sample_size(phase, therapeutic_area)
            endpoint = random.choice(THERAPEUTIC_AREAS[therapeutic_area])
            randomization = random.choice(RANDOMIZATION_METHODS)
            blinding = random.choice(['Double-Blind', 'Single-Blind', 'Open-Label'])
            
            # Determine outcome based on realistic factors
            success_prob = calculate_success_probability(therapeutic_area, phase, sample_size, randomization, blinding)
            outcome = 'Success' if random.random() < success_prob else 'Failure'
            
            # Assign failure reason if applicable
            if outcome == 'Failure':
                failure_reason = weighted_random_choice(FAILURE_REASONS)
            else:
                failure_reason = ''
                
            # Generate description
            description = f"{phase} {therapeutic_area} study for {indication} with {sample_size} participants, targeting {endpoint} as primary endpoint. {randomization} randomization, {blinding} design conducted in {geography}."
            
            # Timestamp
            created_at = generate_random_date(2020, 2025)
            
            studies.append((
                therapeutic_area, 
                indication,
                phase, 
                geography, 
                sample_size,
                endpoint,
                randomization,
                blinding,
                outcome, 
                failure_reason,
                0.0,  # initial similarity score
                created_at,
                description
            ))
        
        c.executemany('''INSERT INTO studies 
                       (therapeutic_area, indication, phase, geography, sample_size, endpoint, 
                        randomization, blinding, outcome, failure_reason, similarity_score, created_at, description) 
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''', 
                     studies)
        
        conn.commit()
        logger.info(f"Created {len(studies)} simulated studies in the database")
    else:
        logger.info(f"Database already contains {count} studies, skipping initialization")
    
    conn.close()

def generate_indications():
    """Generate realistic indications for each therapeutic area"""
    return {
        'Oncology': ['Non-small Cell Lung Cancer', 'Breast Cancer', 'Colorectal Cancer', 'Prostate Cancer', 'Melanoma', 'Ovarian Cancer', 'Pancreatic Cancer'],
        'Cardiology': ['Heart Failure', 'Hypertension', 'Atrial Fibrillation', 'Coronary Artery Disease', 'Myocardial Infarction', 'Hyperlipidemia'],
        'Neurology': ['Alzheimer\'s Disease', 'Parkinson\'s Disease', 'Multiple Sclerosis', 'Epilepsy', 'Migraine', 'Stroke'],
        'Endocrinology': ['Type 2 Diabetes', 'Type 1 Diabetes', 'Obesity', 'Hypothyroidism', 'Cushing\'s Syndrome'],
        'Immunology': ['Rheumatoid Arthritis', 'Psoriasis', 'Crohn\'s Disease', 'Lupus', 'Multiple Sclerosis'],
        'Respiratory': ['Asthma', 'COPD', 'Cystic Fibrosis', 'Pulmonary Hypertension', 'Pulmonary Fibrosis'],
        'Infectious Disease': ['HIV', 'Hepatitis C', 'Influenza', 'Tuberculosis', 'COVID-19', 'Malaria']
    }

def generate_sample_size(phase, therapeutic_area):
    """Generate realistic sample sizes based on phase and therapeutic area"""
    if phase == 'I':
        # Phase I typically has fewer participants
        return random.randint(20, 100)
    elif phase == 'II':
        return random.randint(100, 300)
    elif phase == 'III':
        # Phase III typically has many participants
        if therapeutic_area in ['Cardiology', 'Infectious Disease']:
            # These areas often have larger trials
            return random.randint(500, 2000)
        else:
            return random.randint(300, 1000)
    else:  # Phase IV
        return random.randint(200, 800)

def calculate_success_probability(therapeutic_area, phase, sample_size, randomization, blinding):
    """Calculate a realistic success probability based on various factors"""
    # Base probability
    base_prob = 0.5
    
    # Adjust for therapeutic area (some are more challenging)
    area_adjustments = {
        'Oncology': -0.1,  # Historically more challenging
        'Neurology': -0.15,  # Very challenging
        'Cardiology': 0.05,
        'Infectious Disease': 0.1,
        'Endocrinology': 0.05,
        'Immunology': -0.05,
        'Respiratory': 0.0
    }
    base_prob += area_adjustments.get(therapeutic_area, 0)
    
    # Adjust for phase (later phases are more likely to succeed given previous filters)
    phase_adjustments = {
        'I': 0.1,  # Safety-focused, often successful
        'II': -0.1,  # Efficacy proof, often challenging
        'III': 0.05,  # More refined, but high bar
        'IV': 0.15  # Post-approval, lower risk
    }
    base_prob += phase_adjustments.get(phase, 0)
    
    # Sample size relative adjustment
    if phase == 'II' and sample_size < 150:
        base_prob -= 0.05  # Too small for phase II
    if phase == 'III' and sample_size < 300:
        base_prob -= 0.1  # Too small for phase III
        
    # Randomization method
    if randomization == 'None':
        base_prob -= 0.1  # Non-randomized has higher failure risk
        
    # Blinding
    if blinding == 'Open-Label':
        base_prob -= 0.05  # Open label has higher failure risk
        
    # Ensure probability is within bounds
    return max(0.3, min(0.7, base_prob))  # Keep between 30% and 70% for realism

def weighted_random_choice(choices_dict):
    """Choose a random item from a dictionary with probability weights"""
    choices, weights = zip(*choices_dict.items())
    return random.choices(choices, weights=weights, k=1)[0]

def generate_random_date(start_year, end_year):
    """Generate a random date between start_year and end_year"""
    start = datetime(start_year, 1, 1).timestamp()
    end = datetime(end_year, 12, 31).timestamp()
    random_time = start + random.random() * (end - start)
    return datetime.fromtimestamp(random_time).strftime('%Y-%m-%d')

# Load data from database
def load_data():
    """Load all studies from the database"""
    try:
        conn = sqlite3.connect(app.config['DATABASE'])
        df = pd.read_sql_query("SELECT * FROM studies", conn)
        conn.close()
        return df
    except Exception as e:
        logger.error(f"Error loading data from database: {e}")
        return pd.DataFrame()

# Train predictive model
def train_model(df):
    """Train a RandomForest model to predict study outcomes"""
    logger.info("Training predictive model...")
    
    # Encode categorical variables
    le_outcome = LabelEncoder()
    le_ta = LabelEncoder()
    le_phase = LabelEncoder()
    le_geo = LabelEncoder()
    le_randomization = LabelEncoder()
    le_blinding = LabelEncoder()
    
    # Transform categories to numerical values
    df['outcome_encoded'] = le_outcome.fit_transform(df['outcome'])
    df['ta_encoded'] = le_ta.fit_transform(df['therapeutic_area'])
    df['phase_encoded'] = le_phase.fit_transform(df['phase'])
    df['geo_encoded'] = le_geo.fit_transform(df['geography'])
    df['randomization_encoded'] = le_randomization.fit_transform(df['randomization'])
    df['blinding_encoded'] = le_blinding.fit_transform(df['blinding'])
    
    # Features for the model
    features = ['ta_encoded', 'phase_encoded', 'geo_encoded', 
                'sample_size', 'randomization_encoded', 'blinding_encoded']
    
    X = df[features]
    y = df['outcome_encoded']
    
    # Scale numerical features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train the model
    start = time.time()
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)
    duration = time.time() - start
    
    logger.info(f"Model training completed in {duration:.2f} seconds")
    
    # Return all necessary objects for prediction
    return {
        'model': model,
        'scaler': scaler,
        'le_outcome': le_outcome,
        'le_ta': le_ta,
        'le_phase': le_phase,
        'le_geo': le_geo,
        'le_randomization': le_randomization,
        'le_blinding': le_blinding
    }

# Extract features from form input or text analysis
def extract_features(form_data):
    """Extract and validate study features from form input"""
    
    # Default values
    defaults = {
        'therapeutic_area': 'Oncology',
        'indication': 'Breast Cancer',
        'phase': 'II',
        'geography': 'Global',
        'sample_size': 150,
        'endpoint': 'Overall Survival (OS)',
        'randomization': '1:1',
        'blinding': 'Double-Blind'
    }
    
    # Extract values from form with defaults
    features = {
        'therapeutic_area': form_data.get('therapeutic_area', defaults['therapeutic_area']),
        'indication': form_data.get('indication', defaults['indication']),
        'phase': form_data.get('phase', defaults['phase']),
        'geography': form_data.get('geography', defaults['geography']),
        'sample_size': int(form_data.get('sample_size', defaults['sample_size'])),
        'endpoint': form_data.get('endpoint', defaults['endpoint']),
        'randomization': form_data.get('randomization', defaults['randomization']),
        'blinding': form_data.get('blinding', defaults['blinding']),
    }
    
    # Simple validation
    # Ensure therapeutic area is valid
    if features['therapeutic_area'] not in THERAPEUTIC_AREAS:
        features['therapeutic_area'] = defaults['therapeutic_area']
        
    # Ensure phase is valid
    if features['phase'] not in PHASES:
        features['phase'] = defaults['phase']
        
    # Ensure sample size is positive
    if features['sample_size'] <= 0:
        features['sample_size'] = defaults['sample_size']
    
    return features

# Find similar studies using a combination of exact and fuzzy matching
def find_similar_studies(features, df):
    """Find similar studies based on multiple criteria"""
    logger.info(f"Finding similar studies for {features['therapeutic_area']} {features['phase']} study")
    
    # Copy dataframe to avoid modifying original
    df_copy = df.copy()
    
    # Calculate similarity scores
    df_copy['similarity_score'] = 0.0
    
    # Exact match scoring - higher weights for key attributes
    weights = {
        'therapeutic_area': 3.0,
        'phase': 2.0,
        'indication': 1.5,
        'geography': 1.0,
        'endpoint': 1.0,
        'randomization': 0.5,
        'blinding': 0.5
    }
    
    # Apply exact match scoring
    for attr, weight in weights.items():
        mask = df_copy[attr] == features[attr]
        df_copy.loc[mask, 'similarity_score'] += weight
    
    # Sample size similarity (continuous variable)
    # Convert to relative distance metric
    df_copy['size_diff'] = abs(df_copy['sample_size'] - features['sample_size'])
    size_max_diff = df_copy['size_diff'].max()
    if size_max_diff > 0:  # Avoid division by zero
        df_copy['size_similarity'] = 1 - (df_copy['size_diff'] / size_max_diff)
        df_copy['similarity_score'] += df_copy['size_similarity'] * 1.5  # Weight for sample size
    
    # Sort by similarity score and take top matches
    similar_studies = df_copy.sort_values(by='similarity_score', ascending=False).head(50)
    
    logger.info(f"Found {len(similar_studies)} similar studies")
    return similar_studies

# Analyze failures and generate detailed recommendations
def analyze_failures(similar_studies, features, model_data):
    """Analyze failure patterns and generate recommendations"""
    logger.info("Analyzing failure patterns and generating recommendations...")
    
    # Split studies by outcome
    failed_studies = similar_studies[similar_studies['outcome'] == 'Failure']
    successful_studies = similar_studies[similar_studies['outcome'] == 'Success']
    
    # Get failure reason distribution
    failure_reasons = failed_studies['failure_reason'].value_counts().to_dict()
    
    # Analysis insights (recommendations)
    insights = []
    
    # 1. Sample size analysis
    if not successful_studies.empty:
        success_size_mean = successful_studies['sample_size'].mean()
        success_size_std = successful_studies['sample_size'].std()
        
        if features['sample_size'] < success_size_mean - success_size_std:
            insights.append(f"Sample size ({features['sample_size']}) is significantly below the average for successful studies ({success_size_mean:.0f} ± {success_size_std:.0f}). Strongly recommend increasing to at least {int(success_size_mean)} participants.")
        elif features['sample_size'] < success_size_mean:
            insights.append(f"Sample size ({features['sample_size']}) is below average for successful studies ({success_size_mean:.0f}). Consider increasing to {int(success_size_mean)} participants for better outcomes.")
        else:
            insights.append(f"Sample size ({features['sample_size']}) is appropriate based on successful similar studies (average: {success_size_mean:.0f}).")
    
    # 2. Predict failure probability using the model
    try:
        # Prepare feature vector for prediction
        model = model_data['model']
        scaler = model_data['scaler']
        le_outcome = model_data['le_outcome']
        le_ta = model_data['le_ta']
        le_phase = model_data['le_phase']
        le_geo = model_data['le_geo']
        le_randomization = model_data['le_randomization']
        le_blinding = model_data['le_blinding']
        
        # Transform user inputs to the format expected by the model
        feature_vector = np.array([
            le_ta.transform([features['therapeutic_area']])[0],
            le_phase.transform([features['phase']])[0],
            le_geo.transform([features['geography']])[0],
            features['sample_size'],
            le_randomization.transform([features['randomization']])[0],
            le_blinding.transform([features['blinding']])[0]
        ]).reshape(1, -1)
        
        # Scale the features
        feature_vector_scaled = scaler.transform(feature_vector)
        
        # Predict failure probability
        probabilities = model.predict_proba(feature_vector_scaled)[0]
        failure_index = np.where(le_outcome.classes_ == le_outcome.transform(['Failure'])[0])[0][0]
        failure_prob = probabilities[failure_index] * 100
        
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        failure_prob = 50.0  # Default probability if prediction fails
    
    # 3. Insights from failure reasons
    if failure_reasons:
        top_reason = max(failure_reasons, key=failure_reasons.get)
        count = failure_reasons[top_reason]
        total = len(failed_studies)
        percent = (count / total) * 100
        
        insights.append(f"Most common failure reason in similar studies: '{top_reason}' ({percent:.1f}% of failures). Consider mitigation strategies specifically addressing this risk.")
        
        # Additional specific recommendations based on top failure reason
        if top_reason == 'Lack of Efficacy':
            insights.append("Consider adding interim analyses to detect efficacy signals early, or refining patient selection criteria to target more responsive populations.")
        elif top_reason == 'Safety Concerns':
            insights.append("Consider more stringent inclusion/exclusion criteria, lower initial dosing, or more frequent safety monitoring.")
        elif top_reason == 'Recruitment Issues':
            insights.append("Consider broadening eligibility criteria, adding more study sites, or providing additional support for participant retention.")
        elif top_reason == 'Protocol Deviations':
            insights.append("Review protocol complexity and consider simplifying procedures or providing additional site training.")
    
    # 4. Design-specific insights
    if features['blinding'] == 'Open-Label' and successful_studies['blinding'].value_counts().get('Double-Blind', 0) > successful_studies['blinding'].value_counts().get('Open-Label', 0):
        insights.append("Double-blind studies show higher success rates than open-label studies in this therapeutic area. Consider enhancing blinding if possible.")
    
    # Generate failure probability intervals for visualization
    similarity_distribution = []
    similarity_bins = np.arange(0, 1.1, 0.1)
    for i in range(len(similarity_bins)-1):
        low = similarity_bins[i]
        high = similarity_bins[i+1]
        count = similar_studies[(similar_studies['similarity_score'] >= low) & 
                                (similar_studies['similarity_score'] < high)].shape[0]
        similarity_distribution.append({
            'similarity': f"{low:.1f}-{high:.1f}",
            'count': count
        })
    
    # Format failure reasons for visualization
    failure_chart_data = []
    for reason, count in failure_reasons.items():
        if reason:  # Skip empty reasons
            failure_chart_data.append({
                'name': reason,
                'value': count
            })
    
    # Return all analysis results
    return {
        'failure_prob': failure_prob,
        'insights': insights,
        'failure_reasons': failure_chart_data,
        'similarity_distribution': similarity_distribution
    }

@app.route('/', methods=['GET', 'POST'])
def index():
    """Main route handling form submission and study analysis"""
    if request.method == 'POST':
        try:
            # Get protocol from form
            protocol = request.form.get('protocol', '')
            
            # Extract features based on protocol text
            # This would use NLP in a production app, but we'll use form data for this demo
            # Extract form data (in production, this would come from NLP analysis of the protocol)
            form_data = extract_form_data_from_protocol(protocol)
            features = extract_features(form_data)
            
            # Load data and train model
            df = load_data()
            model_data = train_model(df)
            
            # Find similar studies
            similar_studies = find_similar_studies(features, df)
            
            # Analyze and generate recommendations
            analysis_results = analyze_failures(similar_studies, features, model_data)
            
            # Prepare similar studies data for table display
            similar_studies_data = []
            for idx, row in similar_studies.head(15).iterrows():
                similar_studies_data.append({
                    'id': int(row['id']),
                    'therapeutic_area': row['therapeutic_area'],
                    'phase': row['phase'],
                    'sample_size': int(row['sample_size']),
                    'outcome': row['outcome'],
                    'failure_reason': row['failure_reason'] if row['failure_reason'] else 'N/A',
                    'similarity': float(row['similarity_score'])
                })
            
            # Combine all results
            results = {
                'study_features': features,
                'failure_prob': round(analysis_results['failure_prob'], 1),
                'insights': analysis_results['insights'],
                'failure_reasons': analysis_results['failure_reasons'],
                'similarity_distribution': analysis_results['similarity_distribution'],
                'similar_studies': similar_studies_data
            }
            
            return render_template('index.html', results=json.dumps(results))
        
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return render_template('index.html', error=str(e))
    
    # GET request - just render the form
    return render_template('index.html')

@app.route('/about')
def about():
    """About page with application information"""
    return render_template('about.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_api():
    """API endpoint for analysis (for frontend AJAX calls)"""
    try:
        data = request.json
        protocol = data.get('protocol', '')
        
        # Process the protocol (similarly to the route handler)
        form_data = extract_form_data_from_protocol(protocol)
        features = extract_features(form_data)
        
        df = load_data()
        model_data = train_model(df)
        similar_studies = find_similar_studies(features, df)
        analysis_results = analyze_failures(similar_studies, features, model_data)
        
        # Prepare similar studies data
        similar_studies_data = []
        for idx, row in similar_studies.head(15).iterrows():
            similar_studies_data.append({
                'id': int(row['id']),
                'therapeutic_area': row['therapeutic_area'],
                'phase': row['phase'],
                'sample_size': int(row['sample_size']),
                'outcome': row['outcome'],
                'failure_reason': row['failure_reason'] if row['failure_reason'] else 'N/A',
                'similarity': float(row['similarity_score'])
            })
        
        # Combine and return results
        results = {
            'study_features': features,
            'failure_prob': round(analysis_results['failure_prob'], 1),
            'insights': analysis_results['insights'],
            'failure_reasons': analysis_results['failure_reasons'],
            'similarity_distribution': analysis_results['similarity_distribution'],
            'similar_studies': similar_studies_data
        }
        
        return jsonify(results)
    
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({'error': str(e)}), 500

def extract_form_data_from_protocol(protocol_text):
    """Extract structured data from protocol text using basic pattern matching
    
    In a production app, this would use advanced NLP to extract information.
    For this demo, we'll use simple pattern matching.
    """
    form_data = {}
    
    # Extract therapeutic area
    for area in THERAPEUTIC_AREAS.keys():
        if area.lower() in protocol_text.lower():
            form_data['therapeutic_area'] = area
            break
    
    # Extract phase
    phase_match = re.search(r'phase\s+(i{1,3}|iv|[1-4])', protocol_text, re.IGNORECASE)
    if phase_match:
        phase = phase_match.group(1).upper()
        # Convert numeric to Roman numerals if needed
        if phase == '1': phase = 'I'
        elif phase == '2': phase = 'II'
        elif phase == '3': phase = 'III'
        elif phase == '4': phase = 'IV'
        form_data['phase'] = phase
    
    # Extract sample size
    size_match = re.search(r'(\d+)\s*(?:patients|participants|subjects)', protocol_text, re.IGNORECASE)
    if size_match:
        form_data['sample_size'] = size_match.group(1)
    
    # Extract indication based on therapeutic area
    if 'therapeutic_area' in form_data:
        indications = generate_indications()[form_data['therapeutic_area']]
        for indication in indications:
            if indication.lower() in protocol_text.lower():
                form_data['indication'] = indication
                break
    
    # Extract geography
    for geo in GEOGRAPHIES:
        if geo.lower() in protocol_text.lower():
            form_data['geography'] = geo
            break
    
    # Extract randomization
    for method in RANDOMIZATION_METHODS:
        if method.lower() in protocol_text.lower():
            form_data['randomization'] = method
            break
    
    # Extract blinding
    if 'double-blind' in protocol_text.lower() or 'double blind' in protocol_text.lower():
        form_data['blinding'] = 'Double-Blind'
    elif 'single-blind' in protocol_text.lower() or 'single blind' in protocol_text.lower():
        form_data['blinding'] = 'Single-Blind'
    elif 'open-label' in protocol_text.lower() or 'open label' in protocol_text.lower():
        form_data['blinding'] = 'Open-Label'
    
    # Extract endpoint - look for common endpoints in the protocol
    if 'therapeutic_area' in form_data:
        endpoints = THERAPEUTIC_AREAS[form_data['therapeutic_area']]
        for endpoint in endpoints:
            # Create a regex pattern to match the endpoint with flexibility
            # This will match abbreviations (e.g., "OS") or the full term ("Overall Survival")
            pattern = r'\b' + re.escape(endpoint.split('(')[0].strip()) + r'\b|\b' + re.escape(endpoint.split('(')[-1].strip('()')) + r'\b'
            if re.search(pattern, protocol_text, re.IGNORECASE):
                form_data['endpoint'] = endpoint
                break
    
    return form_data

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Server error: {e}")
    return render_template('error.html', error=str(e)), 500

@app.errorhandler(404)
def not_found(e):
    return render_template('error.html', error="Page not found"), 404

if __name__ == '__main__':
    # Initialize database if it doesn't exist
    if not os.path.exists(app.config['DATABASE']):
        init_db()
    
    # Start Flask app on port 8080 for Replit
    app.run(host='0.0.0.0', port=8080, debug=True)