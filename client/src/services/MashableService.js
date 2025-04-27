/**
 * Mashable Services Layer
 * 
 * This service provides unified analytics, business intelligence, and data visualization capabilities
 * that work seamlessly across all modules of the TrialSage platform. It enables data-driven
 * decision making by consolidating metrics from different modules into cohesive dashboards and reports.
 */

// Analytics types
export const ANALYTICS_TYPES = {
  REGULATORY: 'regulatory',
  CLINICAL: 'clinical',
  FINANCIAL: 'financial',
  OPERATIONAL: 'operational',
  COMPLIANCE: 'compliance',
  PROJECT: 'project',
  USER: 'user'
};

// Visualization types
export const VISUALIZATION_TYPES = {
  BAR_CHART: 'bar-chart',
  LINE_CHART: 'line-chart',
  PIE_CHART: 'pie-chart',
  SCATTER_PLOT: 'scatter-plot',
  HEAT_MAP: 'heat-map',
  SANKEY: 'sankey',
  TABLE: 'table',
  CALENDAR: 'calendar',
  GAUGE: 'gauge',
  CARD: 'card'
};

class MashableService {
  constructor() {
    this.apiBase = '/api/mashable';
    this.dataListeners = new Map();
    this.cachedDashboards = new Map();
    this.cachedReports = new Map();
  }

