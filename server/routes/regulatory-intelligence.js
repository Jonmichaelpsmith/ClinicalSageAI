/**
 * Regulatory Intelligence API Routes
 * 
 * This module provides API endpoints for accessing and managing regulatory intelligence data 
 * including FDA guidance, IHE profiles, ICH guidelines, and other regulatory information.
 */

import express from 'express';
import { pool } from '../db.js';
import axios from 'axios';
import { processAuthenticatedRequest } from '../middleware/auth.js';
import { logAPIRequest } from '../middleware/logging.js';
import { catchErrors } from '../utils/errorHandling.js';

const router = express.Router();

// Apply middleware
router.use(logAPIRequest);
router.use(express.json());

/**
 * @route GET /api/regulatory-intelligence/updates
 * @desc Get recent regulatory updates
 * @access Private
 */
router.get('/updates', processAuthenticatedRequest, catchErrors(async (req, res) => {
  const { sources, documentTypes, topics, dateRange } = req.query;
  
  try {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          r.id, 
          r.title, 
          r.summary, 
          r.source_id, 
          r.url, 
          r.published_date, 
          r.document_type,
          r.content,
          r.reference_number,
          r.is_new,
          r.topics,
          r.effective_date,
          r.key_points,
          r.impact,
          r.applicability,
          s.name as source_name,
          s.full_name as source_full_name,
          s.color as source_color
        FROM regulatory_updates r
        JOIN regulatory_sources s ON r.source_id = s.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Apply source filter
      if (sources && Array.isArray(sources) && sources.length > 0) {
        query += ` AND r.source_id IN (${sources.map((_, idx) => `$${idx + 1}`).join(',')})`;
        queryParams.push(...sources);
      }
      
      // Apply document type filter
      if (documentTypes && Array.isArray(documentTypes) && documentTypes.length > 0) {
        const paramOffset = queryParams.length;
        query += ` AND r.document_type IN (${documentTypes.map((_, idx) => `$${idx + 1 + paramOffset}`).join(',')})`;
        queryParams.push(...documentTypes);
      }
      
      // Apply topic filter
      if (topics && Array.isArray(topics) && topics.length > 0) {
        query += ` AND r.topics && $${queryParams.length + 1}`;
        queryParams.push(topics);
      }
      
      // Apply date range filter
      if (dateRange) {
        const now = new Date();
        let dateLimit;
        
        if (dateRange === 'year') {
          dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
        } else if (dateRange === 'month') {
          dateLimit = new Date(now.setMonth(now.getMonth() - 1));
        } else if (dateRange === 'week') {
          dateLimit = new Date(now.setDate(now.getDate() - 7));
        }
        
        if (dateLimit) {
          query += ` AND r.published_date >= $${queryParams.length + 1}`;
          queryParams.push(dateLimit.toISOString());
        }
      }
      
      // Order by most recent
      query += ` ORDER BY r.published_date DESC LIMIT 50`;
      
      const { rows } = await client.query(query, queryParams);
      
      // Format the response
      const updates = rows.map(row => {
        return {
          id: row.id,
          title: row.title,
          summary: row.summary,
          date: row.published_date,
          source: {
            id: row.source_id,
            name: row.source_name,
            fullName: row.source_full_name,
            color: row.source_color,
            icon: `${row.source_id}Icon` // Frontend will map this to the proper icon component
          },
          url: row.url,
          isNew: row.is_new,
          documentType: row.document_type,
          topics: row.topics,
          effectiveDate: row.effective_date,
          keyPoints: row.key_points,
          impact: row.impact,
          applicability: row.applicability,
          referenceNumber: row.reference_number,
          content: row.content
        };
      });
      
      res.json(updates);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching regulatory updates:', error);
    
    // If database is unavailable, use fallback data
    // Note: This is a temporary solution for development only
    // In production, we would use proper error handling
    res.status(500).json({ error: 'Failed to fetch regulatory updates' });
  }
}));

/**
 * @route GET /api/regulatory-intelligence/search
 * @desc Search regulatory documents
 * @access Private
 */
