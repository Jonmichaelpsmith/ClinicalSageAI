#!/usr/bin/env python3
"""
Weekly Digest Generator for TrialSage

Generates weekly summaries of user activities and important protocol changes
based on user preferences.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Set up paths
ROOT_DIR = Path(__file__).parent.parent
LOG_PATH = ROOT_DIR / "data/logs/export_actions.jsonl"
PREFS_DIR = ROOT_DIR / "data/users"
REPORTS_DIR = ROOT_DIR / "data/exports"

# Ensure directories exist
os.makedirs(PREFS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR.parent / "logs", exist_ok=True)

def get_user_preferences(user_id):
    """Get user digest preferences or return defaults"""
    pref_file = PREFS_DIR / f"{user_id}_prefs.json"
    
    # Default preferences
    default_prefs = {
        "include_exports": True,
        "include_risk_changes": True,
        "include_version_changes": True,
        "include_sap": True,
        "risk_change_threshold": 10  # percentage points
    }
    
    if not pref_file.exists():
        return default_prefs
    
    try:
        with open(pref_file, 'r') as f:
            prefs = json.load(f)
            # Ensure all preference keys exist
            for key in default_prefs:
                if key not in prefs:
                    prefs[key] = default_prefs[key]
            return prefs
    except Exception as e:
        print(f"Error reading preferences for user {user_id}: {e}", file=sys.stderr)
        return default_prefs

def generate_digest(user_id=None, days=7):
    """Generate weekly digest based on user preferences"""
    if not LOG_PATH.exists():
        return "No logs found."

    # Get time range for digest
    since = datetime.utcnow() - timedelta(days=days)
    entries = []

    # Load user preferences
    prefs = get_user_preferences(user_id) if user_id else {
        "include_exports": True,
        "include_risk_changes": True,
        "include_version_changes": True,
        "include_sap": True
    }
    
    # Read log entries
    try:
        with open(LOG_PATH, 'r') as f:
            for line in f:
                if not line.strip():
                    continue
                    
                try:
                    log = json.loads(line)
                    log_time = datetime.fromisoformat(log["timestamp"])
                    
                    # Filter by time and user
                    if log_time >= since and (user_id is None or log.get("user_id") == user_id):
                        entries.append(log)
                except json.JSONDecodeError:
                    continue
                except Exception as e:
                    print(f"Error parsing log entry: {e}", file=sys.stderr)
                    continue
    except Exception as e:
        print(f"Error reading logs: {e}", file=sys.stderr)
        return f"Error generating digest: {e}"

    # Start building digest
    digest = f"📊 TrialSage Weekly Digest – {datetime.utcnow().strftime('%Y-%m-%d')}\n\n"
    
    # Add export summary if enabled
    if prefs.get("include_exports", True):
        export_entries = [e for e in entries if e.get("report_type") in ["intelligence_report", "comparison_report", "sap"]]
        
        if export_entries:
            digest += f"📤 Report Exports ({len(export_entries)} total):\n"
            for entry in export_entries:
                # Skip SAP reports if not included in preferences
                if entry.get("report_type") == "sap" and not prefs.get("include_sap", True):
                    continue
                    
                digest += f"• {entry.get('report_type', 'Unknown')} for {entry.get('protocol_id', 'Unknown')} "
                digest += f"on {datetime.fromisoformat(entry['timestamp']).strftime('%Y-%m-%d %H:%M')}\n"
            digest += "\n"
    
    # Add risk changes if enabled
    if prefs.get("include_risk_changes", True):
        risk_threshold = prefs.get("risk_change_threshold", 10) / 100  # Convert to decimal
        risk_entries = []
        
        for entry in entries:
            if entry.get("report_details") and "previous_success_rate" in entry.get("report_details", {}):
                prev = entry["report_details"]["previous_success_rate"]
                curr = entry["report_details"]["current_success_rate"]
                
                if prev is not None and curr is not None:
                    delta = abs(curr - prev)
                    if delta >= risk_threshold:
                        risk_entries.append({
                            **entry,
                            "delta": delta,
                            "direction": "increased" if curr > prev else "decreased"
                        })
        
        if risk_entries:
            digest += f"⚠️ Significant Risk Changes ({len(risk_entries)} total):\n"
            for entry in risk_entries:
                delta_pct = entry["delta"] * 100
                digest += f"• {entry.get('protocol_id', 'Unknown')} success probability "
                digest += f"{entry['direction']} by {delta_pct:.1f}% "
                digest += f"on {datetime.fromisoformat(entry['timestamp']).strftime('%Y-%m-%d')}\n"
            digest += "\n"
    
    # Add protocol version changes if enabled
    if prefs.get("include_version_changes", True):
        version_entries = [e for e in entries if e.get("report_type") == "comparison_report"]
        
        if version_entries:
            digest += f"📝 Protocol Version Changes ({len(version_entries)} total):\n"
            for entry in version_entries:
                digest += f"• {entry.get('protocol_id', 'Unknown')} "
                
                if entry.get("report_details") and "changes" in entry.get("report_details", {}):
                    changes = entry["report_details"]["changes"]
                    if changes:
                        digest += f"changes in: {', '.join(changes)} "
                
                digest += f"on {datetime.fromisoformat(entry['timestamp']).strftime('%Y-%m-%d')}\n"
            digest += "\n"
    
    # Add footer
    digest += "\n"
    digest += "You can customize these weekly digests in your TrialSage preferences.\n"
    digest += "This is an automated message from TrialSage."

    return digest.strip()

def generate_html_digest(user_id=None, days=7):
    """Generate weekly digest as HTML"""
    text_digest = generate_digest(user_id, days)
    if text_digest.startswith("Error") or text_digest == "No logs found.":
        return f"<p>{text_digest}</p>"
    
    # Convert plain text to HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TrialSage Weekly Digest</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #2563eb;
                color: white;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                text-align: center;
            }}
            .section {{
                background-color: #f8fafc;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 15px;
                border-left: 4px solid #2563eb;
            }}
            .section h2 {{
                margin-top: 0;
                color: #1e40af;
            }}
            .item {{
                margin-bottom: 10px;
                padding-left: 20px;
                position: relative;
            }}
            .item:before {{
                content: "•";
                position: absolute;
                left: 0;
                color: #2563eb;
            }}
            .footer {{
                margin-top: 30px;
                font-size: 12px;
                color: #64748b;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                padding-top: 15px;
            }}
            .warning {{
                border-left: 4px solid #dc2626;
            }}
            .warning h2 {{
                color: #dc2626;
            }}
        </style>
    </head>
    <body>
    """
    
    # Extract sections from text digest
    sections = text_digest.split("\n\n")
    
    # Add header
    html_content += f'<div class="header"><h1>{sections[0]}</h1></div>'
    
    # Process each section
    for section in sections[1:-1]:  # Skip header and footer
        if not section:
            continue
            
        lines = section.split("\n")
        title = lines[0]
        items = lines[1:]
        
        section_class = "section"
        if "Risk Changes" in title:
            section_class += " warning"
        
        html_content += f'<div class="{section_class}">'
        html_content += f'<h2>{title}</h2>'
        
        for item in items:
            html_content += f'<div class="item">{item}</div>'
        
        html_content += '</div>'
    
    # Add footer
    html_content += '<div class="footer">'
    html_content += '<p>You can customize these weekly digests in your TrialSage preferences.</p>'
    html_content += '<p>This is an automated message from TrialSage.</p>'
    html_content += '</div>'
    
    html_content += """
    </body>
    </html>
    """
    
    return html_content

def main():
    """Main function to run from command line"""
    if len(sys.argv) < 2:
        print("Error: User ID not specified", file=sys.stderr)
        sys.exit(1)
    
    user_id = sys.argv[1]
    days = int(sys.argv[2]) if len(sys.argv) > 2 else 7
    
    try:
        digest = generate_digest(user_id, days)
        print(digest)
    except Exception as e:
        print(f"Error generating digest: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()