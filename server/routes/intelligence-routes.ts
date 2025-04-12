import { Router } from 'express';
import { db } from '../db';
import { eq, like, and, or, not, isNull } from 'drizzle-orm';
import { csr_reports, csr_details } from '@shared/schema';
import type { IntelligenceSummary, AdverseEvent, Endpoint, KPIDashboard } from '@shared/types/intelligence';

const router = Router();

/**
 * Get intelligence summary for a specific indication
 * Aggregates data from all CSRs for the given indication:
 * - Adverse event frequencies
 * - Endpoint usage trends
 * - Average dropout rate
 */
router.get('/summary', async (req, res) => {
  try {
    const { indication } = req.query;
    
    if (!indication) {
      return res.status(400).json({ 
        error: 'Indication parameter is required' 
      });
    }
    
    // Get all reports for the indication
    const reports = await db.select()
      .from(csr_reports)
      .where(
        and(
          like(csr_reports.indication, `%${indication}%`),
          not(eq(csr_reports.status, 'Withdrawn')),
          isNull(csr_reports.deletedAt)
        )
      );
    
    if (reports.length === 0) {
      return res.status(404).json({ 
        error: `No reports found for indication: ${indication}` 
      });
    }
    
    // Get report IDs
    const reportIds = reports.map(report => report.id);
    
    // Get details for all reports
    const details = await db.select()
      .from(csr_details)
      .where(
        or(...reportIds.map(id => eq(csr_details.reportId, id)))
      );
    
    // Aggregate data
    const adverseEvents: Record<string, AdverseEvent> = {};
    const endpoints: Record<string, Endpoint> = {};
    let totalDropoutRate = 0;
    let dropoutCount = 0;
    
    // Process details data
    details.forEach(detail => {
      // Process adverse events if available
      if (detail.adverseEvents) {
        const events = typeof detail.adverseEvents === 'string' 
          ? JSON.parse(detail.adverseEvents) 
          : detail.adverseEvents;
        
        if (Array.isArray(events)) {
          events.forEach((event: any) => {
            const eventName = event.name || event.term || 'Unknown';
            const frequency = event.frequency || event.incidence || 0;
            
            if (!adverseEvents[eventName]) {
              adverseEvents[eventName] = {
                name: eventName,
                occurrences: 0,
                avgFrequency: 0,
                frequencySum: 0
              };
            }
            
            adverseEvents[eventName].occurrences += 1;
            adverseEvents[eventName].frequencySum += parseFloat(frequency) || 0;
            adverseEvents[eventName].avgFrequency = 
              adverseEvents[eventName].frequencySum / adverseEvents[eventName].occurrences;
          });
        }
      }
      
      // Process endpoints
      if (detail.primaryEndpoint) {
        const endpointName = detail.primaryEndpoint;
        
        if (!endpoints[endpointName]) {
          endpoints[endpointName] = {
            name: endpointName,
            occurrences: 0,
            primaryUseCount: 0,
            secondaryUseCount: 0
          };
        }
        
        endpoints[endpointName].occurrences += 1;
        endpoints[endpointName].primaryUseCount += 1;
      }
      
      if (detail.secondaryEndpoints) {
        const secondaryEps = typeof detail.secondaryEndpoints === 'string'
          ? JSON.parse(detail.secondaryEndpoints)
          : detail.secondaryEndpoints;
          
        if (Array.isArray(secondaryEps)) {
          secondaryEps.forEach((ep: string) => {
            if (!endpoints[ep]) {
              endpoints[ep] = {
                name: ep,
                occurrences: 0,
                primaryUseCount: 0,
                secondaryUseCount: 0
              };
            }
            
            endpoints[ep].occurrences += 1;
            endpoints[ep].secondaryUseCount += 1;
          });
        }
      }
      
      // Process dropout rate
      if (detail.dropoutRate) {
        const dropoutRate = parseFloat(detail.dropoutRate);
        if (!isNaN(dropoutRate)) {
          totalDropoutRate += dropoutRate;
          dropoutCount += 1;
        }
      }
    });
    
    // Calculate averages
    const avgDropoutRate = dropoutCount > 0 ? totalDropoutRate / dropoutCount : 0;
    
    // Sort adverse events and endpoints by occurrences (descending)
    const sortedAdverseEvents = Object.values(adverseEvents)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 20); // Top 20 adverse events
      
    const sortedEndpoints = Object.values(endpoints)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 20); // Top 20 endpoints
    
    // Create summary
    const summary: IntelligenceSummary = {
      indication: indication as string,
      reportCount: reports.length,
      phases: countByPhase(reports),
      averageDropoutRate: avgDropoutRate,
      topAdverseEvents: sortedAdverseEvents,
      endpointTrends: sortedEndpoints,
      analysisDate: new Date().toISOString()
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating intelligence summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate intelligence summary',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get global KPI dashboard data across all trials
 */
router.get('/kpi-dashboard', async (req, res) => {
  try {
    // Get all active reports
    const reports = await db.select()
      .from(csr_reports)
      .where(isNull(csr_reports.deletedAt));
    
    // Calculate indication distribution
    const indicationCounts: Record<string, number> = {};
    reports.forEach(report => {
      const indication = report.indication;
      indicationCounts[indication] = (indicationCounts[indication] || 0) + 1;
    });
    
    // Sort indications by count (descending)
    const topIndications = Object.entries(indicationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 indications
      .map(([name, count]) => ({ name, count }));
    
    // Calculate phase distribution
    const phaseCounts = countByPhase(reports);
    
    // Get details data for all reports
    const reportIds = reports.map(report => report.id);
    const details = await db.select()
      .from(csr_details)
      .where(
        reportIds.length > 0
          ? or(...reportIds.map(id => eq(csr_details.reportId, id)))
          : undefined
      );
    
    // Calculate average dropout rate
    let totalDropoutRate = 0;
    let dropoutCount = 0;
    details.forEach(detail => {
      if (detail.dropoutRate) {
        const dropoutRate = parseFloat(detail.dropoutRate);
        if (!isNaN(dropoutRate)) {
          totalDropoutRate += dropoutRate;
          dropoutCount += 1;
        }
      }
    });
    const avgDropoutRate = dropoutCount > 0 ? totalDropoutRate / dropoutCount : 0;
    
    // Calculate sponsor distribution
    const sponsorCounts: Record<string, number> = {};
    reports.forEach(report => {
      const sponsor = report.sponsor;
      sponsorCounts[sponsor] = (sponsorCounts[sponsor] || 0) + 1;
    });
    
    // Sort sponsors by count (descending)
    const topSponsors = Object.entries(sponsorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 sponsors
      .map(([name, count]) => ({ name, count }));
    
    // Calculate status distribution
    const statusCounts: Record<string, number> = {};
    reports.forEach(report => {
      const status = report.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Sort statuses by count (descending)
    const trialStatus = Object.entries(statusCounts)
      .map(([name, count]) => ({ name, count }));
    
    // Calculate completion rate
    const completedCount = statusCounts['Completed'] || 0;
    const completionRate = reports.length > 0 ? completedCount / reports.length : 0;
    
    // Calculate time-based metrics
    const timeMetrics = calculateTimeMetrics(reports);
    
    // Create KPI dashboard
    const dashboard: KPIDashboard = {
      totalTrials: reports.length,
      trialsByIndication: topIndications,
      trialsByPhase: phaseCounts,
      trialsByStatus: trialStatus,
      trialsByTopSponsors: topSponsors,
      averageDropoutRate: avgDropoutRate,
      completionRate,
      timeMetrics,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(dashboard);
  } catch (error) {
    console.error('Error generating KPI dashboard:', error);
    res.status(500).json({ 
      error: 'Failed to generate KPI dashboard',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Helper function to count reports by phase
 */
function countByPhase(reports: typeof csr_reports.$inferSelect[]) {
  const phaseCounts: Record<string, number> = {};
  
  reports.forEach(report => {
    const phase = report.phase;
    phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
  });
  
  // Convert to array of { name, count }
  return Object.entries(phaseCounts)
    .map(([name, count]) => ({ name, count }));
}

/**
 * Helper function to calculate time-based metrics
 */
function calculateTimeMetrics(reports: typeof csr_reports.$inferSelect[]) {
  // Get current year and past 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  
  // Count reports by year
  const yearCounts: Record<number, number> = {};
  years.forEach(year => {
    yearCounts[year] = 0;
  });
  
  reports.forEach(report => {
    if (report.date) {
      const reportYear = new Date(report.date).getFullYear();
      if (yearCounts[reportYear] !== undefined) {
        yearCounts[reportYear] += 1;
      }
    }
  });
  
  // Convert to array of { year, count }
  return Object.entries(yearCounts)
    .map(([year, count]) => ({ 
      year: parseInt(year), 
      count 
    }))
    .sort((a, b) => a.year - b.year);
}

export default router;