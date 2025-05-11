/**
 * Microsoft Integration Configuration
 * 
 * This file contains configuration settings for Microsoft Office 365 integration,
 * including authentication parameters for Microsoft Graph API and SharePoint.
 */

// Microsoft Authentication Configuration
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'demo-client-id',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false,   // Set this to "true" if you're having issues with IE11 or Edge
  }
};

// Microsoft Graph API Configuration
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphDriveEndpoint: 'https://graph.microsoft.com/v1.0/me/drive',
  graphSharePointEndpoint: 'https://graph.microsoft.com/v1.0/sites',
};

// Microsoft Graph API Scopes
export const loginRequest = {
  scopes: [
    'User.Read',
    'Files.ReadWrite',
    'Sites.ReadWrite.All',
    'AllSites.Read',
    'AllSites.Write'
  ]
};

// SharePoint Site Configuration
export const sharePointConfig = {
  siteUrl: import.meta.env.VITE_SHAREPOINT_SITE_URL || 'https://tenant.sharepoint.com/sites/ClinicalSageAI',
  driveLibrary: 'Shared Documents',
  rootFolder: 'Regulatory'
};

// Office JS Configuration
export const officeJsConfig = {
  requirementSets: ['WordApi 1.3']
};

// OneDrive Configuration
export const oneDriveConfig = {
  redirectUri: window.location.origin + '/onedrive-callback'
};

export default {
  msalConfig,
  graphConfig,
  loginRequest,
  sharePointConfig,
  officeJsConfig,
  oneDriveConfig
};