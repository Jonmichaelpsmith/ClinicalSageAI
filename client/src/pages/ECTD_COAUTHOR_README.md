# eCTD Co-Author Module

## Overview

The eCTD Co-Author Module is a specialized document management and authoring environment designed specifically for creating and managing eCTD (Electronic Common Technical Document) submissions. This module provides advanced document editing capabilities, AI-assisted content generation, and comprehensive regulatory compliance checking.

## Architecture

The eCTD Co-Author Module integrates several key components:

1. **Enhanced Document Editor**: A versatile editing environment with support for:
   - Standard built-in text editor
   - Microsoft Word Online integration
   - AI-assisted content generation
   - Preview mode with formatting display

2. **Microsoft Office Integration**: An enterprise-grade integration with Microsoft Word Online that:
   - Connects to VAULT Document Management system
   - Provides a familiar Word editing experience
   - Maintains all document versioning in VAULT
   - Supports Microsoft Copilot AI features

3. **Document Intelligence Hub**: An AI-powered system that:
   - Analyzes document content
   - Generates regulatory-compliant suggestions
   - Checks for compliance with regulatory standards
   - Provides citation and reference management

## Microsoft Word Integration

The Microsoft Word integration uses a bridge approach that connects Microsoft Word Online with our existing VAULT Document Management system, avoiding the complexity of SharePoint integration while providing a familiar Word editing experience.

### Key Components

- `MsWordPopupEditor.jsx`: Provides a popup Microsoft Word Online editor experience
- `msOfficeVaultBridge.js`: Bridges Microsoft Office editing with VAULT document management
- `msCopilotService.js`: Integrates Microsoft Copilot AI features for document authoring
- `EnhancedDocumentEditor.jsx`: Wrapper component that provides a unified editing experience

### Implementation Details

1. **Authentication Flow**:
   - Users authenticate with their Microsoft account
   - Our system verifies Microsoft 365 access and capabilities
   - Server-side token exchange handles secure document access

2. **Document Editing Flow**:
   - Document is retrieved from VAULT
   - Microsoft Word Online displays the document in a secure iframe
   - Changes are automatically synchronized back to VAULT
   - Versioning and audit trail maintained in VAULT

3. **Microsoft Copilot Integration**:
   - GPT-4o integration (latest model released May 13, 2024)
   - Specialized regulatory knowledge enhances suggestions
   - Contextual awareness of document structure and purpose
   - Citation and reference management automation

## Best Practices

1. **Security**:
   - All document editing occurs within secure sessions
   - OAuth 2.0 authentication with appropriate scopes
   - No document content stored outside of VAULT
   - Session-based access tokens with limited lifetime

2. **Performance**:
   - Lazy-loading of Microsoft Word components
   - Optimized document loading and saving
   - Background synchronization for large documents
   - Efficient handling of document resources

3. **User Experience**:
   - Seamless switching between editing modes
   - Consistent UI across different editing environments
   - Clear status indicators for document state
   - Helpful error messages and recovery options

4. **Stability**:
   - Graceful degradation if Microsoft services unavailable
   - Local backup of changes during editing
   - Automatic recovery from connection issues
   - Comprehensive error logging and monitoring

## Environment Variables

Configure the following variables to enable Microsoft Word Online and the AI assistant.
Values marked `VITE_` must also be available to the front‑end build.

```
MICROSOFT_CLIENT_ID=<your Azure application client ID>
MICROSOFT_CLIENT_SECRET=<your Azure application client secret>
MICROSOFT_TENANT_ID=<your Azure tenant ID>

VITE_MICROSOFT_CLIENT_ID=<same as MICROSOFT_CLIENT_ID>
VITE_MICROSOFT_TENANT_ID=<same as MICROSOFT_TENANT_ID>
VITE_SHAREPOINT_EMBEDDED_API=https://graph.microsoft.com/v1.0
VITE_SHAREPOINT_CONTAINER_TYPE_ID=<your SharePoint container type ID>
```

### Obtaining Microsoft Credentials

1. Sign in to the [Azure Portal](https://portal.azure.com/) and create a new **App Registration**.
2. Under **Overview**, copy the **Application (client) ID** and **Directory (tenant) ID**.
3. In **Certificates & secrets**, create a new client secret and copy the value.
4. Add **Microsoft Graph** API permissions:
   - `Files.ReadWrite.All`
   - `Sites.ReadWrite.All`
   - `User.Read`
   - `offline_access`
5. Add your application's redirect URI (e.g. `https://your-domain.com/auth-callback`).
6. Use the collected IDs and secret in the variables listed above.

### Enabling Word Integration and the AI Assistant

1. Ensure all environment variables are set and restart the server.
2. Open the **eCTD Co-Author** module in the application.
3. Choose **Edit in Word** on any document to launch the Microsoft Word Online editor.
4. Authenticate with your Microsoft account when prompted.
5. Use the **AI Assistant** panel inside the editor to generate or refine content.

## Common Issues and Troubleshooting

1. **Authentication Failures**:
   - Verify Microsoft 365 account has appropriate licenses
   - Check client ID and authority configuration
   - Ensure proper OAuth scopes are requested

2. **Document Loading Issues**:
   - Verify VAULT document access permissions
   - Check network connectivity to Microsoft services
   - Ensure document format is supported by Word Online

3. **Saving Failures**:
   - Check write permissions in VAULT
   - Verify authentication token hasn't expired
   - Ensure document isn't locked by another user

4. **Microsoft Copilot Issues**:
   - Verify license includes Copilot access
   - Check organization policies regarding AI features
   - Ensure connectivity to Copilot services

## Future Enhancements

1. **Enhanced Collaboration**:
   - Real-time multi-user editing capabilities
   - Comment and annotation synchronization
   - Change tracking across platforms

2. **Advanced Regulatory Features**:
   - Automated regulatory submission checks
   - Agency-specific formatting tools
   - Pre-submission validation workflow

3. **Extended AI Integration**:
   - Domain-specific clinical writing assistance
   - Automated evidence linking and validation
   - Scientific literature integration and citation

## Maintenance Notes

The eCTD Co-Author Module is a critical component and should be maintained with care:

1. **Testing**: Any changes should undergo thorough testing, particularly around document saving and synchronization.

2. **Versioning**: All components are version-tracked and should maintain backward compatibility.

3. **Performance Monitoring**: Regular monitoring of response times and resource usage is essential.

4. **Security Updates**: Stay current with Microsoft API changes and security best practices.