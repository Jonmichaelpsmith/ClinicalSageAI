"""
Risk Analyzer for regulatory submissions.

This module uses AI to analyze QC and eValidator results to identify potential risks
in regulatory submissions before they are finalized. It provides an "at-risk" flag
for documents or submissions that may face issues during the approval process.
"""
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import os

from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI()

# Risk levels
RISK_LEVELS = {
    "LOW": {
        "color": "green",
        "label": "Low Risk",
        "description": "Minor or no issues identified. Submission likely to proceed without problems."
    },
    "MEDIUM": {
        "color": "yellow",
        "label": "Medium Risk",
        "description": "Some issues identified that should be addressed before submission."
    },
    "HIGH": {
        "color": "red",
        "label": "High Risk",
        "description": "Critical issues identified that will likely lead to rejection."
    }
}

# Common submission issues by region
COMMON_ISSUES = {
    "FDA": [
        "Missing FDA Form 1571",
        "Incomplete CMC section",
        "Missing safety data",
        "Protocol design issues",
        "Inadequate statistical analysis",
    ],
    "EMA": [
        "Missing regional forms",
        "Inconsistent quality documentation",
        "Incomplete environmental risk assessment",
        "Missing pediatric investigation plan",
    ],
    "PMDA": [
        "Missing Japanese translations",
        "Non-compliant Common Technical Document (CTD) format",
        "Incomplete regional administrative information",
        "Missing jp-annex documents",
    ]
}

