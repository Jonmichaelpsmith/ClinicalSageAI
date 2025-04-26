/**
 * TrialSage Security Service
 * 
 * Server-side security functions for document and data protection:
 * - Document integrity verification
 * - Data encryption
 * - Security audit logging
 * - Tenant access control
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configure encryption algorithms
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const HASH_ALGORITHM = 'sha256';

// Get encryption key from environment or generate one
const getEncryptionKey = () => {
  // In production, always use the environment variable
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is required in production');
    }
    return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }
  
  // In development, use a local key file
  const keyPath = path.join(__dirname, '..', '.dev-key');
  
  if (fs.existsSync(keyPath)) {
    return Buffer.from(fs.readFileSync(keyPath, 'utf-8'), 'hex');
  }
  
  // Generate and save a new key for development
  const newKey = crypto.randomBytes(32);
  fs.writeFileSync(keyPath, newKey.toString('hex'), 'utf-8');
  return newKey;
};

// Encrypt data using AES-256-GCM
const encryptData = (data) => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // GCM mode auth tag for integrity
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: ENCRYPTION_ALGORITHM
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data: ' + error.message);
  }
};

// Decrypt data that was encrypted with AES-256-GCM
const decryptData = (encryptedObj) => {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const authTag = Buffer.from(encryptedObj.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    try {
      // Try to parse as JSON if possible
      return JSON.parse(decrypted);
    } catch {
      // Return as string if not valid JSON
      return decrypted;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data: ' + error.message);
  }
};

// Generate hash for document integrity
const generateDocumentHash = (document) => {
  const data = typeof document === 'string' ? document : JSON.stringify(document);
  return crypto.createHash(HASH_ALGORITHM).update(data).digest('hex');
};

// Verify document hash integrity
const verifyDocumentIntegrity = (document, hash) => {
  const calculatedHash = generateDocumentHash(document);
  return calculatedHash === hash;
};

// Enhanced security for storing sensitive document data
const secureDocument = (document, options = {}) => {
  const { encrypt = true, includeHash = true } = options;
  
  const result = {
    metadata: {
      securedAt: new Date().toISOString(),
      securityVersion: '1.0'
    }
  };
  
  if (includeHash) {
    result.hash = generateDocumentHash(document);
  }
  
  if (encrypt) {
    result.encryptedContent = encryptData(document);
    return result;
  }
  
  result.content = document;
  return result;
};

// Retrieve document with security validation
const retrieveSecureDocument = (securedDoc) => {
  // If document is encrypted, decrypt it
  if (securedDoc.encryptedContent) {
    const content = decryptData(securedDoc.encryptedContent);
    
    // If hash is included, verify integrity
    if (securedDoc.hash) {
      const isValid = verifyDocumentIntegrity(content, securedDoc.hash);
      
      if (!isValid) {
        throw new Error('Document integrity check failed. The document may have been tampered with.');
      }
    }
    
    return content;
  }
  
  // If document is not encrypted but has hash, verify integrity
  if (securedDoc.content && securedDoc.hash) {
    const isValid = verifyDocumentIntegrity(securedDoc.content, securedDoc.hash);
    
    if (!isValid) {
      throw new Error('Document integrity check failed. The document may have been tampered with.');
    }
    
    return securedDoc.content;
  }
  
  // If no security measures are present
  return securedDoc.content;
};

// Security audit logger for server-side events
const auditLog = (action, details = {}, severity = 'info') => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    severity,
    ...details
  };
  
  // Log to console for development
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
    console.log(`[SECURITY AUDIT] ${action}`, logEntry);
  }
  
  // In a real implementation, you would:
  // 1. Log to a secure audit log file
  // 2. Send to a security information and event management (SIEM) system
  // 3. Store in a dedicated audit database table
  
  // Example: Log to file in production
  if (process.env.NODE_ENV === 'production' && process.env.SECURITY_AUDIT_LOG_PATH) {
    const logPath = process.env.SECURITY_AUDIT_LOG_PATH;
    fs.appendFile(
      logPath,
      JSON.stringify(logEntry) + '\n',
      (err) => {
        if (err) {
          console.error('Failed to write to security audit log:', err);
        }
      }
    );
  }
  
  return logEntry;
};

// Check tenant authorization for resource access
const checkTenantResourceAccess = (tenantId, resourceType, resourceId, operation) => {
  // In a real implementation, this would check against a database
  // of permissions and access control rules
  
  // For this example, we'll use a simple allowed/denied response
  return {
    allowed: true,
    reason: 'Tenant has access to this resource',
    operation,
    resourceType,
    resourceId,
    tenantId,
    timestamp: new Date().toISOString()
  };
};

// Generate a secure session token
const generateSecureToken = (data = {}, expiresInSeconds = 3600) => {
  const payload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomBytes(16).toString('hex')
  };
  
  // In a real implementation, use JWT or similar
  const tokenData = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', getEncryptionKey())
    .update(tokenData)
    .digest('hex');
  
  return `${tokenData}.${signature}`;
};

// Verify a secure token
const verifySecureToken = (token) => {
  try {
    const [tokenData, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', getEncryptionKey())
      .update(tokenData)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, reason: 'Invalid signature' };
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(tokenData, 'base64').toString('utf-8'));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'Token expired' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, reason: 'Invalid token format' };
  }
};

module.exports = {
  encryptData,
  decryptData,
  generateDocumentHash,
  verifyDocumentIntegrity,
  secureDocument,
  retrieveSecureDocument,
  auditLog,
  checkTenantResourceAccess,
  generateSecureToken,
  verifySecureToken
};