router.get('/search', processAuthenticatedRequest, catchErrors(async (req, res) => {
  const { q, sources, documentTypes, topics, dateRange } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          r.id, 
          r.title, 
          r.summary, 
          r.source_id, 
          r.url, 
          r.published_date, 
          r.document_type,
          r.content,
          r.reference_number,
          r.is_new,
          r.topics,
          r.effective_date,
          r.key_points,
          r.impact,
          r.applicability,
          s.name as source_name,
          s.full_name as source_full_name,
          s.color as source_color,
          ts_rank_cd(
            setweight(to_tsvector('english', r.title), 'A') ||
            setweight(to_tsvector('english', r.summary), 'B') ||
            setweight(to_tsvector('english', COALESCE(r.content, '')), 'C'),
            plainto_tsquery('english', $1)
          ) AS rank
        FROM regulatory_updates r
        JOIN regulatory_sources s ON r.source_id = s.id
        WHERE 
          to_tsvector('english', r.title) || 
          to_tsvector('english', r.summary) || 
          to_tsvector('english', COALESCE(r.content, '')) @@ 
          plainto_tsquery('english', $1)
      `;
      
      const queryParams = [q];
      
      // Apply source filter
      if (sources && Array.isArray(sources) && sources.length > 0) {
        query += ` AND r.source_id IN (${sources.map((_, idx) => `$${idx + 2}`).join(',')})`;
        queryParams.push(...sources);
      }
      
      // Apply document type filter
      if (documentTypes && Array.isArray(documentTypes) && documentTypes.length > 0) {
        const paramOffset = queryParams.length;
        query += ` AND r.document_type IN (${documentTypes.map((_, idx) => `$${idx + 1 + paramOffset}`).join(',')})`;
        queryParams.push(...documentTypes);
      }
      
      // Apply topic filter
      if (topics && Array.isArray(topics) && topics.length > 0) {
        query += ` AND r.topics && $${queryParams.length + 1}`;
        queryParams.push(topics);
      }
      
      // Apply date range filter
      if (dateRange) {
        const now = new Date();
        let dateLimit;
        
        if (dateRange === 'year') {
          dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
        } else if (dateRange === 'month') {
          dateLimit = new Date(now.setMonth(now.getMonth() - 1));
        } else if (dateRange === 'week') {
          dateLimit = new Date(now.setDate(now.getDate() - 7));
        }
        
        if (dateLimit) {
          query += ` AND r.published_date >= $${queryParams.length + 1}`;
          queryParams.push(dateLimit.toISOString());
        }
      }
      
      // Order by relevance rank
      query += ` ORDER BY rank DESC LIMIT 50`;
      
      const { rows } = await client.query(query, queryParams);
      
      // Format the response
      const results = rows.map(row => {
        return {
          id: row.id,
          title: row.title,
          summary: row.summary,
          date: row.published_date,
          source: {
            id: row.source_id,
            name: row.source_name,
            fullName: row.source_full_name,
            color: row.source_color,
            icon: `${row.source_id}Icon` // Frontend will map this to the proper icon component
          },
          url: row.url,
          isNew: row.is_new,
          documentType: row.document_type,
          topics: row.topics,
          effectiveDate: row.effective_date,
          keyPoints: row.key_points,
          impact: row.impact,
          applicability: row.applicability,
          referenceNumber: row.reference_number,
          content: row.content
        };
      });
      
      res.json(results);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error searching regulatory documents:', error);
    res.status(500).json({ error: 'Failed to search regulatory documents' });
  }
}));

/**
 * @route GET /api/regulatory-intelligence/ich/guidelines
 * @desc Get ICH guidelines
 * @access Private
 */
router.get('/ich/guidelines', processAuthenticatedRequest, catchErrors(async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT * FROM regulatory_ich_guidelines
        ORDER BY category, date DESC
      `;
      
      const { rows } = await client.query(query);
      
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching ICH guidelines:', error);
    res.status(500).json({ error: 'Failed to fetch ICH guidelines' });
  }
}));

/**
 * @route GET /api/regulatory-intelligence/ihe/profiles
 * @desc Get IHE profiles
 * @access Private
 */
