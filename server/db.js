/**
 * Database Module
 * 
 * This module provides a lightweight in-memory database for development.
 * In production, this would be replaced with a connection to PostgreSQL.
 */

// Mock database session
export const SessionLocal = function() {
  return {
    query: function(model) {
      return {
        filter: function(condition) {
          return this;
        },
        filter_by: function(conditions) {
          return this;
        },
        first: function() {
          // Return mock document
          return {
            id: 123,
            path: '/path/to/document-123.pdf',
            status: 'pending',
            qc_json: null,
            approved_at: null
          };
        }
      };
    },
    add: function(model) {
      // Mock adding model to session
      console.log('Adding model to session:', model);
      return true;
    },
    commit: function() {
      // Mock committing session
      console.log('Committing session');
      return true;
    },
    rollback: function() {
      // Mock rolling back session
      console.log('Rolling back session');
      return true;
    },
    close: function() {
      // Mock closing session
      console.log('Closing session');
      return true;
    }
  };
};

export default {
  SessionLocal
};