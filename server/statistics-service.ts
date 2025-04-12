import { db } from './db';
import { csrReports, csrDetails } from '@shared/schema';
import { eq, sql, and, gte, lte, desc, count, avg, max, min } from 'drizzle-orm';
import * as math from 'mathjs';
import { stat } from 'ml-stat';

/**
 * Enhanced Biostatistics Service for TrialSage
 * 
 * This service provides comprehensive statistical analyses for clinical trials including:
 * - Advanced trial design statistics (sample size calculation, power analysis)
 * - Endpoint analysis and optimization
 * - Statistical significance testing and modeling
 * - Bayesian probability calculations for trial outcomes
 * - Comparative efficacy analysis across therapeutic areas
 * - Meta-analysis capabilities for aggregate CSR data
 * - Adaptive trial design optimization
 */
export class StatisticsService {
  /**
   * Get statistics for a specific indication
   */
  async getIndication(indication: string): Promise<any> {
    try {
      const reports = await db.select({
        id: csrReports.id,
        title: csrReports.title,
        phase: csrReports.phase,
        status: csrReports.status
      })
      .from(csrReports)
      .where(eq(csrReports.indication, indication));
      
      if (reports.length === 0) {
        return {
          indication,
          count: 0,
          phases: {},
          success_rate: null
        };
      }
      
      const reportIds = reports.map(r => r.id);
      
      // Get details for all reports of this indication
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Count studies by phase
      const phaseCount: Record<string, number> = {};
      reports.forEach(report => {
        const phase = report.phase;
        phaseCount[phase] = (phaseCount[phase] || 0) + 1;
      });
      
      // Calculate success rate
      const successfulTrials = reports.filter(r => 
        r.status.toLowerCase() === 'completed' || 
        r.status.toLowerCase() === 'successful'
      ).length;
      
      const successRate = reports.length > 0 ? successfulTrials / reports.length : 0;
      
      // Calculate average sample size
      const sampleSizes = details
        .filter(d => d.sampleSize !== null && d.sampleSize > 0)
        .map(d => d.sampleSize);
      
      const avgSampleSize = sampleSizes.length > 0 
        ? sampleSizes.reduce((sum, size) => sum + size, 0) / sampleSizes.length 
        : null;
      
      return {
        indication,
        count: reports.length,
        phases: phaseCount,
        success_rate: successRate,
        avg_sample_size: avgSampleSize,
        reports: reports.map(r => ({ id: r.id, title: r.title, phase: r.phase }))
      };
    } catch (error) {
      console.error(`Error getting indication stats for ${indication}:`, error);
      return {
        indication,
        count: 0,
        phases: {},
        success_rate: null,
        error: 'Failed to retrieve statistics'
      };
    }
  }
  
  /**
   * Get statistics for a specific phase across all indications
   */
  async getPhaseStatistics(phase: string): Promise<any> {
    try {
      const reports = await db.select({
        id: csrReports.id,
        indication: csrReports.indication,
        status: csrReports.status
      })
      .from(csrReports)
      .where(eq(csrReports.phase, phase));
      
      if (reports.length === 0) {
        return {
          phase,
          count: 0,
          indications: {},
          success_rate: null
        };
      }
      
      const reportIds = reports.map(r => r.id);
      
      // Get details for all reports of this phase
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Count studies by indication
      const indicationCount: Record<string, number> = {};
      reports.forEach(report => {
        const indication = report.indication;
        indicationCount[indication] = (indicationCount[indication] || 0) + 1;
      });
      
      // Calculate success rate
      const successfulTrials = reports.filter(r => 
        r.status.toLowerCase() === 'completed' || 
        r.status.toLowerCase() === 'successful'
      ).length;
      
      const successRate = reports.length > 0 ? successfulTrials / reports.length : 0;
      
      // Calculate average sample size
      const sampleSizes = details
        .filter(d => d.sampleSize !== null && d.sampleSize > 0)
        .map(d => d.sampleSize);
      
      const avgSampleSize = sampleSizes.length > 0 
        ? sampleSizes.reduce((sum, size) => sum + size, 0) / sampleSizes.length 
        : null;
      
      // Calculate median duration
      const durations = details
        .filter(d => d.studyDuration !== null)
        .map(d => {
          // Extract number of weeks from duration string
          const durationStr = d.studyDuration || '';
          const weekMatch = durationStr.match(/(\d+)\s*week/i);
          const monthMatch = durationStr.match(/(\d+)\s*month/i);
          
          if (weekMatch) {
            return parseInt(weekMatch[1]);
          } else if (monthMatch) {
            return parseInt(monthMatch[1]) * 4.33; // Approximate weeks in a month
          }
          return null;
        })
        .filter(d => d !== null) as number[];
      
      const medianDuration = durations.length > 0 
        ? this.calculateMedian(durations)
        : null;
      
      return {
        phase,
        count: reports.length,
        indications: indicationCount,
        success_rate: successRate,
        avg_sample_size: avgSampleSize,
        median_duration_weeks: medianDuration
      };
    } catch (error) {
      console.error(`Error getting phase stats for ${phase}:`, error);
      return {
        phase,
        count: 0,
        indications: {},
        success_rate: null,
        error: 'Failed to retrieve statistics'
      };
    }
  }
  
  /**
   * Get combined statistics for a specific indication and phase
   */
  async getCombinedStatistics(params: {
    indication: string;
    phase: string;
  }): Promise<any> {
    try {
      const { indication, phase } = params;
      
      const reports = await db.select({
        id: csrReports.id,
        title: csrReports.title,
        status: csrReports.status
      })
      .from(csrReports)
      .where(and(
        eq(csrReports.indication, indication),
        eq(csrReports.phase, phase)
      ));
      
      if (reports.length === 0) {
        return {
          indication,
          phase,
          totalTrials: 0,
          successRate: null,
          sampleSizeMean: null,
          sampleSizeMedian: null,
          sampleSizeRange: null,
          durationMean: null,
          durationMedian: null,
          durationRange: null,
          dropoutRateMean: null,
          dropoutRateMedian: null,
          dropoutRateRange: null,
          commonDesigns: []
        };
      }
      
      const reportIds = reports.map(r => r.id);
      
      // Get details for all reports
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Calculate success rate
      const successfulTrials = reports.filter(r => 
        r.status.toLowerCase() === 'completed' || 
        r.status.toLowerCase() === 'successful'
      ).length;
      
      const successRate = reports.length > 0 ? successfulTrials / reports.length : 0;
      
      // Sample size statistics
      const sampleSizes = details
        .filter(d => d.sampleSize !== null && d.sampleSize > 0)
        .map(d => d.sampleSize);
      
      const sampleSizeMean = sampleSizes.length > 0 
        ? sampleSizes.reduce((sum, size) => sum + size, 0) / sampleSizes.length 
        : null;
      
      const sampleSizeMedian = sampleSizes.length > 0 
        ? this.calculateMedian(sampleSizes)
        : null;
      
      const sampleSizeRange = sampleSizes.length > 0 
        ? [Math.min(...sampleSizes), Math.max(...sampleSizes)]
        : null;
      
      // Duration statistics
      const durations = details
        .filter(d => d.studyDuration !== null)
        .map(d => {
          // Extract number of weeks from duration string
          const durationStr = d.studyDuration || '';
          const weekMatch = durationStr.match(/(\d+)\s*week/i);
          const monthMatch = durationStr.match(/(\d+)\s*month/i);
          
          if (weekMatch) {
            return parseInt(weekMatch[1]);
          } else if (monthMatch) {
            return parseInt(monthMatch[1]) * 4.33; // Approximate weeks in a month
          }
          return null;
        })
        .filter(d => d !== null) as number[];
      
      const durationMean = durations.length > 0 
        ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length 
        : null;
      
      const durationMedian = durations.length > 0 
        ? this.calculateMedian(durations)
        : null;
      
      const durationRange = durations.length > 0 
        ? [Math.min(...durations), Math.max(...durations)]
        : null;
      
      // Dropout rate statistics
      const dropoutRates = details
        .filter(d => d.completionRate !== null)
        .map(d => {
          const completionRate = parseFloat(d.completionRate?.toString() || '0');
          return isNaN(completionRate) ? null : 1 - completionRate/100;
        })
        .filter(d => d !== null) as number[];
      
      const dropoutRateMean = dropoutRates.length > 0 
        ? dropoutRates.reduce((sum, rate) => sum + rate, 0) / dropoutRates.length 
        : null;
      
      const dropoutRateMedian = dropoutRates.length > 0 
        ? this.calculateMedian(dropoutRates)
        : null;
      
      const dropoutRateRange = dropoutRates.length > 0 
        ? [Math.min(...dropoutRates), Math.max(...dropoutRates)]
        : null;
      
      // Common study designs
      const designCounts: Record<string, number> = {};
      details.forEach(detail => {
        if (detail.studyDesign) {
          const design = detail.studyDesign;
          designCounts[design] = (designCounts[design] || 0) + 1;
        }
      });
      
      const commonDesigns = Object.entries(designCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([design, count]) => ({
          design,
          count,
          percentage: (count / details.length) * 100
        }));
      
      return {
        indication,
        phase,
        totalTrials: reports.length,
        successRate,
        sampleSizeMean,
        sampleSizeMedian,
        sampleSizeRange,
        durationMean,
        durationMedian,
        durationRange,
        dropoutRateMean,
        dropoutRateMedian,
        dropoutRateRange,
        commonDesigns
      };
    } catch (error) {
      console.error(`Error getting combined stats for ${params.indication} Phase ${params.phase}:`, error);
      return {
        indication: params.indication,
        phase: params.phase,
        totalTrials: 0,
        successRate: null,
        error: 'Failed to retrieve statistics'
      };
    }
  }
  
