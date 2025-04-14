"""
FAIL MAP with EMA API Integration
--------------------------------
This is the entry point for the FailMap application with EMA API integration.
"""

import os
import flask
from flask import Flask

# Import the main application module
from fail_map_app import app as failmap_app

# Import the EMA API integration
from ema_integration import register_ema_blueprint

# Register the EMA Blueprint with the main application
register_ema_blueprint(failmap_app)

# Add additional routes if needed
@failmap_app.route('/ema')
def ema_dashboard():
    """Redirect to the EMA dashboard."""
    return flask.redirect('/ema/dashboard')

# Add a global error handler for better user experience
@failmap_app.errorhandler(Exception)
def handle_exception(e):
    """Global exception handler for better error messages."""
    failmap_app.logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
    return flask.render_template('error.html', 
                        error_title="Application Error",
                        error_message=f"An unexpected error occurred: {str(e)}"), 500

# Add a global before_request hook to check for required environment variables
@failmap_app.before_request
def check_environment():
    """Check if required environment variables are set."""
    if flask.request.path.startswith('/ema'):
        if not os.environ.get('EMA_CLIENT_ID') or not os.environ.get('EMA_CLIENT_SECRET'):
            failmap_app.logger.warning("Missing EMA API credentials")
            # Only show a warning, don't block the request

# Start the application if run directly
if __name__ == '__main__':
    # Display startup information
    print("Starting FailMap with EMA API integration...")
    print(f"API endpoints available at: http://localhost:8080/ema/")
    print(f"EMA dashboard available at: http://localhost:8080/ema/dashboard")
    
    # Start the application
    failmap_app.run(host='0.0.0.0', port=8080, debug=True)