def load_historical_issues(region: str = "FDA") -> List[Dict]:
    """
    Load historical submission issues for a region to identify patterns.
    
    Args:
        region: Regulatory region (FDA, EMA, PMDA)
        
    Returns:
        List of historical issues
    """
    try:
        issues_path = os.path.join(
            os.path.dirname(__file__), 
            f"../data/historical_issues/{region.lower()}_issues.json"
        )
        
        if not os.path.exists(issues_path):
            # If specific region issues don't exist, use default
            issues_path = os.path.join(
                os.path.dirname(__file__), 
                "../data/historical_issues/default_issues.json"
            )
            
        with open(issues_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load historical issues for {region}: {e}")
        # Return empty issues if file load fails
        return []

def evaluate_qc_results(qc_results: List[Dict], region: str = "FDA") -> Dict:
    """
    Evaluate QC results to identify potential issues.
    
    Args:
        qc_results: List of QC result dictionaries
        region: Regulatory region
        
    Returns:
        Dictionary with risk assessment
    """
    # Count total issues by severity
    issue_counts = {
        "critical": 0,
        "major": 0,
        "minor": 0,
        "total": len(qc_results),
        "passed": 0,
        "failed": 0
    }
    
    # Track documents with issues
    problematic_docs = []
    
    # Analyze QC results
    for result in qc_results:
        if result.get("status") == "failed":
            issue_counts["failed"] += 1
            
            # Determine severity based on error type
            severity = result.get("severity", "minor")
            issue_counts[severity] += 1
            
            problematic_docs.append({
                "id": result.get("id"),
                "document_name": result.get("document_name", "Unknown"),
                "issues": result.get("issues", []),
                "severity": severity
            })
        else:
            issue_counts["passed"] += 1
    
    # Determine overall risk level
    risk_level = "LOW"
    if issue_counts["critical"] > 0 or issue_counts["failed"] / issue_counts["total"] > 0.2:
        risk_level = "HIGH"
    elif issue_counts["major"] > 0 or issue_counts["failed"] / issue_counts["total"] > 0.1:
        risk_level = "MEDIUM"
    
    return {
        "risk_level": risk_level,
        "risk_details": RISK_LEVELS[risk_level],
        "issue_counts": issue_counts,
        "problematic_documents": problematic_docs,
        "region": region,
        "timestamp": datetime.utcnow().isoformat()
    }

def evaluate_validator_results(validator_results: Dict, region: str = "FDA") -> Dict:
    """
    Evaluate eValidator results to identify potential issues.
    
    Args:
        validator_results: eValidator result dictionary
        region: Regulatory region
        
    Returns:
        Dictionary with risk assessment
    """
    # Count total issues by severity
    issue_counts = {
        "error": 0,
        "warning": 0,
        "info": 0,
        "total": 0
    }
    
    # Track specific issues
    issues = []
    
    # Process validator results
    for category, results in validator_results.get("categories", {}).items():
        for result in results:
            severity = result.get("severity", "info").lower()
            issue_counts[severity] += 1
            issue_counts["total"] += 1
            
            issues.append({
                "category": category,
                "message": result.get("message", ""),
                "severity": severity,
                "location": result.get("location", ""),
                "code": result.get("code", "")
            })
    
    # Determine overall risk level
    risk_level = "LOW"
    if issue_counts["error"] > 0:
        risk_level = "HIGH"
    elif issue_counts["warning"] > 3:
        risk_level = "MEDIUM"
    
    return {
        "risk_level": risk_level,
        "risk_details": RISK_LEVELS[risk_level],
        "issue_counts": issue_counts,
        "issues": issues,
        "region": region,
        "timestamp": datetime.utcnow().isoformat()
    }

async def generate_ai_risk_analysis(
    qc_assessment: Dict,
    validator_assessment: Dict,
    region: str = "FDA",
    historical_issues: Optional[List[Dict]] = None
) -> Dict:
    """
    Generate AI analysis of submission risks based on QC and validator results.
    
    Args:
        qc_assessment: QC risk assessment
        validator_assessment: Validator risk assessment
        region: Regulatory region
        historical_issues: Optional list of historical issues
        
    Returns:
        Dictionary with AI risk assessment
    """
    try:
        # Combine QC and validator assessments
        combined_risk_level = "LOW"
        if qc_assessment["risk_level"] == "HIGH" or validator_assessment["risk_level"] == "HIGH":
            combined_risk_level = "HIGH"
        elif qc_assessment["risk_level"] == "MEDIUM" or validator_assessment["risk_level"] == "MEDIUM":
            combined_risk_level = "MEDIUM"
        
        # Filter relevant issues for analysis
        qc_issues = qc_assessment.get("problematic_documents", [])
        validator_issues = validator_assessment.get("issues", [])
        
        # Load historical issues if not provided
        if historical_issues is None:
            historical_issues = load_historical_issues(region)
        
        # Prepare the prompt with context
        system_prompt = f"""You are an expert regulatory affairs advisor specializing in {region} submissions.
Based on the QC results, validator results, and historical issues, analyze the submission risks.
Focus on identifying patterns, potential submission blockers, and providing actionable advice.
Your analysis should be comprehensive but prioritize the most critical issues first.
Respond with JSON containing:
1. "risk_level": string - Overall risk level ("LOW", "MEDIUM", or "HIGH")
2. "critical_issues": array - List of critical issues that must be fixed
3. "major_issues": array - List of major issues that should be addressed
4. "common_patterns": array - Patterns that match historical rejection reasons
5. "action_items": array - Specific actions to address the issues
6. "reasoning": string - Your overall analysis and rationale"""
        
        # Create a concise summary of the issues
        qc_issues_summary = [
            {
                "document": issue.get("document_name", "Unknown"),
                "severity": issue.get("severity", "minor"),
                "issues": issue.get("issues", [])[:3]  # Limit to first 3 issues per document
            }
            for issue in qc_issues[:10]  # Limit to first 10 problematic documents
        ]
        
        validator_issues_summary = [
            {
                "category": issue.get("category", ""),
                "severity": issue.get("severity", "info"),
                "message": issue.get("message", "")
            }
            for issue in validator_issues[:15]  # Limit to first 15 issues
        ]
        
        historical_issues_summary = [
            {
                "reason": issue.get("reason", ""),
                "frequency": issue.get("frequency", "rare")
            }
            for issue in historical_issues[:10]  # Limit to first 10 historical issues
        ]
        
        # Create the user message
        user_message = f"""QC Assessment:
- Risk Level: {qc_assessment['risk_level']}
- Failed: {qc_assessment['issue_counts']['failed']} of {qc_assessment['issue_counts']['total']} documents
- Critical Issues: {qc_assessment['issue_counts'].get('critical', 0)}
- Major Issues: {qc_assessment['issue_counts'].get('major', 0)}

Validator Assessment:
- Risk Level: {validator_assessment['risk_level']}
- Errors: {validator_assessment['issue_counts'].get('error', 0)}
- Warnings: {validator_assessment['issue_counts'].get('warning', 0)}

QC Issues: {json.dumps(qc_issues_summary)}

Validator Issues: {json.dumps(validator_issues_summary)}

Historical Rejection Reasons: {json.dumps(historical_issues_summary)}

Region: {region}

Provide a comprehensive risk analysis and specific action items."""
        
        # Make the API call with JSON response format
        response = client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse the AI analysis
        ai_analysis = json.loads(response.choices[0].message.content)
        
        # Combine assessments with AI analysis
        return {
            "risk_level": ai_analysis.get("risk_level", combined_risk_level),
            "risk_details": RISK_LEVELS[ai_analysis.get("risk_level", combined_risk_level)],
            "ai_analysis": ai_analysis,
            "qc_assessment": qc_assessment,
            "validator_assessment": validator_assessment,
            "region": region,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating AI risk analysis: {e}")
        return {
            "risk_level": combined_risk_level,
            "risk_details": RISK_LEVELS[combined_risk_level],
            "ai_analysis": None,
            "error": str(e),
            "qc_assessment": qc_assessment,
            "validator_assessment": validator_assessment,
            "region": region,
            "timestamp": datetime.utcnow().isoformat()
        }

async def analyze_submission_risks(
    submission_id: int,
    qc_results: Optional[List[Dict]] = None,
    validator_results: Optional[Dict] = None,
    region: str = "FDA"
) -> Dict:
    """
    Comprehensive analysis of submission risks.
    
    Args:
        submission_id: ID of the submission
        qc_results: Optional QC results (fetched from database if not provided)
        validator_results: Optional validator results (fetched from database if not provided)
        region: Regulatory region
        
    Returns:
        Dictionary with comprehensive risk assessment
    """
    # TODO: Fetch results from database if not provided
    if qc_results is None:
        qc_results = []  # Replace with database fetch
    
    if validator_results is None:
        validator_results = {"categories": {}}  # Replace with database fetch
    
    # Evaluate QC and validator results
    qc_assessment = evaluate_qc_results(qc_results, region)
    validator_assessment = evaluate_validator_results(validator_results, region)
    
    # Generate AI analysis
    ai_assessment = await generate_ai_risk_analysis(qc_assessment, validator_assessment, region)
    
    return {
        "submission_id": submission_id,
        "overall_assessment": ai_assessment,
        "timestamp": datetime.utcnow().isoformat()
    }