  /**
   * Fetch a dashboard by ID
   * @param {string} dashboardId - The dashboard ID
   * @param {boolean} refresh - Whether to refresh cached data
   * @returns {Promise<Object>} - The dashboard data
   */
  async getDashboard(dashboardId, refresh = false) {
    if (!refresh && this.cachedDashboards.has(dashboardId)) {
      return Promise.resolve(this.cachedDashboards.get(dashboardId));
    }

    try {
      const response = await fetch(`${this.apiBase}/dashboards/${dashboardId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
      }
      
      const dashboard = await response.json();
      this.cachedDashboards.set(dashboardId, dashboard);
      return dashboard;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  /**
   * Get available dashboards by category
   * @param {string} category - The dashboard category
   * @returns {Promise<Array>} - List of available dashboards
   */
  async getAvailableDashboards(category) {
    try {
      const url = category 
        ? `${this.apiBase}/dashboards?category=${category}`
        : `${this.apiBase}/dashboards`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboards: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      throw error;
    }
  }

  /**
   * Create a custom dashboard
   * @param {Object} dashboardConfig - The dashboard configuration
   * @returns {Promise<Object>} - The created dashboard
   */
  async createDashboard(dashboardConfig) {
    try {
      const response = await fetch(`${this.apiBase}/dashboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dashboardConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to create dashboard: ${response.statusText}`);
      }

      const dashboard = await response.json();
      this.cachedDashboards.set(dashboard.id, dashboard);
      return dashboard;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }

  /**
   * Update a dashboard configuration
   * @param {string} dashboardId - The dashboard ID
   * @param {Object} updates - The dashboard updates
   * @returns {Promise<Object>} - The updated dashboard
   */
  async updateDashboard(dashboardId, updates) {
    try {
      const response = await fetch(`${this.apiBase}/dashboards/${dashboardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update dashboard: ${response.statusText}`);
      }

      const dashboard = await response.json();
      this.cachedDashboards.set(dashboardId, dashboard);
      return dashboard;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      throw error;
    }
  }

  /**
   * Get project analytics data
   * @param {string} projectId - The project ID
   * @param {Object} options - Options for filtering analytics data
   * @returns {Promise<Object>} - The project analytics data
   */
  async getProjectAnalytics(projectId, options = {}) {
    const queryParams = new URLSearchParams({
      ...options
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}/analytics/projects/${projectId}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project analytics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      throw error;
    }
  }

  /**
   * Get module-specific analytics
   * @param {string} moduleType - The module type
   * @param {string} moduleId - The module instance ID
   * @param {Object} options - Options for filtering analytics data
   * @returns {Promise<Object>} - The module analytics data
   */
  async getModuleAnalytics(moduleType, moduleId, options = {}) {
    const queryParams = new URLSearchParams({
      ...options
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}/analytics/modules/${moduleType}/${moduleId}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch module analytics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching module analytics:', error);
      throw error;
    }
  }

  /**
   * Get organization-level analytics
   * @param {Object} options - Options for filtering analytics data
   * @returns {Promise<Object>} - The organization analytics data
   */
  async getOrganizationAnalytics(options = {}) {
    const queryParams = new URLSearchParams({
      ...options
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}/analytics/organization?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch organization analytics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching organization analytics:', error);
      throw error;
    }
  }

  /**
   * Generate a report from analytics data
   * @param {string} reportType - The report type
   * @param {Object} reportConfig - The report configuration
   * @returns {Promise<Object>} - The generated report
   */
  async generateReport(reportType, reportConfig) {
    try {
      const response = await fetch(`${this.apiBase}/reports/${reportType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      const report = await response.json();
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get scheduled reports
   * @returns {Promise<Array>} - List of scheduled reports
   */
  async getScheduledReports() {
    try {
      const response = await fetch(`${this.apiBase}/reports/scheduled`);
      if (!response.ok) {
        throw new Error(`Failed to fetch scheduled reports: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      throw error;
    }
  }

  /**
   * Schedule a report to run periodically
   * @param {string} reportId - The report ID
   * @param {Object} scheduleConfig - The schedule configuration
   * @returns {Promise<Object>} - The scheduled report
   */
  async scheduleReport(reportId, scheduleConfig) {
    try {
      const response = await fetch(`${this.apiBase}/reports/${reportId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  /**
   * Get data visualization component
   * @param {string} visualizationType - The visualization type
   * @param {Object} dataConfig - The data configuration
   * @returns {Promise<Object>} - The visualization configuration
   */
  async getVisualization(visualizationType, dataConfig) {
    try {
      const response = await fetch(`${this.apiBase}/visualizations/${visualizationType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataConfig)
      });

      if (!response.ok) {
        throw new Error(`Failed to get visualization: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting visualization:', error);
      throw error;
    }
  }

  /**
   * Get cross-module metrics for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} - The cross-module metrics
   */
  async getCrossModuleMetrics(projectId) {
    try {
      const response = await fetch(`${this.apiBase}/metrics/cross-module/${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cross-module metrics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching cross-module metrics:', error);
      throw error;
    }
  }

  /**
   * Get workflow efficiency metrics
   * @param {string} projectId - The project ID
   * @param {Object} options - Options for filtering workflow data
   * @returns {Promise<Object>} - The workflow efficiency metrics
   */
  async getWorkflowEfficiencyMetrics(projectId, options = {}) {
    const queryParams = new URLSearchParams({
      ...options
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}/metrics/workflow/${projectId}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch workflow metrics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow metrics:', error);
      throw error;
    }
  }

  /**
   * Get real-time module activity
   * @param {string} moduleType - The module type
   * @returns {Promise<Array>} - List of recent module activities
   */
  async getModuleActivity(moduleType) {
    try {
      const response = await fetch(`${this.apiBase}/activity/${moduleType}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch module activity: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching module activity:', error);
      throw error;
    }
  }

  /**
   * Get dashboard KPIs (Key Performance Indicators)
   * @param {string} category - The KPI category
   * @param {Object} options - Options for filtering KPI data
   * @returns {Promise<Array>} - List of KPIs
   */
  async getKPIs(category, options = {}) {
    const queryParams = new URLSearchParams({
      category,
      ...options
    }).toString();

    try {
      const response = await fetch(`${this.apiBase}/kpis?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch KPIs: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  }

  /**
   * Get regulatory compliance metrics
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} - The compliance metrics
   */
  async getComplianceMetrics(projectId) {
    try {
      const response = await fetch(`${this.apiBase}/metrics/compliance/${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch compliance metrics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
      throw error;
    }
  }

  /**
   * Export analytics data to a file format
   * @param {string} dataType - The type of data to export
   * @param {string} format - The export format (e.g., 'csv', 'excel', 'pdf')
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} - The exported data as a blob
   */
  async exportData(dataType, format, options = {}) {
    try {
      const response = await fetch(`${this.apiBase}/export/${dataType}/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Subscribe to analytics data updates
   * @param {string} dataType - The data type to subscribe to
   * @param {Function} callback - The callback function
   * @returns {string} - Subscription ID
   */
  subscribeToDataUpdates(dataType, callback) {
    const subscriptionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    if (!this.dataListeners.has(dataType)) {
      this.dataListeners.set(dataType, new Map());
    }
    
    this.dataListeners.get(dataType).set(subscriptionId, callback);
    return subscriptionId;
  }

  /**
   * Unsubscribe from data updates
   * @param {string} dataType - The data type
   * @param {string} subscriptionId - The subscription ID
   */
  unsubscribeFromDataUpdates(dataType, subscriptionId) {
    if (this.dataListeners.has(dataType)) {
      this.dataListeners.get(dataType).delete(subscriptionId);
    }
  }

  /**
   * Notify data update listeners
   * @param {string} dataType - The data type
   * @param {Object} data - The updated data
   * @private
   */
  _notifyDataListeners(dataType, data) {
    if (this.dataListeners.has(dataType)) {
      this.dataListeners.get(dataType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in data update listener for ${dataType}:`, error);
        }
      });
    }
  }
}

// Create singleton instance
const mashableService = new MashableService();
export default mashableService;