router.get('/ihe/profiles', processAuthenticatedRequest, catchErrors(async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT * FROM regulatory_ihe_profiles
        ORDER BY domain, name
      `;
      
      const { rows } = await client.query(query);
      
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching IHE profiles:', error);
    res.status(500).json({ error: 'Failed to fetch IHE profiles' });
  }
}));

/**
 * @route GET /api/regulatory-intelligence/fda/guidance
 * @desc Get FDA guidance documents
 * @access Private
 */
router.get('/fda/guidance', processAuthenticatedRequest, catchErrors(async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT * FROM regulatory_updates
        WHERE source_id = 'fda'
        AND document_type IN ('guidance', 'draft-guidance')
        ORDER BY published_date DESC
        LIMIT 100
      `;
      
      const { rows } = await client.query(query);
      
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching FDA guidance:', error);
    res.status(500).json({ error: 'Failed to fetch FDA guidance' });
  }
}));

/**
 * @route GET /api/regulatory-intelligence/dashboard/:projectId
 * @desc Get regulatory intelligence dashboard data for a specific project
 * @access Private
 */
router.get('/dashboard/:projectId', processAuthenticatedRequest, catchErrors(async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const client = await pool.connect();
    
    try {
      // Get project details to determine relevant filters
      const projectQuery = `
        SELECT 
          therapeutic_area,
          indication,
          drug_class,
          submission_type,
          submission_region
        FROM projects
        WHERE id = $1
      `;
      
      const projectResult = await client.query(projectQuery, [projectId]);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const project = projectResult.rows[0];
      
      // Get relevant regulatory updates based on project details
      const updatesQuery = `
        SELECT 
          r.id, 
          r.title, 
          r.summary, 
          r.source_id, 
          r.url, 
          r.published_date, 
          r.document_type,
          r.reference_number,
          r.is_new,
          r.topics,
          r.effective_date,
          s.name as source_name,
          s.full_name as source_full_name,
          s.color as source_color
        FROM regulatory_updates r
        JOIN regulatory_sources s ON r.source_id = s.id
        WHERE 
          (r.therapeutic_areas @> $1::text[] OR r.therapeutic_areas IS NULL) AND
          (r.indications @> $2::text[] OR r.indications IS NULL) AND
          (r.submission_types @> $3::text[] OR r.submission_types IS NULL) AND
          (r.submission_regions @> $4::text[] OR r.submission_regions IS NULL)
        ORDER BY r.impact_score DESC, r.published_date DESC
        LIMIT 10
      `;
      
      const updatesResult = await client.query(updatesQuery, [
        project.therapeutic_area ? [project.therapeutic_area] : [],
        project.indication ? [project.indication] : [],
        project.submission_type ? [project.submission_type] : [],
        project.submission_region ? [project.submission_region] : []
      ]);
      
      // Get upcoming deadlines
      const deadlinesQuery = `
        SELECT 
          id,
          title,
          deadline_date,
          description,
          regulatory_authority,
          priority_level
        FROM regulatory_deadlines
        WHERE 
          (therapeutic_areas @> $1::text[] OR therapeutic_areas IS NULL) AND
          (indications @> $2::text[] OR indications IS NULL) AND
          (submission_types @> $3::text[] OR submission_types IS NULL) AND
          (submission_regions @> $4::text[] OR submission_regions IS NULL) AND
          deadline_date > CURRENT_DATE
        ORDER BY deadline_date ASC
        LIMIT 5
      `;
      
      const deadlinesResult = await client.query(deadlinesQuery, [
        project.therapeutic_area ? [project.therapeutic_area] : [],
        project.indication ? [project.indication] : [],
        project.submission_type ? [project.submission_type] : [],
        project.submission_region ? [project.submission_region] : []
      ]);
      
      // Format the response
      const dashboardData = {
        updates: updatesResult.rows.map(row => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          date: row.published_date,
          source: {
            id: row.source_id,
            name: row.source_name,
            fullName: row.source_full_name,
            color: row.source_color
          },
          url: row.url,
          isNew: row.is_new,
          documentType: row.document_type,
          topics: row.topics,
          effectiveDate: row.effective_date,
          referenceNumber: row.reference_number
        })),
        deadlines: deadlinesResult.rows
      };
      
      res.json(dashboardData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}));

export default router;