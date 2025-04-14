# Trialsage.ai FAIL MAP

A global intelligence system for Clinical Study Reports (CSRs), providing risk analysis and recommendations for clinical trial protocols.

## Features

- Analyze study protocols to predict failure probability based on historical data
- Find similar studies from a dataset of 3,000 clinical trials
- Generate actionable recommendations to improve study design
- Interactive visualizations of failure reasons and similarity distributions
- Advanced pattern matching to extract protocol details

## Running the Application

To run the FAIL MAP application, execute the following command in the Replit terminal:

```bash
python3 failmap.py
```

This will start the Flask server on port 8080. You can then access the application through the Replit webview.

## How to Use

1. Enter your clinical study protocol text in the input box
2. Click "Analyze Protocol" to process the information
3. Review the failure probability, insights, and similar studies
4. Export results to PDF for sharing

## Technologies Used

- Flask web framework
- In-memory simulated database of 3,000 CSRs
- Pattern matching for protocol analysis
- Recharts for interactive data visualization
- Tailwind CSS for responsive design

## About Trialsage.ai

Trialsage.ai is a sophisticated platform designed to transform clinical trial planning and execution through advanced analytics and machine learning. By analyzing thousands of historical Clinical Study Reports (CSRs), our system identifies patterns, risk factors, and success strategies to help researchers design more effective clinical trials.