  /**
   * Get endpoint statistics for a specific indication and phase
   */
  async getEndpointStatistics(params: {
    indication: string;
    phase: string;
  }): Promise<any> {
    try {
      const { indication, phase } = params;
      
      const reports = await db.select({
        id: csrReports.id,
        status: csrReports.status
      })
      .from(csrReports)
      .where(and(
        eq(csrReports.indication, indication),
        eq(csrReports.phase, phase)
      ));
      
      if (reports.length === 0) {
        return {
          indication,
          phase,
          totalTrials: 0,
          commonEndpoints: [],
          endpointSuccessFactors: []
        };
      }
      
      const reportIds = reports.map(r => r.id);
      
      // Get details for all reports
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Extract endpoints from details
      const endpointMap = new Map<string, {
        count: number,
        successCount: number,
        trialIds: number[]
      }>();
      
      details.forEach(detail => {
        try {
          // First try to parse endpoints as JSON
          let endpoints: any[] = [];
          
          if (detail.endpoints) {
            if (typeof detail.endpoints === 'string') {
              try {
                endpoints = JSON.parse(detail.endpoints);
              } catch (e) {
                // Not valid JSON, try to extract from text
                const endpointText = detail.endpoints;
                // Simple extraction of potential endpoints from text
                const lines = endpointText.split('\n')
                  .filter(line => 
                    line.includes('endpoint') || 
                    line.includes('outcome') || 
                    line.includes('measure')
                  );
                
                endpoints = lines.map(line => ({ name: line.trim() }));
              }
            } else if (Array.isArray(detail.endpoints)) {
              endpoints = detail.endpoints;
            } else if (typeof detail.endpoints === 'object') {
              // Try to extract from object structure
              const endpointObj = detail.endpoints as any;
              
              if (endpointObj.primary) {
                if (Array.isArray(endpointObj.primary)) {
                  endpoints = [...endpoints, ...endpointObj.primary];
                } else {
                  endpoints.push({ name: endpointObj.primary });
                }
              }
              
              if (endpointObj.secondary) {
                if (Array.isArray(endpointObj.secondary)) {
                  endpoints = [...endpoints, ...endpointObj.secondary];
                } else {
                  endpoints.push({ name: endpointObj.secondary });
                }
              }
            }
          }
          
          // Process each endpoint
          endpoints.forEach(endpoint => {
            let endpointName = '';
            
            if (typeof endpoint === 'string') {
              endpointName = endpoint;
            } else if (endpoint && endpoint.name) {
              endpointName = endpoint.name;
            } else if (endpoint && endpoint.description) {
              endpointName = endpoint.description;
            }
            
            if (endpointName) {
              // Normalize endpoint name
              endpointName = endpointName
                .replace(/primary endpoint:?/i, '')
                .replace(/secondary endpoint:?/i, '')
                .trim();
              
              // Update endpoint statistics
              if (!endpointMap.has(endpointName)) {
                endpointMap.set(endpointName, {
                  count: 0,
                  successCount: 0,
                  trialIds: []
                });
              }
              
              const stats = endpointMap.get(endpointName)!;
              stats.count++;
              stats.trialIds.push(detail.reportId);
              
              // Check if trial was successful
              const report = reports.find(r => r.id === detail.reportId);
              if (report && (
                report.status.toLowerCase() === 'completed' || 
                report.status.toLowerCase() === 'successful'
              )) {
                stats.successCount++;
              }
            }
          });
        } catch (e) {
          console.error('Error processing endpoints:', e);
        }
      });
      
      // Convert to array and sort by frequency
      const commonEndpoints = Array.from(endpointMap.entries())
        .map(([name, stats]) => ({
          name,
          frequency: stats.count,
          percentage: (stats.count / details.length) * 100,
          successRate: stats.count > 0 ? stats.successCount / stats.count : 0
        }))
        .sort((a, b) => b.frequency - a.frequency);
      
      // Analyze factors that correlate with endpoint success
      const endpointSuccessFactors = this.analyzeEndpointSuccessFactors(details, reports);
      
      return {
        indication,
        phase,
        totalTrials: reports.length,
        commonEndpoints,
        endpointSuccessFactors
      };
    } catch (error) {
      console.error(`Error getting endpoint stats for ${params.indication} Phase ${params.phase}:`, error);
      return {
        indication: params.indication,
        phase: params.phase,
        totalTrials: 0,
        commonEndpoints: [],
        endpointSuccessFactors: []
      };
    }
  }
  
  /**
   * Analyze what factors correlate with endpoint success
   */
  private analyzeEndpointSuccessFactors(details: any[], reports: any[]): any[] {
    const factors = [];
    
    // Map report IDs to success status
    const reportSuccessMap = new Map<number, boolean>();
    reports.forEach(report => {
      reportSuccessMap.set(report.id, 
        report.status.toLowerCase() === 'completed' || 
        report.status.toLowerCase() === 'successful'
      );
    });
    
    // Sample size correlation
    const successSampleSizes = details
      .filter(d => d.sampleSize && reportSuccessMap.get(d.reportId))
      .map(d => d.sampleSize);
    
    const failureSampleSizes = details
      .filter(d => d.sampleSize && !reportSuccessMap.get(d.reportId))
      .map(d => d.sampleSize);
    
    if (successSampleSizes.length > 0 && failureSampleSizes.length > 0) {
      const avgSuccessSampleSize = successSampleSizes.reduce((sum, size) => sum + size, 0) / 
        successSampleSizes.length;
      
      const avgFailureSampleSize = failureSampleSizes.reduce((sum, size) => sum + size, 0) / 
        failureSampleSizes.length;
      
      const sampleSizeDiff = avgSuccessSampleSize - avgFailureSampleSize;
      
      if (Math.abs(sampleSizeDiff) > 10) {
        factors.push({
          factor: 'Sample Size',
          description: sampleSizeDiff > 0 
            ? `Successful trials had larger sample sizes (avg: ${Math.round(avgSuccessSampleSize)} vs ${Math.round(avgFailureSampleSize)})`
            : `Successful trials had smaller sample sizes (avg: ${Math.round(avgSuccessSampleSize)} vs ${Math.round(avgFailureSampleSize)})`,
          confidence: Math.min(0.9, 0.5 + Math.abs(sampleSizeDiff) / 200)
        });
      }
    }
    
    // Study design correlation
    const designSuccessMap = new Map<string, {success: number, total: number}>();
    
    details.forEach(detail => {
      if (detail.studyDesign) {
        const design = detail.studyDesign;
        
        if (!designSuccessMap.has(design)) {
          designSuccessMap.set(design, {success: 0, total: 0});
        }
        
        const stats = designSuccessMap.get(design)!;
        stats.total++;
        
        if (reportSuccessMap.get(detail.reportId)) {
          stats.success++;
        }
      }
    });
    
    // Find designs with significantly higher success rates
    const overallSuccessRate = reports.filter(r => reportSuccessMap.get(r.id)).length / reports.length;
    
    designSuccessMap.forEach((stats, design) => {
      if (stats.total >= 3) { // Only consider designs used in at least 3 trials
        const designSuccessRate = stats.success / stats.total;
        const successRateDiff = designSuccessRate - overallSuccessRate;
        
        if (successRateDiff > 0.1) { // At least 10% better success rate
          factors.push({
            factor: 'Study Design',
            description: `"${design}" design shows higher success rate (${Math.round(designSuccessRate * 100)}% vs ${Math.round(overallSuccessRate * 100)}%)`,
            confidence: Math.min(0.9, 0.5 + stats.total / 10) // More confidence with more trials
          });
        }
      }
    });
    
    // Add general guidance based on literature if we don't have enough factors
    if (factors.length < 2) {
      factors.push({
        factor: 'Endpoint Specificity',
        description: 'More specific and objectively measurable endpoints tend to show higher success rates',
        confidence: 0.7
      });
      
      factors.push({
        factor: 'Endpoint Selection',
        description: 'Endpoints with established precedent in regulatory approvals have higher success rates',
        confidence: 0.8
      });
    }
    
    return factors;
  }
  
