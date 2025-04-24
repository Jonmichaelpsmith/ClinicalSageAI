/**
 * Security Headers Middleware
 * 
 * Implements critical HTTP security headers to enhance application security.
 * Based on OWASP recommendations and industry best practices.
 */
import { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Set strict Content Security Policy to prevent XSS attacks
  // Adjust as needed for your application's specific requirements
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' https://api.openai.com https://api.perplexity.ai; " +
    "frame-ancestors 'none';"
  );

  // Prevent site from being framed (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable strict HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Disable browser features that can leak information
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Set referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add Cross-Origin protection
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Remove Server header to avoid exposing information
  res.removeHeader('Server');
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * Rate Limiting and Brute Force Protection configuration
 * 
 * NOTE: This configuration should be used with the rate limiting middleware
 * in rateLimiter.ts to protect sensitive endpoints from abuse.
 */
export const rateLimitConfig = {
  // Authentication endpoints (more restrictive)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                  // 20 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  },
  // API endpoints (less restrictive)
  api: {
    windowMs: 5 * 60 * 1000,  // 5 minutes
    max: 100,                 // 100 requests per 5 minutes
    message: 'Too many API requests, please try again later.'
  },
  // Health check and monitoring endpoints (very permissive)
  monitoring: {
    windowMs: 1 * 60 * 1000,  // 1 minute
    max: 60,                  // 60 requests per minute
    message: 'Request rate exceeded for monitoring endpoints.'
  }
};

/**
 * Helper function to set circuit breaker configuration
 * for integration with the CircuitBreaker middleware
 */
export const circuitBreakerConfig = {
  // For OpenAI API calls
  openai: {
    failureThreshold: 3,       // Number of failures before opening circuit
    resetTimeout: 30000,       // Time in ms to reset circuit after opening (30 seconds)
    maxTimeout: 5000,          // Maximum timeout for requests (5 seconds)
    monitorInterval: 10000     // Health check interval when open (10 seconds)
  },
  // For database operations
  database: {
    failureThreshold: 5,       // More tolerant for database operations
    resetTimeout: 15000,       // Shorter reset time (15 seconds)
    maxTimeout: 3000,          // Shorter timeout (3 seconds)
    monitorInterval: 5000      // More frequent health checks (5 seconds)
  }
};