  /**
   * Get competitive analysis for a specific indication and phase
   */
  async getCompetitiveAnalysis(params: {
    indication: string;
    phase: string;
  }): Promise<any> {
    try {
      const { indication, phase } = params;
      
      // Get all trials for this indication, not just the specific phase
      const indicationReports = await db.select({
        id: csrReports.id,
        title: csrReports.title,
        phase: csrReports.phase,
        sponsor: csrReports.sponsor,
        uploadDate: csrReports.uploadDate,
        status: csrReports.status,
        date: csrReports.date
      })
      .from(csrReports)
      .where(eq(csrReports.indication, indication))
      .orderBy(desc(csrReports.uploadDate));
      
      if (indicationReports.length === 0) {
        return {
          indication,
          phase,
          topSponsors: [],
          recentTrials: [],
          trendingEndpoints: [],
          emergingDesigns: [],
          marketInsights: []
        };
      }
      
      // Get reports for the specific phase
      const phaseReports = indicationReports.filter(r => r.phase === phase);
      
      // Calculate top sponsors by trial count
      const sponsorCounts: Record<string, number> = {};
      indicationReports.forEach(report => {
        const sponsor = report.sponsor;
        sponsorCounts[sponsor] = (sponsorCounts[sponsor] || 0) + 1;
      });
      
      const topSponsors = Object.entries(sponsorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([sponsor, count]) => ({
          sponsor,
          trialCount: count,
          percentage: (count / indicationReports.length) * 100
        }));
      
      // Get recent trials for the specific phase
      const recentTrials = phaseReports.slice(0, 5).map(report => ({
        id: report.id,
        title: report.title,
        sponsor: report.sponsor,
        date: report.date || 'Unknown date',
        status: report.status
      }));
      
      // Find trending endpoints and emerging designs
      const allReportIds = indicationReports.map(r => r.id);
      
      // Get details for all reports
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${allReportIds.join(',')})`);
      
      // Find trending endpoints
      const trendingEndpoints = this.findTrendingEndpoints(details, indicationReports);
      
      // Find emerging designs
      const emergingDesigns = this.findEmergingDesigns(details, indicationReports);
      
      // Generate market insights
      const marketInsights = this.generateMarketInsights(indicationReports, phaseReports, details);
      
      return {
        indication,
        phase,
        topSponsors,
        recentTrials,
        trendingEndpoints,
        emergingDesigns,
        marketInsights
      };
    } catch (error) {
      console.error(`Error getting competitive analysis for ${params.indication} Phase ${params.phase}:`, error);
      return {
        indication: params.indication,
        phase: params.phase,
        topSponsors: [],
        recentTrials: [],
        trendingEndpoints: [],
        emergingDesigns: [],
        marketInsights: []
      };
    }
  }
  
  /**
   * Find trending endpoints based on recent trial data
   */
  private findTrendingEndpoints(details: any[], reports: any[]): any[] {
    // Sort reports by date (newest first)
    const sortedReports = [...reports].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    
    // Split into recent (newest 30%) and older trials
    const splitPoint = Math.max(2, Math.floor(sortedReports.length * 0.3));
    const recentReports = sortedReports.slice(0, splitPoint);
    const olderReports = sortedReports.slice(splitPoint);
    
    const recentReportIds = new Set(recentReports.map(r => r.id));
    
    // Extract endpoints from recent and older trials
    const recentEndpoints = new Map<string, number>();
    const olderEndpoints = new Map<string, number>();
    
    details.forEach(detail => {
      try {
        const isRecent = recentReportIds.has(detail.reportId);
        const endpointTarget = isRecent ? recentEndpoints : olderEndpoints;
        
        // Extract endpoints from this trial
        let endpoints: string[] = [];
        
        if (detail.endpoints) {
          if (typeof detail.endpoints === 'string') {
            try {
              const parsedEndpoints = JSON.parse(detail.endpoints);
              if (Array.isArray(parsedEndpoints)) {
                endpoints = parsedEndpoints.map(e => typeof e === 'string' ? e : e.name || e.description || '');
              } else {
                // Extract from text
                const lines = detail.endpoints.split('\n')
                  .filter((line: string) => 
                    line.includes('endpoint') || 
                    line.includes('outcome') || 
                    line.includes('measure')
                  );
                endpoints = lines.map((line: string) => line.trim());
              }
            } catch (e) {
              // Not valid JSON, use as text
              endpoints = [detail.endpoints];
            }
          } else if (Array.isArray(detail.endpoints)) {
            endpoints = detail.endpoints.map((e: any) => 
              typeof e === 'string' ? e : e.name || e.description || ''
            );
          } else if (typeof detail.endpoints === 'object') {
            // Try to extract from object structure
            const endpointObj = detail.endpoints as any;
            
            if (endpointObj.primary) {
              if (Array.isArray(endpointObj.primary)) {
                endpoints = [...endpoints, ...endpointObj.primary.map((e: any) => 
                  typeof e === 'string' ? e : e.name || e.description || ''
                )];
              } else {
                endpoints.push(typeof endpointObj.primary === 'string' ? 
                  endpointObj.primary : 'Primary endpoint');
              }
            }
            
            if (endpointObj.secondary) {
              if (Array.isArray(endpointObj.secondary)) {
                endpoints = [...endpoints, ...endpointObj.secondary.map((e: any) => 
                  typeof e === 'string' ? e : e.name || e.description || ''
                )];
              } else {
                endpoints.push(typeof endpointObj.secondary === 'string' ? 
                  endpointObj.secondary : 'Secondary endpoint');
              }
            }
          }
        }
        
        // Count each endpoint
        endpoints.forEach(endpoint => {
          if (endpoint && typeof endpoint === 'string') {
            const normalizedEndpoint = endpoint
              .replace(/primary endpoint:?/i, '')
              .replace(/secondary endpoint:?/i, '')
              .trim();
            
            if (normalizedEndpoint) {
              endpointTarget.set(
                normalizedEndpoint, 
                (endpointTarget.get(normalizedEndpoint) || 0) + 1
              );
            }
          }
        });
      } catch (e) {
        console.error('Error extracting endpoints:', e);
      }
    });
    
    // Calculate growth rate for each endpoint
    const endpointGrowth: {
      endpoint: string;
      recentFrequency: number;
      olderFrequency: number;
      growthRate: number;
    }[] = [];
    
    recentEndpoints.forEach((recentCount, endpoint) => {
      const olderCount = olderEndpoints.get(endpoint) || 0;
      
      // Adjust count to per-trial basis for fair comparison
      const recentFrequency = recentCount / Math.max(1, recentReports.length);
      const olderFrequency = olderCount / Math.max(1, olderReports.length);
      
      // Calculate growth rate
      // Add small value to avoid division by 0
      const growthRate = (recentFrequency - olderFrequency) / (olderFrequency + 0.01);
      
      endpointGrowth.push({
        endpoint,
        recentFrequency,
        olderFrequency,
        growthRate
      });
    });
    
    // Also consider new endpoints that weren't in older trials
    recentEndpoints.forEach((recentCount, endpoint) => {
      if (!olderEndpoints.has(endpoint)) {
        const recentFrequency = recentCount / Math.max(1, recentReports.length);
        
        endpointGrowth.push({
          endpoint,
          recentFrequency,
          olderFrequency: 0,
          growthRate: 1.0 // 100% growth since it's new
        });
      }
    });
    
    // Sort by growth rate and select top trending endpoints
    return endpointGrowth
      .filter(item => item.recentFrequency >= 0.2) // Must appear in at least 20% of recent trials
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 5)
      .map(item => ({
        endpoint: item.endpoint,
        growthRate: item.growthRate,
        trend: item.growthRate > 0.5 ? 'Strongly increasing' :
               item.growthRate > 0.1 ? 'Increasing' :
               item.growthRate > -0.1 ? 'Stable' : 'Decreasing'
      }));
  }
  
  /**
   * Find emerging study designs based on recent trial data
   */
  private findEmergingDesigns(details: any[], reports: any[]): string[] {
    // Sort reports by date (newest first)
    const sortedReports = [...reports].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    
    // Split into recent (newest 30%) and older trials
    const splitPoint = Math.max(2, Math.floor(sortedReports.length * 0.3));
    const recentReports = sortedReports.slice(0, splitPoint);
    
    const recentReportIds = new Set(recentReports.map(r => r.id));
    
    // Extract designs from recent trials
    const recentDesignCounts = new Map<string, number>();
    
    details.forEach(detail => {
      if (detail.studyDesign && recentReportIds.has(detail.reportId)) {
        const design = detail.studyDesign;
        recentDesignCounts.set(
          design, 
          (recentDesignCounts.get(design) || 0) + 1
        );
      }
    });
    
    // Convert to array, sort by frequency, and select top designs
    return Array.from(recentDesignCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([design]) => design);
  }
  
  /**
   * Generate market insights based on trial data
   */
  private generateMarketInsights(allReports: any[], phaseReports: any[], details: any[]): string[] {
    const insights: string[] = [];
    
    // Only proceed if we have enough data
    if (allReports.length < 3) {
      return [
        "Insufficient data to generate reliable market insights"
      ];
    }
    
    // Calculate phase distribution
    const phaseCounts: Record<string, number> = {};
    allReports.forEach(report => {
      const phase = report.phase;
      phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
    });
    
    const totalReports = allReports.length;
    const phaseDistribution = Object.entries(phaseCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([phase, count]) => ({
        phase,
        count,
        percentage: (count / totalReports) * 100
      }));
    
    // Get top phase
    const topPhase = phaseDistribution[0];
    if (topPhase) {
      insights.push(
        `${Math.round(topPhase.percentage)}% of trials for this indication are in ${topPhase.phase}, indicating current research focus`
      );
    }
    
    // Calculate sponsor concentration
    const sponsorCounts: Record<string, number> = {};
    allReports.forEach(report => {
      const sponsor = report.sponsor;
      sponsorCounts[sponsor] = (sponsorCounts[sponsor] || 0) + 1;
    });
    
    const sponsorCount = Object.keys(sponsorCounts).length;
    const topSponsorTrials = Math.max(...Object.values(sponsorCounts));
    const sponsorConcentration = topSponsorTrials / totalReports;
    
    if (sponsorCount > 5 && sponsorConcentration < 0.3) {
      insights.push(
        `Highly competitive landscape with ${sponsorCount} different sponsors and no dominant player (top sponsor has only ${Math.round(sponsorConcentration * 100)}% market share)`
      );
    } else if (sponsorConcentration > 0.5) {
      const topSponsor = Object.entries(sponsorCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      insights.push(
        `Market dominated by ${topSponsor} with ${Math.round(sponsorConcentration * 100)}% of trials in this indication`
      );
    }
    
    // Analyze trial success rates if we have sufficient data
    const completedTrials = allReports.filter(r => 
      r.status.toLowerCase() === 'completed' || 
      r.status.toLowerCase() === 'successful'
    );
    
    if (completedTrials.length >= 5) {
      const successRate = completedTrials.length / allReports.length;
      
      if (successRate < 0.3) {
        insights.push(
          `Low historical success rate (${Math.round(successRate * 100)}%) suggests high risk for this indication`
        );
      } else if (successRate > 0.6) {
        insights.push(
          `High historical success rate (${Math.round(successRate * 100)}%) suggests favorable development outlook`
        );
      }
    }
    
    // Look for trends in study designs
    const designCounts: Record<string, number> = {};
    details.forEach(detail => {
      if (detail.studyDesign) {
        const design = detail.studyDesign;
        designCounts[design] = (designCounts[design] || 0) + 1;
      }
    });
    
    const topDesign = Object.entries(designCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topDesign && topDesign[1] > 3) {
      insights.push(
        `"${topDesign[0]}" is the predominant study design, used in ${topDesign[1]} trials for this indication`
      );
    }
    
    // Add an insight about trial recency if relevant
    const recentTrialsCount = allReports
      .filter(r => {
        if (!r.date) return false;
        const trialDate = new Date(r.date);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return trialDate >= twoYearsAgo;
      })
      .length;
    
    const recentTrialPercentage = recentTrialsCount / allReports.length;
    
    if (recentTrialPercentage > 0.4) {
      insights.push(
        `High recent trial activity (${Math.round(recentTrialPercentage * 100)}% of trials initiated in past 2 years) indicates strong current interest`
      );
    } else if (recentTrialPercentage < 0.1 && allReports.length > 10) {
      insights.push(
        `Low recent trial activity may indicate decreasing interest or research challenges in this space`
      );
    }
    
    return insights;
  }
  
  /**
   * Calculate median of an array of numbers
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  /**
   * Calculate statistical power for a given sample size and effect size
   * 
   * @param sampleSize - Total sample size across all groups
   * @param effectSize - Expected effect size (Cohen's d)
   * @param alpha - Significance level (typically 0.05)
   * @param groups - Number of treatment groups including control
   * @returns Statistical power (probability of detecting effect if it exists)
   */
  calculateStatisticalPower(
    sampleSize: number, 
    effectSize: number, 
    alpha: number = 0.05, 
    groups: number = 2
  ): number {
    try {
      // Simplified power calculation using normal approximation
      const perGroupSize = sampleSize / groups;
      const standardError = Math.sqrt(2 / perGroupSize); // Assumes equal variance
      const criticalValue = 1.96; // Approximately 97.5% of normal distribution for alpha=0.05
      
      // Calculate power using standardized effect and critical value
      const noncentrality = effectSize / standardError;
      const power = 1 - Math.exp(-0.5 * Math.pow(noncentrality - criticalValue, 2));
      
      return Math.min(1, Math.max(0, power)); // Bound between 0 and 1
    } catch (error) {
      console.error('Error calculating statistical power:', error);
      return 0;
    }
  }

  /**
   * Calculate required sample size for a desired statistical power
   * 
   * @param desiredPower - Desired statistical power (e.g., 0.8 or 0.9)
   * @param effectSize - Expected effect size (Cohen's d)
   * @param alpha - Significance level (typically 0.05)
   * @param groups - Number of treatment groups including control
   * @returns Required total sample size
   */
  calculateSampleSize(
    desiredPower: number, 
    effectSize: number, 
    alpha: number = 0.05, 
    groups: number = 2
  ): number {
    try {
      // Implementation based on normal approximation
      const z_alpha = 1.96; // For alpha = 0.05 (two-sided)
      const z_beta = math.erf.inv(desiredPower * 2 - 1) * Math.sqrt(2);
      
      // Calculate per-group sample size
      const perGroupSize = 2 * Math.pow(z_alpha + z_beta, 2) / Math.pow(effectSize, 2);
      
      // Total sample size across all groups
      const totalSampleSize = Math.ceil(perGroupSize * groups);
      
      return totalSampleSize;
    } catch (error) {
      console.error('Error calculating sample size:', error);
      return 0;
    }
  }

  /**
   * Calculate confidence interval for a proportion
   * 
   * @param successes - Number of successes
   * @param total - Total number of trials
   * @param confidenceLevel - Confidence level (e.g., 0.95 for 95% CI)
   * @returns Object with lower and upper bounds of CI
   */
  calculateConfidenceInterval(
    successes: number, 
    total: number, 
    confidenceLevel: number = 0.95
  ): { lower: number, upper: number } {
    try {
      const proportion = successes / total;
      const z = 1.96; // Approximate for 95% confidence
      const standardError = Math.sqrt((proportion * (1 - proportion)) / total);
      
      const margin = z * standardError;
      
      return {
        lower: Math.max(0, proportion - margin),
        upper: Math.min(1, proportion + margin)
      };
    } catch (error) {
      console.error('Error calculating confidence interval:', error);
      return { lower: 0, upper: 0 };
    }
  }

  /**
   * Perform a Monte Carlo simulation for trial outcomes
   * 
   * @param params - Simulation parameters
   * @returns Simulation results
   */
  simulateTrialOutcomes(params: {
    sampleSize: number;
    treatmentEffect: number;
    controlResponse: number;
    variability: number;
    iterations: number;
  }): {
    successProbability: number;
    confidenceInterval: { lower: number; upper: number };
    powerEstimate: number;
  } {
    try {
      const { sampleSize, treatmentEffect, controlResponse, variability, iterations } = params;
      
      // Split sample size between treatment and control
      const treatmentSize = Math.floor(sampleSize / 2);
      const controlSize = sampleSize - treatmentSize;
      
      // Run simulation iterations
      let successCount = 0;
      
      for (let i = 0; i < iterations; i++) {
        // Generate control group outcomes
        const controlOutcomes = Array(controlSize).fill(0).map(() => 
          controlResponse + (math.random() - 0.5) * 2 * variability
        );
        
        // Generate treatment group outcomes with treatment effect
        const treatmentOutcomes = Array(treatmentSize).fill(0).map(() => 
          controlResponse + treatmentEffect + (math.random() - 0.5) * 2 * variability
        );
        
        // Perform t-test (simplified)
        const controlMean = math.mean(controlOutcomes);
        const treatmentMean = math.mean(treatmentOutcomes);
        
        const controlVar = math.variance(controlOutcomes);
        const treatmentVar = math.variance(treatmentOutcomes);
        
        const pooledSE = Math.sqrt(controlVar/controlSize + treatmentVar/treatmentSize);
        const tStat = (treatmentMean - controlMean) / pooledSE;
        
        // Check if statistically significant
        if (Math.abs(tStat) > 1.96) { // Approximate critical value for alpha=0.05
          successCount++;
        }
      }
      
      const successProbability = successCount / iterations;
      const ci = this.calculateConfidenceInterval(successCount, iterations);
      
      return {
        successProbability,
        confidenceInterval: ci,
        powerEstimate: this.calculateStatisticalPower(sampleSize, treatmentEffect / variability)
      };
    } catch (error) {
      console.error('Error simulating trial outcomes:', error);
      return {
        successProbability: 0,
        confidenceInterval: { lower: 0, upper: 0 },
        powerEstimate: 0
      };
    }
  }

  /**
   * Calculate comparative statistics across multiple trials
   */
  async getComparativeStatistics(params: {
    indications: string[];
    phases: string[];
  }): Promise<any> {
    try {
      const { indications, phases } = params;
      
      // Get data for all specified indications and phases
      const reports = await db.select({
        id: csrReports.id,
        indication: csrReports.indication,
        phase: csrReports.phase,
        status: csrReports.status
      })
      .from(csrReports)
      .where(
        and(
          sql`${csrReports.indication} IN (${indications.join(',')})`,
          sql`${csrReports.phase} IN (${phases.join(',')})`
        )
      );
      
      if (reports.length === 0) {
        return {
          indications,
          phases,
          count: 0,
          comparativeData: []
        };
      }
      
      const reportIds = reports.map(r => r.id);
      
      // Get details for all reports
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Group data by indication and phase
      const groupedData = new Map<string, {
        indication: string;
        phase: string;
        reports: any[];
        details: any[];
      }>();
      
      // Initialize groups
      indications.forEach(indication => {
        phases.forEach(phase => {
          const key = `${indication}-${phase}`;
          groupedData.set(key, {
            indication,
            phase,
            reports: [],
            details: []
          });
        });
      });
      
      // Fill groups with data
      reports.forEach(report => {
        const key = `${report.indication}-${report.phase}`;
        if (groupedData.has(key)) {
          groupedData.get(key)!.reports.push(report);
        }
      });
      
      details.forEach(detail => {
        const report = reports.find(r => r.id === detail.reportId);
        if (report) {
          const key = `${report.indication}-${report.phase}`;
          if (groupedData.has(key)) {
            groupedData.get(key)!.details.push(detail);
          }
        }
      });
      
      // Calculate statistics for each group
      const comparativeData = Array.from(groupedData.values()).map(group => {
        const { indication, phase, reports, details } = group;
        
        // Skip empty groups
        if (reports.length === 0) {
          return {
            indication,
            phase,
            sampleCount: 0,
            stats: null
          };
        }
        
        // Success rate
        const successfulTrials = reports.filter(r => 
          r.status.toLowerCase() === 'completed' || 
          r.status.toLowerCase() === 'successful'
        ).length;
        
        const successRate = reports.length > 0 ? successfulTrials / reports.length : 0;
        const successRateCI = this.calculateConfidenceInterval(successfulTrials, reports.length);
        
        // Sample size statistics
        const sampleSizes = details
          .filter(d => d.sampleSize !== null && d.sampleSize > 0)
          .map(d => d.sampleSize);
        
        // Duration statistics (in weeks)
        const durations = details
          .filter(d => d.studyDuration !== null)
          .map(d => {
            const durationStr = d.studyDuration || '';
            const weekMatch = durationStr.match(/(\d+)\s*week/i);
            const monthMatch = durationStr.match(/(\d+)\s*month/i);
            
            if (weekMatch) {
              return parseInt(weekMatch[1]);
            } else if (monthMatch) {
              return parseInt(monthMatch[1]) * 4.33;
            }
            return null;
          })
          .filter(d => d !== null) as number[];
        
        // Calculate basic statistics
        const stats = {
          successRate,
          successRateCI,
          sampleSize: sampleSizes.length > 0 ? {
            mean: math.mean(sampleSizes),
            median: this.calculateMedian(sampleSizes),
            sd: math.std(sampleSizes),
            min: Math.min(...sampleSizes),
            max: Math.max(...sampleSizes)
          } : null,
          duration: durations.length > 0 ? {
            mean: math.mean(durations),
            median: this.calculateMedian(durations),
            sd: math.std(durations),
            min: Math.min(...durations),
            max: Math.max(...durations)
          } : null
        };
        
        return {
          indication,
          phase,
          sampleCount: reports.length,
          stats
        };
      });
      
      // Perform comparative analysis across groups
      const crossIndicationAnalysis = this.analyzeCrossIndication(comparativeData, phases);
      const crossPhaseAnalysis = this.analyzeCrossPhase(comparativeData, indications);
      
      return {
        indications,
        phases,
        count: reports.length,
        comparativeData,
        crossIndicationAnalysis,
        crossPhaseAnalysis
      };
    } catch (error) {
      console.error(`Error getting comparative statistics:`, error);
      return {
        indications: params.indications,
        phases: params.phases,
        count: 0,
        error: 'Failed to retrieve comparative statistics'
      };
    }
  }

  /**
   * Analyze differences across indications for the same phase
   */
  private analyzeCrossIndication(comparativeData: any[], phases: string[]): any[] {
    const results: any[] = [];
    
    phases.forEach(phase => {
      const phaseData = comparativeData.filter(d => d.phase === phase);
      
      if (phaseData.length < 2) return; // Need at least 2 indications to compare
      
      // Compare success rates
      const successRates = phaseData.map(d => ({
        indication: d.indication,
        rate: d.stats?.successRate || 0,
        count: d.sampleCount
      })).filter(d => d.count > 0);
      
      if (successRates.length < 2) return;
      
      // Find best and worst success rates
      successRates.sort((a, b) => b.rate - a.rate);
      const bestIndication = successRates[0];
      const worstIndication = successRates[successRates.length - 1];
      
      if (bestIndication.rate - worstIndication.rate > 0.1) {
        results.push({
          phase,
          analysisType: 'successRate',
          bestIndication: bestIndication.indication,
          worstIndication: worstIndication.indication,
          difference: bestIndication.rate - worstIndication.rate,
          confidence: this.calculateConfidence(bestIndication.count, worstIndication.count)
        });
      }
      
      // Compare sample sizes
      const sampleSizes = phaseData
        .filter(d => d.stats?.sampleSize?.mean)
        .map(d => ({
          indication: d.indication,
          mean: d.stats.sampleSize.mean,
          count: d.sampleCount
        }));
      
      if (sampleSizes.length < 2) return;
      
      sampleSizes.sort((a, b) => a.mean - b.mean);
      const smallestSample = sampleSizes[0];
      const largestSample = sampleSizes[sampleSizes.length - 1];
      
      if (largestSample.mean / smallestSample.mean > 1.5) {
        results.push({
          phase,
          analysisType: 'sampleSize',
          smallestIndication: smallestSample.indication,
          largestIndication: largestSample.indication,
          ratio: largestSample.mean / smallestSample.mean,
          confidence: this.calculateConfidence(smallestSample.count, largestSample.count)
        });
      }
    });
    
    return results;
  }

  /**
   * Analyze differences across phases for the same indication
   */
  private analyzeCrossPhase(comparativeData: any[], indications: string[]): any[] {
    const results: any[] = [];
    
    indications.forEach(indication => {
      const indicationData = comparativeData.filter(d => d.indication === indication);
      
      if (indicationData.length < 2) return; // Need at least 2 phases to compare
      
      // Compare success rates across phases
      const successRates = indicationData
        .filter(d => d.stats?.successRate !== undefined && d.sampleCount > 0)
        .map(d => ({
          phase: d.phase,
          rate: d.stats.successRate,
          count: d.sampleCount
        }));
      
      if (successRates.length < 2) return;
      
      // Sort phases by success rate
      successRates.sort((a, b) => b.rate - a.rate);
      
      // Compare consecutive phases to identify biggest drops
      for (let i = 0; i < successRates.length - 1; i++) {
        const current = successRates[i];
        const next = successRates[i + 1];
        const difference = current.rate - next.rate;
        
        if (difference > 0.15) { // Significant drop threshold
          results.push({
            indication,
            analysisType: 'phaseTransition',
            betterPhase: current.phase,
            worsePhase: next.phase,
            successRateDrop: difference,
            confidence: this.calculateConfidence(current.count, next.count)
          });
        }
      }
      
      // Compare duration trends across phases
      const durations = indicationData
        .filter(d => d.stats?.duration?.mean !== undefined)
        .map(d => ({
          phase: d.phase,
          mean: d.stats.duration.mean,
          count: d.sampleCount
        }));
      
      if (durations.length < 2) return;
      
      // Sort by phase (assuming phase is sortable like "Phase 1", "Phase 2", etc.)
      durations.sort((a, b) => a.phase.localeCompare(b.phase));
      
      // Calculate trend (positive means increasing duration in later phases)
      let increasingTrend = true;
      let decreasingTrend = true;
      
      for (let i = 0; i < durations.length - 1; i++) {
        if (durations[i].mean > durations[i + 1].mean) {
          increasingTrend = false;
        }
        if (durations[i].mean < durations[i + 1].mean) {
          decreasingTrend = false;
        }
      }
      
      if (increasingTrend || decreasingTrend) {
        results.push({
          indication,
          analysisType: 'durationTrend',
          trend: increasingTrend ? 'increasing' : 'decreasing',
          phases: durations.map(d => d.phase),
          values: durations.map(d => d.mean),
          confidence: this.calculateConfidence(...durations.map(d => d.count))
        });
      }
    });
    
    return results;
  }

  /**
   * Calculate confidence level based on sample sizes
   */
  private calculateConfidence(...sampleSizes: number[]): number {
    // Higher sample sizes and more balanced groups increase confidence
    const min = Math.min(...sampleSizes);
    const total = sampleSizes.reduce((sum, size) => sum + size, 0);
    
    // Scale from 0 to 1, with 0.5 being the minimum confidence for any analysis
    const baseConfidence = 0.5 + 0.5 * Math.min(1, min / 10); // Min sample of 10 gives full confidence
    
    // Adjust for total samples
    const totalAdjustment = Math.min(0.3, total / 100 * 0.3); // Up to 30% bonus for large total
    
    return Math.min(0.95, baseConfidence + totalAdjustment);
  }
  
  /**
   * Predict trial success probability
   */
  async predictTrialSuccess(params: {
    indication: string;
    phase: string;
    sampleSize: number;
    duration: number;
    designFeatures: string[];
  }): Promise<{
    probability: number;
    confidence: number;
    contributingFactors: Array<{factor: string, impact: number, direction: 'positive' | 'negative'}>
  }> {
    try {
      const { indication, phase, sampleSize, duration, designFeatures } = params;
      
      // Get baseline success rate for the indication and phase
      const reports = await db.select({
        id: csrReports.id,
        status: csrReports.status
      })
      .from(csrReports)
      .where(and(
        eq(csrReports.indication, indication),
        eq(csrReports.phase, phase)
      ));
      
      if (reports.length === 0) {
        return {
          probability: 0.5, // Default without data
          confidence: 0.1,
          contributingFactors: []
        };
      }
      
      // Calculate baseline success rate
      const successfulTrials = reports.filter(r => 
        r.status.toLowerCase() === 'completed' || 
        r.status.toLowerCase() === 'successful'
      ).length;
      
      const baselineSuccessRate = reports.length > 0 ? successfulTrials / reports.length : 0.5;
      
      // Get trial details
      const reportIds = reports.map(r => r.id);
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Calculate adjustment factors based on the provided parameters
      const factors: Array<{factor: string, impact: number, direction: 'positive' | 'negative'}> = [];
      let adjustedProbability = baselineSuccessRate;
      
      // 1. Sample size factor
      const sampleSizes = details
        .filter(d => d.sampleSize !== null && d.sampleSize > 0)
        .map(d => d.sampleSize);
      
      if (sampleSizes.length > 0) {
        const avgSampleSize = math.mean(sampleSizes);
        const sizeRatio = sampleSize / avgSampleSize;
        
        let sampleSizeImpact = 0;
        let direction: 'positive' | 'negative' = 'positive';
        
        if (sizeRatio > 1.5) {
          // Larger sample size increases power
          sampleSizeImpact = Math.min(0.15, (sizeRatio - 1) * 0.1);
          direction = 'positive';
          adjustedProbability += sampleSizeImpact;
        } else if (sizeRatio < 0.7) {
          // Smaller sample size decreases power
          sampleSizeImpact = Math.min(0.15, (1 - sizeRatio) * 0.15);
          direction = 'negative';
          adjustedProbability -= sampleSizeImpact;
        }
        
        if (sampleSizeImpact > 0.01) {
          factors.push({
            factor: 'Sample Size',
            impact: sampleSizeImpact,
            direction
          });
        }
      }
      
      // 2. Duration factor
      const durations = details
        .filter(d => d.studyDuration !== null)
        .map(d => {
          const durationStr = d.studyDuration || '';
          const weekMatch = durationStr.match(/(\d+)\s*week/i);
          const monthMatch = durationStr.match(/(\d+)\s*month/i);
          
          if (weekMatch) {
            return parseInt(weekMatch[1]);
          } else if (monthMatch) {
            return parseInt(monthMatch[1]) * 4.33;
          }
          return null;
        })
        .filter(d => d !== null) as number[];
      
      if (durations.length > 0) {
        const avgDuration = math.mean(durations);
        const durationRatio = duration / avgDuration;
        
        let durationImpact = 0;
        let direction: 'positive' | 'negative' = 'positive';
        
        if (durationRatio < 0.7 && phase !== 'Phase 1') {
          // Shorter duration might miss long-term effects in later phases
          durationImpact = Math.min(0.12, (1 - durationRatio) * 0.15);
          direction = 'negative';
          adjustedProbability -= durationImpact;
        } else if (durationRatio > 1.5) {
          // Longer duration might increase dropout and complexity
          durationImpact = Math.min(0.08, (durationRatio - 1) * 0.05);
          direction = 'negative';
          adjustedProbability -= durationImpact;
        }
        
        if (durationImpact > 0.01) {
          factors.push({
            factor: 'Study Duration',
            impact: durationImpact,
            direction
          });
        }
      }
      
      // 3. Design features impact
      if (designFeatures.length > 0) {
        // Count frequency of each design feature in successful vs. failed trials
        const designStats = new Map<string, {success: number, failure: number}>();
        
        details.forEach(detail => {
          if (!detail.studyDesign) return;
          
          // Check if the report was successful
          const report = reports.find(r => r.id === detail.reportId);
          const isSuccess = report && (
            report.status.toLowerCase() === 'completed' || 
            report.status.toLowerCase() === 'successful'
          );
          
          // Look for design features in study design
          designFeatures.forEach(feature => {
            if (detail.studyDesign.toLowerCase().includes(feature.toLowerCase())) {
              if (!designStats.has(feature)) {
                designStats.set(feature, {success: 0, failure: 0});
              }
              
              const stats = designStats.get(feature)!;
              if (isSuccess) {
                stats.success++;
              } else {
                stats.failure++;
              }
            }
          });
        });
        
        // Calculate impact for each feature
        designStats.forEach((stats, feature) => {
          const total = stats.success + stats.failure;
          if (total < 3) return; // Insufficient data
          
          const featureSuccessRate = stats.success / total;
          const impact = Math.abs(featureSuccessRate - baselineSuccessRate);
          
          if (impact > 0.05) {
            const direction: 'positive' | 'negative' = 
              featureSuccessRate > baselineSuccessRate ? 'positive' : 'negative';
            
            factors.push({
              factor: `Design: ${feature}`,
              impact,
              direction
            });
            
            if (direction === 'positive') {
              adjustedProbability += impact;
            } else {
              adjustedProbability -= impact;
            }
          }
        });
      }
      
      // Ensure probability is between 0 and 1
      adjustedProbability = Math.min(1, Math.max(0, adjustedProbability));
      
      // Calculate confidence level based on available data
      const confidenceLevel = Math.min(0.9, 0.3 + 
        Math.min(0.3, reports.length / 50 * 0.3) + // Data quantity factor
        Math.min(0.3, factors.length / 5 * 0.3) // Factor coverage
      );
      
      return {
        probability: adjustedProbability,
        confidence: confidenceLevel,
        contributingFactors: factors.sort((a, b) => b.impact - a.impact)
      };
    } catch (error) {
      console.error('Error predicting trial success:', error);
      return {
        probability: 0.5,
        confidence: 0.1,
        contributingFactors: []
      };
    }
  }

  /**
   * Perform adaptive design optimization for a trial protocol
   */
  async optimizeTrialDesign(params: {
    indication: string;
    phase: string;
    currentDesign: {
      sampleSize: number;
      arms: number;
      primaryEndpoints: string[];
      duration: number;
      inclusionCriteria: string[];
      biomarkers?: string[];
    };
    optimizationGoal: 'success' | 'cost' | 'time' | 'balance';
    constraints?: {
      maxSampleSize?: number;
      maxDuration?: number;
      requiredEndpoints?: string[];
    };
  }): Promise<{
    originalDesign: any;
    optimizedDesign: any;
    improvements: Array<{factor: string, change: string, impact: number}>;
    expectedSuccessProbability: number;
    confidence: number;
  }> {
    try {
      const { indication, phase, currentDesign, optimizationGoal, constraints } = params;
      
      // Clone original design
      const originalDesign = { ...currentDesign };
      const optimizedDesign = { ...currentDesign };
      
      // Get baseline statistics for the indication and phase
      const reports = await db.select({
        id: csrReports.id,
        status: csrReports.status
      })
      .from(csrReports)
      .where(and(
        eq(csrReports.indication, indication),
        eq(csrReports.phase, phase)
      ));
      
      if (reports.length === 0) {
        return {
          originalDesign,
          optimizedDesign,
          improvements: [],
          expectedSuccessProbability: 0.5,
          confidence: 0.1
        };
      }
      
      const reportIds = reports.map(r => r.id);
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Extract valuable patterns from successful trials
      const successfulTrials = reports.filter(r => 
        r.status.toLowerCase() === 'completed' || 
        r.status.toLowerCase() === 'successful'
      );
      
      const successfulTrialIds = successfulTrials.map(r => r.id);
      const successfulDetails = details.filter(d => successfulTrialIds.includes(d.reportId));
      
      // Sample size optimization
      const successfulSampleSizes = successfulDetails
        .filter(d => d.sampleSize !== null && d.sampleSize > 0)
        .map(d => d.sampleSize);
      
      const allSampleSizes = details
        .filter(d => d.sampleSize !== null && d.sampleSize > 0)
        .map(d => d.sampleSize);
      
      // Duration optimization
      const extractDuration = (d: any): number | null => {
        if (!d.studyDuration) return null;
        
        const durationStr = d.studyDuration;
        const weekMatch = durationStr.match(/(\d+)\s*week/i);
        const monthMatch = durationStr.match(/(\d+)\s*month/i);
        
        if (weekMatch) {
          return parseInt(weekMatch[1]);
        } else if (monthMatch) {
          return parseInt(monthMatch[1]) * 4.33;
        }
        return null;
      };
      
      const successfulDurations = successfulDetails
        .map(extractDuration)
        .filter(d => d !== null) as number[];
      
      const allDurations = details
        .map(extractDuration)
        .filter(d => d !== null) as number[];
      
      // Generate improvements based on optimization goal
      const improvements: Array<{factor: string, change: string, impact: number}> = [];
      
      // Optimize sample size
      if (successfulSampleSizes.length > 0) {
        const optimalSampleSize = math.median(successfulSampleSizes);
        const currentSize = currentDesign.sampleSize;
        
        // Power analysis for optimal sample size
        const effectSize = 0.3; // Moderate effect size assumption
        const optimalPower = this.calculateStatisticalPower(optimalSampleSize, effectSize);
        const currentPower = this.calculateStatisticalPower(currentSize, effectSize);
        
        let newSampleSize = currentSize;
        let sizeChangeImpact = 0;
        
        if (optimizationGoal === 'success' && currentPower < 0.8) {
          // Increase sample size for better power
          newSampleSize = Math.min(
            constraints?.maxSampleSize || 1000,
            this.calculateSampleSize(0.8, effectSize)
          );
          
          sizeChangeImpact = Math.min(0.15, (newSampleSize / currentSize - 1) * 0.2);
          
          if (newSampleSize !== currentSize) {
            improvements.push({
              factor: 'Sample Size',
              change: `Increase from ${currentSize} to ${newSampleSize} participants`,
              impact: sizeChangeImpact
            });
            
            optimizedDesign.sampleSize = newSampleSize;
          }
        } else if (optimizationGoal === 'cost' && currentPower > 0.9) {
          // Decrease sample size to save costs while maintaining adequate power
          newSampleSize = Math.max(
            Math.ceil(this.calculateSampleSize(0.8, effectSize)),
            Math.round(currentSize * 0.8)
          );
          
          sizeChangeImpact = -0.05; // Small negative impact on success
          
          if (newSampleSize < currentSize) {
            improvements.push({
              factor: 'Sample Size',
              change: `Decrease from ${currentSize} to ${newSampleSize} participants to reduce costs while maintaining adequate power`,
              impact: sizeChangeImpact
            });
            
            optimizedDesign.sampleSize = newSampleSize;
          }
        } else if (optimizationGoal === 'balance') {
          // Adjust to optimal based on successful trials
          if (Math.abs(currentSize - optimalSampleSize) / optimalSampleSize > 0.2) {
            newSampleSize = Math.round(
              (currentSize + optimalSampleSize) / 2
            );
            
            sizeChangeImpact = (newSampleSize > currentSize) ? 0.08 : -0.05;
            
            improvements.push({
              factor: 'Sample Size',
              change: `Adjust from ${currentSize} to ${newSampleSize} participants based on successful trials in this indication`,
              impact: sizeChangeImpact
            });
            
            optimizedDesign.sampleSize = newSampleSize;
          }
        }
      }
      
      // Optimize duration
      if (successfulDurations.length > 0) {
        const optimalDuration = math.median(successfulDurations);
        const currentDuration = currentDesign.duration;
        
        let newDuration = currentDuration;
        let durationChangeImpact = 0;
        
        if (optimizationGoal === 'time' && currentDuration > optimalDuration) {
          // Decrease duration to reduce time
          newDuration = Math.max(
            Math.round(optimalDuration * 0.9),
            Math.round(currentDuration * 0.75)
          );
          
          durationChangeImpact = -0.08; // Moderate negative impact
          
          if (newDuration < currentDuration) {
            improvements.push({
              factor: 'Duration',
              change: `Decrease from ${currentDuration} to ${newDuration} weeks to reduce timeline`,
              impact: durationChangeImpact
            });
            
            optimizedDesign.duration = newDuration;
          }
        } else if ((optimizationGoal === 'success' || optimizationGoal === 'balance') && 
                  Math.abs(currentDuration - optimalDuration) / optimalDuration > 0.3) {
          // Adjust to optimal based on successful trials
          newDuration = Math.round(
            (currentDuration + optimalDuration) / 2
          );
          
          durationChangeImpact = (Math.abs(newDuration - optimalDuration) < Math.abs(currentDuration - optimalDuration)) ? 0.07 : -0.05;
          
          improvements.push({
            factor: 'Duration',
            change: `Adjust from ${currentDuration} to ${newDuration} weeks based on successful trials`,
            impact: durationChangeImpact
          });
          
          optimizedDesign.duration = newDuration;
        }
      }
      
      // Endpoint optimization
      if (currentDesign.primaryEndpoints.length > 0) {
        // Analyze endpoint success patterns
        const endpointSuccessMap = new Map<string, {success: number, total: number}>();
        
        details.forEach(detail => {
          if (!detail.endpoints) return;
          
          // Check if trial was successful
          const report = reports.find(r => r.id === detail.reportId);
          const isSuccess = report && (
            report.status.toLowerCase() === 'completed' || 
            report.status.toLowerCase() === 'successful'
          );
          
          try {
            let endpoints: string[] = [];
            
            if (typeof detail.endpoints === 'string') {
              // Try to extract endpoints from string
              const endpointLines = detail.endpoints.split('\n')
                .filter(line => 
                  line.includes('endpoint') || 
                  line.includes('outcome') || 
                  line.includes('measure')
                )
                .map(line => line.trim());
              
              endpoints = endpointLines;
            } else if (Array.isArray(detail.endpoints)) {
              endpoints = detail.endpoints.map(e => 
                typeof e === 'string' ? e : (e.name || e.description || '')
              ).filter(Boolean);
            } else if (detail.endpoints && typeof detail.endpoints === 'object') {
              const endpointObj = detail.endpoints as any;
              
              if (endpointObj.primary) {
                if (Array.isArray(endpointObj.primary)) {
                  endpoints = [...endpoints, ...endpointObj.primary.map(e => 
                    typeof e === 'string' ? e : (e.name || e.description || '')
                  ).filter(Boolean)];
                } else {
                  endpoints.push(endpointObj.primary);
                }
              }
              
              if (endpointObj.secondary) {
                if (Array.isArray(endpointObj.secondary)) {
                  endpoints = [...endpoints, ...endpointObj.secondary.map(e => 
                    typeof e === 'string' ? e : (e.name || e.description || '')
                  ).filter(Boolean)];
                } else {
                  endpoints.push(endpointObj.secondary);
                }
              }
            }
            
            // Update success stats for each endpoint
            endpoints.forEach(endpoint => {
              const normalizedEndpoint = endpoint
                .toLowerCase()
                .replace(/primary endpoint:?/i, '')
                .replace(/secondary endpoint:?/i, '')
                .trim();
              
              if (!endpointSuccessMap.has(normalizedEndpoint)) {
                endpointSuccessMap.set(normalizedEndpoint, {success: 0, total: 0});
              }
              
              const stats = endpointSuccessMap.get(normalizedEndpoint)!;
              stats.total++;
              
              if (isSuccess) {
                stats.success++;
              }
            });
          } catch (error) {
            console.error('Error processing endpoints for optimization:', error);
          }
        });
        
        // Find high-success endpoints not in current design
        const highSuccessEndpoints = Array.from(endpointSuccessMap.entries())
          .filter(([_, stats]) => stats.total >= 3 && stats.success / stats.total > 0.7)
          .map(([endpoint, stats]) => ({
            endpoint,
            successRate: stats.success / stats.total,
            count: stats.total
          }))
          .sort((a, b) => b.successRate - a.successRate);
        
        // Check current endpoints against successful patterns
        const currentEndpoints = currentDesign.primaryEndpoints.map(e => e.toLowerCase());
        const recommendedEndpoints: string[] = [];
        
        // Find valuable endpoints to add
        for (const { endpoint, successRate } of highSuccessEndpoints) {
          if (!currentEndpoints.some(e => e.includes(endpoint) || endpoint.includes(e))) {
            recommendedEndpoints.push(endpoint);
            if (recommendedEndpoints.length >= 2) break;
          }
        }
        
        if (recommendedEndpoints.length > 0 && 
            (optimizationGoal === 'success' || optimizationGoal === 'balance')) {
          // Add successful endpoints recommendation
          const formattedEndpoints = recommendedEndpoints
            .map(e => e.charAt(0).toUpperCase() + e.slice(1))
            .join(' and ');
          
          improvements.push({
            factor: 'Endpoints',
            change: `Consider adding ${formattedEndpoints} as endpoint(s), which showed higher success rates in similar trials`,
            impact: 0.12
          });
          
          // Add to optimized design
          optimizedDesign.primaryEndpoints = [
            ...currentDesign.primaryEndpoints,
            ...recommendedEndpoints
          ];
        }
      }
      
      // Calculate expected success probability
      let successProbabilityChange = improvements.reduce(
        (sum, improvement) => sum + improvement.impact, 
        0
      );
      
      // Get baseline success rate
      const baselineSuccessRate = successfulTrials.length / reports.length;
      
      // Adjusted probability with improvement impacts
      const adjustedProbability = Math.min(0.95, Math.max(0.05, 
        baselineSuccessRate + successProbabilityChange
      ));
      
      // Calculate confidence level
      const confidence = Math.min(0.9, 0.4 + 
        Math.min(0.3, reports.length / 30 * 0.3) + // Data quantity
        Math.min(0.2, (improvements.length / 3) * 0.2) // Coverage of improvements
      );
      
      return {
        originalDesign,
        optimizedDesign,
        improvements,
        expectedSuccessProbability: adjustedProbability,
        confidence
      };
    } catch (error) {
      console.error('Error optimizing trial design:', error);
      return {
        originalDesign: params.currentDesign,
        optimizedDesign: params.currentDesign,
        improvements: [],
        expectedSuccessProbability: 0.5,
        confidence: 0.1
      };
    }
  }

  /**
   * Perform meta-analysis across multiple trials
   */
  async performMetaAnalysis(params: {
    indications?: string[];
    phases?: string[];
    startDate?: string;
    endDate?: string;
    analysisType: 'efficacy' | 'safety' | 'biomarkers';
    specificEndpoint?: string;
  }): Promise<any> {
    try {
      // Build query conditions
      const conditions: any[] = [];
      
      if (params.indications && params.indications.length > 0) {
        conditions.push(sql`${csrReports.indication} IN (${params.indications.join(',')})`);
      }
      
      if (params.phases && params.phases.length > 0) {
        conditions.push(sql`${csrReports.phase} IN (${params.phases.join(',')})`);
      }
      
      if (params.startDate) {
        conditions.push(sql`${csrReports.date} >= ${params.startDate}`);
      }
      
      if (params.endDate) {
        conditions.push(sql`${csrReports.date} <= ${params.endDate}`);
      }
      
      // Get relevant reports
      const reports = await db.select({
        id: csrReports.id,
        indication: csrReports.indication,
        phase: csrReports.phase,
        status: csrReports.status,
        date: csrReports.date
      })
      .from(csrReports)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      if (reports.length === 0) {
        return {
          analysisType: params.analysisType,
          totalTrials: 0,
          message: 'No trials found matching the criteria'
        };
      }
      
      const reportIds = reports.map(r => r.id);
      
      // Get details for all reports
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Meta-analysis results depend on analysis type
      switch (params.analysisType) {
        case 'efficacy':
          return this.performEfficacyMetaAnalysis(reports, details, params.specificEndpoint);
          
        case 'safety':
          return this.performSafetyMetaAnalysis(reports, details);
          
        case 'biomarkers':
          return this.performBiomarkerMetaAnalysis(reports, details);
          
        default:
          return {
            analysisType: params.analysisType,
            totalTrials: reports.length,
            message: 'Unsupported analysis type'
          };
      }
    } catch (error) {
      console.error('Error performing meta-analysis:', error);
      return {
        analysisType: params.analysisType,
        totalTrials: 0,
        error: 'Failed to perform meta-analysis'
      };
    }
  }

  /**
   * Meta-analysis specifically for efficacy endpoints
   */
  private performEfficacyMetaAnalysis(reports: any[], details: any[], specificEndpoint?: string): any {
    // Extract and normalize endpoints
    const endpointResults: Map<string, Array<{
      reportId: number,
      result: number | null,
      sampleSize: number | null,
      variance: number | null,
      weight: number | null
    }>> = new Map();
    
    details.forEach(detail => {
      if (!detail.results || !detail.reportId) return;
      
      try {
        let resultsData: any = {};
        
        if (typeof detail.results === 'string') {
          try {
            resultsData = JSON.parse(detail.results);
          } catch {
            // Not valid JSON, try to extract from text
            const lines = detail.results.split('\n');
            
            // Simple extraction - this could be enhanced
            lines.forEach(line => {
              const matches = line.match(/([^:]+):\s*([^%]+)%?/);
              if (matches && matches.length === 3) {
                const endpoint = matches[1].trim();
                const result = parseFloat(matches[2].trim());
                
                if (!isNaN(result)) {
                  resultsData[endpoint] = result;
                }
              }
            });
          }
        } else if (typeof detail.results === 'object' && detail.results !== null) {
          resultsData = detail.results;
        }
        
        // Extract results
        Object.entries(resultsData).forEach(([endpoint, value]) => {
          let normalizedEndpoint = endpoint.toLowerCase()
            .replace(/primary endpoint:?/i, '')
            .replace(/secondary endpoint:?/i, '')
            .trim();
          
          // Skip if we're looking for a specific endpoint and this isn't it
          if (specificEndpoint && !normalizedEndpoint.includes(specificEndpoint.toLowerCase())) {
            return;
          }
          
          let numericResult: number | null = null;
          
          // Extract numeric result
          if (typeof value === 'number') {
            numericResult = value;
          } else if (typeof value === 'string') {
            const match = value.match(/(\d+(\.\d+)?)/);
            if (match) {
              numericResult = parseFloat(match[1]);
            }
          } else if (value && typeof value === 'object' && 'value' in value) {
            if (typeof value.value === 'number') {
              numericResult = value.value;
            } else if (typeof value.value === 'string') {
              const match = value.value.match(/(\d+(\.\d+)?)/);
              if (match) {
                numericResult = parseFloat(match[1]);
              }
            }
          }
          
          if (numericResult === null) return;
          
          // Create or update endpoint entry
          if (!endpointResults.has(normalizedEndpoint)) {
            endpointResults.set(normalizedEndpoint, []);
          }
          
          // Add result
          endpointResults.get(normalizedEndpoint)!.push({
            reportId: detail.reportId,
            result: numericResult,
            sampleSize: detail.sampleSize,
            variance: null, // Will calculate later if possible
            weight: null // Will calculate later
          });
        });
      } catch (error) {
        console.error('Error processing results for meta-analysis:', error);
      }
    });
    
    // Prepare meta-analysis results
    const metaAnalysisResults: any[] = [];
    
    endpointResults.forEach((results, endpoint) => {
      // Need at least 3 trials for meaningful meta-analysis
      if (results.length < 3) return;
      
      // Calculate variance for each result if sample size is available
      results.forEach(result => {
        if (result.result !== null && result.sampleSize !== null && result.sampleSize > 0) {
          // Approximate variance based on sample size and result magnitude
          result.variance = Math.pow(result.result * 0.2, 2) / result.sampleSize;
        }
      });
      
      // Filter results with valid variance
      const validResults = results.filter(r => 
        r.result !== null && r.variance !== null && r.variance > 0
      );
      
      if (validResults.length < 3) return;
      
      // Calculate weights (inverse variance weighting)
      validResults.forEach(result => {
        result.weight = 1 / (result.variance || 1);
      });
      
      // Calculate weighted mean
      const totalWeight = validResults.reduce((sum, r) => sum + (r.weight || 0), 0);
      const weightedSum = validResults.reduce((sum, r) => sum + (r.result || 0) * (r.weight || 0), 0);
      const weightedMean = totalWeight > 0 ? weightedSum / totalWeight : null;
      
      // Calculate confidence interval
      const sePooled = totalWeight > 0 ? Math.sqrt(1 / totalWeight) : null;
      let lowerCI = null, upperCI = null;
      
      if (weightedMean !== null && sePooled !== null) {
        lowerCI = weightedMean - 1.96 * sePooled;
        upperCI = weightedMean + 1.96 * sePooled;
      }
      
      // Calculate heterogeneity (I-squared)
      let heterogeneity = null;
      if (validResults.length > 1 && weightedMean !== null) {
        const q = validResults.reduce((sum, r) => 
          sum + Math.pow((r.result || 0) - weightedMean, 2) / (r.variance || 1), 
          0
        );
        
        const df = validResults.length - 1;
        heterogeneity = Math.max(0, (q - df) / q * 100);
      }
      
      // Add to meta-analysis results
      metaAnalysisResults.push({
        endpoint,
        trialCount: validResults.length,
        weightedMean,
        confidenceInterval: lowerCI !== null && upperCI !== null ? [lowerCI, upperCI] : null,
        heterogeneity,
        individualResults: validResults.map(r => ({
          value: r.result,
          sampleSize: r.sampleSize,
          weight: r.weight ? r.weight / totalWeight : null
        }))
      });
    });
    
    // Sort by number of trials
    metaAnalysisResults.sort((a, b) => b.trialCount - a.trialCount);
    
    return {
      analysisType: 'efficacy',
      totalTrials: reports.length,
      analysisDate: new Date().toISOString(),
      metaAnalysisResults
    };
  }

  /**
   * Meta-analysis specifically for safety endpoints
   */
  private performSafetyMetaAnalysis(reports: any[], details: any[]): any {
    // Extract adverse events data
    const aeData: Map<string, Array<{
      reportId: number,
      count: number,
      percentage: number,
      sampleSize: number | null,
    }>> = new Map();
    
    details.forEach(detail => {
      if (!detail.adverseEvents || !detail.reportId) return;
      
      try {
        let aeList: any[] = [];
        
        if (typeof detail.adverseEvents === 'string') {
          try {
            aeList = JSON.parse(detail.adverseEvents);
          } catch {
            // Not valid JSON, try to extract from text
            const lines = detail.adverseEvents.split('\n');
            
            lines.forEach(line => {
              const matches = line.match(/([^:]+):\s*(\d+)\s*\((\d+(\.\d+)?)%\)/);
              if (matches && matches.length >= 4) {
                const aeName = matches[1].trim();
                const count = parseInt(matches[2], 10);
                const percentage = parseFloat(matches[3]);
                
                if (!isNaN(count) && !isNaN(percentage)) {
                  aeList.push({
                    name: aeName,
                    count,
                    percentage
                  });
                }
              }
            });
          }
        } else if (Array.isArray(detail.adverseEvents)) {
          aeList = detail.adverseEvents;
        }
        
        // Process each adverse event
        aeList.forEach(ae => {
          if (!ae) return;
          
          let aeName = '';
          let count = 0;
          let percentage = 0;
          
          if (typeof ae === 'string') {
            aeName = ae;
            count = 1;
            percentage = -1; // Unknown
          } else if (ae && typeof ae === 'object') {
            aeName = ae.name || ae.term || ae.description || '';
            count = ae.count || ae.n || 0;
            percentage = ae.percentage || ae.percent || ae.rate || -1;
          }
          
          if (!aeName) return;
          
          // Normalize AE name
          const normalizedAE = aeName.toLowerCase().trim();
          
          // Create or update AE entry
          if (!aeData.has(normalizedAE)) {
            aeData.set(normalizedAE, []);
          }
          
          // Add entry
          aeData.get(normalizedAE)!.push({
            reportId: detail.reportId,
            count,
            percentage,
            sampleSize: detail.sampleSize
          });
        });
      } catch (error) {
        console.error('Error processing adverse events for meta-analysis:', error);
      }
    });
    
    // Prepare safety meta-analysis results
    const safetyAnalysisResults: any[] = [];
    
    aeData.forEach((events, aeName) => {
      // Need at least 3 trials for meaningful meta-analysis
      if (events.length < 3) return;
      
      // Calculate pooled rate
      const validEvents = events.filter(e => 
        e.percentage >= 0 && e.sampleSize && e.sampleSize > 0
      );
      
      if (validEvents.length < 3) return;
      
      // Calculate total events and total patients
      const totalEvents = validEvents.reduce((sum, e) => sum + e.count, 0);
      const totalPatients = validEvents.reduce((sum, e) => sum + (e.sampleSize || 0), 0);
      
      // Calculate pooled rate and 95% CI
      const pooledRate = totalPatients > 0 ? totalEvents / totalPatients : null;
      
      let lowerCI = null, upperCI = null;
      
      if (pooledRate !== null && totalPatients > 0) {
        // Wilson score interval for binomial proportion
        const z = 1.96;
        const p = pooledRate;
        const n = totalPatients;
        
        const denominator = 1 + z*z/n;
        const center = p + z*z/(2*n);
        const margin = z * Math.sqrt(p*(1-p)/n + z*z/(4*n*n));
        
        lowerCI = Math.max(0, (center - margin) / denominator);
        upperCI = Math.min(1, (center + margin) / denominator);
      }
      
      // Calculate heterogeneity
      let heterogeneity = null;
      if (validEvents.length > 1 && pooledRate !== null) {
        const expectedEvents = validEvents.map(e => 
          (e.sampleSize || 0) * pooledRate
        );
        
        const observedEvents = validEvents.map(e => e.count);
        
        // Calculate chi-squared statistic
        let chiSquared = 0;
        for (let i = 0; i < validEvents.length; i++) {
          const o = observedEvents[i];
          const e = expectedEvents[i];
          
          if (e > 0) {
            chiSquared += Math.pow(o - e, 2) / e;
          }
        }
        
        const df = validEvents.length - 1;
        heterogeneity = Math.max(0, (chiSquared - df) / chiSquared * 100);
      }
      
      // Add to safety analysis results
      safetyAnalysisResults.push({
        adverseEvent: aeName,
        trialCount: validEvents.length,
        pooledIncidence: pooledRate !== null ? pooledRate * 100 : null, // Convert to percentage
        confidenceInterval: lowerCI !== null && upperCI !== null ? [lowerCI * 100, upperCI * 100] : null,
        heterogeneity,
        totalEvents,
        totalPatients,
        individualResults: validEvents.map(e => ({
          count: e.count,
          incidence: e.percentage >= 0 ? e.percentage : (e.sampleSize && e.sampleSize > 0 ? e.count / e.sampleSize * 100 : null),
          sampleSize: e.sampleSize
        }))
      });
    });
    
    // Sort by pooled incidence (highest first)
    safetyAnalysisResults.sort((a, b) => 
      (b.pooledIncidence || 0) - (a.pooledIncidence || 0)
    );
    
    return {
      analysisType: 'safety',
      totalTrials: reports.length,
      analysisDate: new Date().toISOString(),
      safetyAnalysisResults
    };
  }

  /**
   * Meta-analysis specifically for biomarkers
   */
  private performBiomarkerMetaAnalysis(reports: any[], details: any[]): any {
    // This is a simplified implementation - a complete one would require
    // more structured biomarker data than typically available in CSRs
    
    // Extract biomarkers and their relationship to outcomes
    const biomarkerData = new Map<string, Array<{
      reportId: number,
      association: 'positive' | 'negative' | 'neutral',
      significance: number | null, // p-value if available
      magnitude: number | null, // effect size if available
      confidenceLevel: 'high' | 'medium' | 'low'
    }>>();
    
    details.forEach(detail => {
      if (!detail.results || !detail.reportId) return;
      
      // Get report status (success/failure)
      const report = reports.find(r => r.id === detail.reportId);
      const isSuccess = report && (
        report.status.toLowerCase() === 'completed' || 
        report.status.toLowerCase() === 'successful'
      );
      
      try {
        // Extract biomarkers from various fields
        let biomarkers: string[] = [];
        
        // Look in exclusion/inclusion criteria
        if (detail.inclusionCriteria) {
          const text = typeof detail.inclusionCriteria === 'string' 
            ? detail.inclusionCriteria 
            : JSON.stringify(detail.inclusionCriteria);
          
          // Look for biomarker-related terms
          const biomarkerMatches = text.match(/biomarker|gene|receptor|mutation|expression|marker|cd\d+|her2|egfr|braf|pd-l1|pd-1/gi);
          
          if (biomarkerMatches) {
            biomarkers = [...biomarkers, ...biomarkerMatches];
          }
        }
        
        // Look in results
        if (detail.results) {
          const resultsText = typeof detail.results === 'string'
            ? detail.results
            : JSON.stringify(detail.results);
          
          // Look for biomarker-related terms with p-values
          const biomarkerResultMatches = resultsText.match(/(\w+[\w\s-]+)\s*[,:]?\s*p\s*[=<>]\s*0\.\d+/gi);
          
          if (biomarkerResultMatches) {
            biomarkers = [...biomarkers, ...biomarkerResultMatches];
          }
        }
        
        // Normalize and deduplicate biomarkers
        const normalizedBiomarkers = [...new Set(
          biomarkers.map(b => b.toLowerCase().trim())
        )];
        
        // Add to biomarker data (with simple heuristic for association)
        normalizedBiomarkers.forEach(biomarker => {
          if (!biomarkerData.has(biomarker)) {
            biomarkerData.set(biomarker, []);
          }
          
          // Extract p-value if available
          let pValue = null;
          const pValueMatch = biomarker.match(/p\s*[=<>]\s*(0\.\d+)/i);
          if (pValueMatch) {
            pValue = parseFloat(pValueMatch[1]);
          }
          
          // Determine association (simplified)
          let association: 'positive' | 'negative' | 'neutral' = 'neutral';
          if (biomarker.includes('significant') || biomarker.includes('correlated') || biomarker.includes('associated')) {
            association = isSuccess ? 'positive' : 'negative';
          }
          
          // Estimate confidence level
          let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
          if (pValue !== null) {
            if (pValue < 0.01) confidenceLevel = 'high';
            else if (pValue < 0.05) confidenceLevel = 'medium';
          }
          
          biomarkerData.get(biomarker)!.push({
            reportId: detail.reportId,
            association,
            significance: pValue,
            magnitude: null, // Not enough info to determine
            confidenceLevel
          });
        });
      } catch (error) {
        console.error('Error processing biomarkers for meta-analysis:', error);
      }
    });
    
    // Prepare biomarker meta-analysis results
    const biomarkerAnalysisResults: any[] = [];
    
    biomarkerData.forEach((data, biomarker) => {
      // Need at least 2 trials for biomarker analysis
      if (data.length < 2) return;
      
      // Count associations
      const associations = {
        positive: data.filter(d => d.association === 'positive').length,
        negative: data.filter(d => d.association === 'negative').length,
        neutral: data.filter(d => d.association === 'neutral').length
      };
      
      // Determine consensus 
      let consensus: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
      const total = associations.positive + associations.negative + associations.neutral;
      
      if (associations.positive > total * 0.6) {
        consensus = 'positive';
      } else if (associations.negative > total * 0.6) {
        consensus = 'negative';
      } else if (associations.positive + associations.negative > associations.neutral) {
        consensus = 'mixed';
      }
      
      // Estimate overall confidence
      const confidenceCounts = {
        high: data.filter(d => d.confidenceLevel === 'high').length,
        medium: data.filter(d => d.confidenceLevel === 'medium').length,
        low: data.filter(d => d.confidenceLevel === 'low').length
      };
      
      let overallConfidence: 'high' | 'medium' | 'low' = 'low';
      
      if (confidenceCounts.high > total * 0.4) {
        overallConfidence = 'high';
      } else if (confidenceCounts.high + confidenceCounts.medium > total * 0.6) {
        overallConfidence = 'medium';
      }
      
      // Add to analysis results
      biomarkerAnalysisResults.push({
        biomarker,
        trialCount: data.length,
        consensus,
        associations,
        overallConfidence,
        significantFindings: data.filter(d => d.significance !== null && d.significance < 0.05).length
      });
    });
    
    // Sort by number of trials and then by significance
    biomarkerAnalysisResults.sort((a, b) => {
      if (b.trialCount !== a.trialCount) {
        return b.trialCount - a.trialCount;
      }
      return b.significantFindings - a.significantFindings;
    });
    
    return {
      analysisType: 'biomarkers',
      totalTrials: reports.length,
      analysisDate: new Date().toISOString(),
      biomarkerAnalysisResults: biomarkerAnalysisResults.slice(0, 20) // Limit to top 20
    };
  }
  
  /**
   * Get competitive analysis comparing success rates and trial designs
   */
  async getCompetitiveAnalysis(params: {
    indication: string;
    phase: string;
    sponsorFilter?: string[];
  }): Promise<any> {
    try {
      const { indication, phase, sponsorFilter } = params;
      
      // Build query conditions
      const conditions = [
        eq(csrReports.indication, indication),
        eq(csrReports.phase, phase)
      ];
      
      if (sponsorFilter && sponsorFilter.length > 0) {
        conditions.push(sql`${csrReports.sponsor} IN (${sponsorFilter.join(',')})`);
      }
      
      // Get all relevant reports
      const reports = await db.select({
        id: csrReports.id,
        title: csrReports.title,
        sponsor: csrReports.sponsor,
        status: csrReports.status,
        date: csrReports.date
      })
      .from(csrReports)
      .where(and(...conditions));
      
      if (reports.length === 0) {
        return {
          indication,
          phase,
          totalTrials: 0,
          message: 'No trials found matching the criteria'
        };
      }
      
      const reportIds = reports.map(r => r.id);
      
      // Get details for all reports
      const details = await db.select()
        .from(csrDetails)
        .where(sql`${csrDetails.reportId} IN (${reportIds.join(',')})`);
      
      // Group reports by sponsor
      const sponsorGroups = new Map<string, {
        reports: typeof reports,
        details: typeof details
      }>();
      
      // Initialize with all sponsors
      const sponsors = [...new Set(reports.map(r => r.sponsor))];
      
      sponsors.forEach(sponsor => {
        sponsorGroups.set(sponsor, {
          reports: reports.filter(r => r.sponsor === sponsor),
          details: []
        });
      });
      
      // Add details to sponsor groups
      details.forEach(detail => {
        const report = reports.find(r => r.id === detail.reportId);
        if (report) {
          const sponsor = report.sponsor;
          sponsorGroups.get(sponsor)!.details.push(detail);
        }
      });
      
      // Calculate competitive metrics for each sponsor
      const competitiveAnalysis = Array.from(sponsorGroups.entries()).map(([sponsor, data]) => {
        const sponsorReports = data.reports;
        const sponsorDetails = data.details;
        
        // Calculate success rate
        const successfulTrials = sponsorReports.filter(r => 
          r.status.toLowerCase() === 'completed' || 
          r.status.toLowerCase() === 'successful'
        ).length;
        
        const successRate = sponsorReports.length > 0 ? successfulTrials / sponsorReports.length : 0;
        
        // Calculate average sample size
        const sampleSizes = sponsorDetails
          .filter(d => d.sampleSize !== null && d.sampleSize > 0)
          .map(d => d.sampleSize);
        
        const avgSampleSize = sampleSizes.length > 0 
          ? sampleSizes.reduce((sum, size) => sum + size, 0) / sampleSizes.length 
          : null;
        
        // Calculate median duration in weeks
        const durations = sponsorDetails
          .filter(d => d.studyDuration !== null)
          .map(d => {
            const durationStr = d.studyDuration || '';
            const weekMatch = durationStr.match(/(\d+)\s*week/i);
            const monthMatch = durationStr.match(/(\d+)\s*month/i);
            
            if (weekMatch) {
              return parseInt(weekMatch[1]);
            } else if (monthMatch) {
              return parseInt(monthMatch[1]) * 4.33;
            }
            return null;
          })
          .filter(d => d !== null) as number[];
        
        const avgDuration = durations.length > 0 
          ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length 
          : null;
        
        // Extract common endpoints
        const endpointCounts: Record<string, number> = {};
        
        sponsorDetails.forEach(detail => {
          if (!detail.endpoints) return;
          
          try {
            let endpoints: string[] = [];
            
            if (typeof detail.endpoints === 'string') {
              // Try to extract from text
              const endpointLines = detail.endpoints.split('\n')
                .filter(line => 
                  line.includes('endpoint') || 
                  line.includes('outcome') || 
                  line.includes('measure')
                )
                .map(line => line.trim());
              
              endpoints = endpointLines;
            } else if (Array.isArray(detail.endpoints)) {
              endpoints = detail.endpoints;
            } else if (detail.endpoints && typeof detail.endpoints === 'object') {
              const endpointObj = detail.endpoints as any;
              
              if (endpointObj.primary) {
                if (Array.isArray(endpointObj.primary)) {
                  endpoints = [...endpoints, ...endpointObj.primary];
                } else {
                  endpoints.push(endpointObj.primary);
                }
              }
            }
            
            // Count each endpoint
            endpoints.forEach(endpoint => {
              let endpointName = '';
              
              if (typeof endpoint === 'string') {
                endpointName = endpoint;
              } else if (endpoint && endpoint.name) {
                endpointName = endpoint.name;
              } else if (endpoint && endpoint.description) {
                endpointName = endpoint.description;
              }
              
              if (endpointName) {
                const normalizedName = endpointName
                  .toLowerCase()
                  .replace(/primary endpoint:?/i, '')
                  .replace(/secondary endpoint:?/i, '')
                  .trim();
                
                endpointCounts[normalizedName] = (endpointCounts[normalizedName] || 0) + 1;
              }
            });
          } catch (error) {
            console.error('Error processing endpoints for competitive analysis:', error);
          }
        });
        
        // Get top endpoints
        const commonEndpoints = Object.entries(endpointCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, count]) => ({
            name,
            count,
            percentage: sponsorDetails.length > 0 ? count / sponsorDetails.length * 100 : 0
          }));
        
        // Calculate competitive index (simplified scoring)
        let competitiveIndex = 50; // Start with neutral score
        
        // Adjust based on success rate (up to +/- 20 points)
        const avgSuccessRate = reports.filter(r => 
          r.status.toLowerCase() === 'completed' || 
          r.status.toLowerCase() === 'successful'
        ).length / reports.length;
        
        competitiveIndex += (successRate - avgSuccessRate) * 100;
        
        // Adjust based on sample size efficiency (up to +/- 15 points)
        if (avgSampleSize !== null && sampleSizes.length > 0) {
          const allSampleSizes = details
            .filter(d => d.sampleSize !== null && d.sampleSize > 0)
            .map(d => d.sampleSize);
          
          const totalAvgSampleSize = allSampleSizes.reduce((sum, size) => sum + size, 0) / allSampleSizes.length;
          
          // Reward efficiency (smaller samples with similar success rates)
          if (successRate >= avgSuccessRate && avgSampleSize < totalAvgSampleSize) {
            competitiveIndex += 15 * (1 - avgSampleSize / totalAvgSampleSize);
          } else if (successRate < avgSuccessRate && avgSampleSize > totalAvgSampleSize) {
            competitiveIndex -= 15 * (avgSampleSize / totalAvgSampleSize - 1);
          }
        }
        
        // Adjust based on trial duration (up to +/- 15 points)
        if (avgDuration !== null && durations.length > 0) {
          const allDurations = details
            .filter(d => d.studyDuration !== null)
            .map(d => {
              const durationStr = d.studyDuration || '';
              const weekMatch = durationStr.match(/(\d+)\s*week/i);
              const monthMatch = durationStr.match(/(\d+)\s*month/i);
              
              if (weekMatch) {
                return parseInt(weekMatch[1]);
              } else if (monthMatch) {
                return parseInt(monthMatch[1]) * 4.33;
              }
              return null;
            })
            .filter(d => d !== null) as number[];
          
          const totalAvgDuration = allDurations.reduce((sum, dur) => sum + dur, 0) / allDurations.length;
          
          // Reward efficiency (shorter duration with similar success rates)
          if (successRate >= avgSuccessRate && avgDuration < totalAvgDuration) {
            competitiveIndex += 15 * (1 - avgDuration / totalAvgDuration);
          } else if (successRate < avgSuccessRate && avgDuration > totalAvgDuration) {
            competitiveIndex -= 15 * (avgDuration / totalAvgDuration - 1);
          }
        }
        
        return {
          sponsor,
          trialCount: sponsorReports.length,
          successRate,
          avgSampleSize,
          avgDurationWeeks: avgDuration,
          commonEndpoints,
          latestTrialDate: sponsorReports.length > 0 
            ? new Date(Math.max(...sponsorReports.filter(r => r.date).map(r => new Date(r.date || 0).getTime()))).toISOString()
            : null,
          competitiveIndex: Math.min(100, Math.max(0, Math.round(competitiveIndex)))
        };
      });
      
      // Sort by competitive index (highest first)
      competitiveAnalysis.sort((a, b) => b.competitiveIndex - a.competitiveIndex);
      
      return {
        indication,
        phase,
        totalTrials: reports.length,
        analysisDate: new Date().toISOString(),
        competitiveAnalysis
      };
    } catch (error) {
      console.error('Error performing competitive analysis:', error);
      return {
        indication: params.indication,
        phase: params.phase,
        totalTrials: 0,
        error: 'Failed to perform competitive analysis'
      };
    }
  }
}

export const statisticsService = new StatisticsService();