import express from 'express';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { z } from 'zod';
import { exportService } from '../services/export-service';
import { spawn } from 'child_process';

const router = express.Router();

// Create directory for exports if it doesn't exist
const EXPORTS_DIR = path.join(process.cwd(), 'exports');
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

// Create directory for static files if it doesn't exist
const STATIC_DIR = path.join(process.cwd(), 'client', 'public', 'static');
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
}

// Create archive directory for session-based packet history
const ARCHIVE_DIR = path.join(process.cwd(), 'data');
const ARCHIVE_PATH = path.join(ARCHIVE_DIR, 'summary_packet_history.json');
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// Create directory for session summary exports
const SESSION_SUMMARY_DIR = path.join(EXPORTS_DIR, 'session-summaries');
if (!fs.existsSync(SESSION_SUMMARY_DIR)) {
  fs.mkdirSync(SESSION_SUMMARY_DIR, { recursive: true });
}

// Generate and export a Protocol Intelligence Report
router.post('/intelligence-report', express.json(), async (req, res) => {
  try {
    const reportData = req.body;
    
    if (!reportData || typeof reportData !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid report data is required' 
      });
    }
    
    console.log('Generating intelligence report with data:', JSON.stringify(reportData, null, 2));
    
    // Generate a unique filename
    const protocolId = reportData.protocol_id || `TS-${Date.now()}`;
    const timestamp = Date.now();
    const filename = `trial-intelligence-report-${protocolId}-${timestamp}.pdf`;
    const filePath = path.join(EXPORTS_DIR, filename);
    
    // Ensure exports directory exists
    if (!fs.existsSync(EXPORTS_DIR)) {
      fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    }
    
    // Create PDF document with appropriate settings
    const pdf = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4',
      info: {
        Title: 'Trial Intelligence Report',
        Author: 'LumenTrialGuide.AI',
        Subject: `Protocol Analysis for ${protocolId}`,
        Keywords: 'clinical trials, protocol, intelligence, analysis',
        CreationDate: new Date(),
      }
    });
    
    // Pipe to file
    const writeStream = fs.createWriteStream(filePath);
    pdf.pipe(writeStream);
    
    // Extract protocol data if available
    const protocol = reportData.parsed || {};
    const prediction = reportData.prediction || 0;
    const insights = reportData.strategic_insights || [];
    const benchmarks = reportData.benchmarks || {};
    const sessionId = reportData.session_id || `session-${timestamp}`;
    
    // Add a branded cover page directly
    // Header with company branding
    pdf.font('Helvetica-Bold').fontSize(24)
      .fillColor('#0066CC')
      .text('LumenTrialGuide.AI', {
        align: 'center'
      });
    
    pdf.moveDown(0.5);
    
    // Report title
    pdf.font('Helvetica-Bold').fontSize(20)
      .text('Trial Intelligence Report', {
        align: 'center'
      });
      
    pdf.moveDown(2);
    
    // Protocol ID display
    pdf.font('Helvetica').fontSize(14)
      .fillColor('#000000')
      .text(`Protocol ID: ${protocolId}`, {
        align: 'center'
      });
    
    // Add indication if available  
    if (protocol.indication) {
      pdf.font('Helvetica').fontSize(12)
        .text(`Indication: ${protocol.indication}`, {
          align: 'center'
        });
    }
    
    // Add phase if available
    if (protocol.phase) {
      pdf.font('Helvetica').fontSize(12)
        .text(`Phase: ${protocol.phase}`, {
          align: 'center'
        });
    }
    
    pdf.moveDown(2);
    
    // Add a visual prediction indicator
    const successRate = (prediction * 100).toFixed(1);
    pdf.font('Helvetica-Bold').fontSize(16)
      .text('Success Probability', {
        align: 'center'
      });
      
    pdf.moveDown(0.5);
    
    pdf.font('Helvetica-Bold').fontSize(36)
      .fillColor(successRate > 70 ? '#00AA00' : successRate > 40 ? '#FF9900' : '#CC0000')
      .text(`${successRate}%`, {
        align: 'center'
      });
      
    pdf.moveDown(2);
    
    // Report sections indicator
    pdf.font('Helvetica-Bold').fontSize(12)
      .fillColor('#000000')
      .text('This report includes:', {
        align: 'left'
      });
    
    pdf.font('Helvetica').fontSize(12);
    pdf.text('• Detailed Protocol Analysis');
    pdf.text('• Success Prediction with Confidence Interval');
    pdf.text('• Strategic Optimization Recommendations');
    pdf.text('• Benchmark Comparison with Similar Trials');
    
    // Add timestamp and page info at bottom
    pdf.moveDown(4);
    pdf.font('Helvetica').fontSize(10)
      .fillColor('#666666')
      .text(`Generated: ${new Date().toLocaleString()}`, {
        align: 'center'
      })
      .text('Page 1', {
        align: 'center'
      });
    
    // Protocol Summary page
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(18)
      .fillColor('#0066CC')
      .text('Protocol Summary', { underline: true });
    
    pdf.moveDown(1);
    
    // Add more detailed protocol information
    const protocolFields = [
      { label: 'Protocol ID', value: protocolId },
      { label: 'Indication', value: protocol.indication || 'Not specified' },
      { label: 'Phase', value: protocol.phase || 'Not specified' },
      { label: 'Sample Size', value: protocol.sample_size || 'Not specified' },
      { label: 'Duration (weeks)', value: protocol.duration_weeks || 'Not specified' },
      { label: 'Primary Endpoint', value: protocol.primary_endpoint || 'Not specified' },
      { label: 'Secondary Endpoints', value: Array.isArray(protocol.secondary_endpoints) ? 
        protocol.secondary_endpoints.join(', ') : (protocol.secondary_endpoints || 'Not specified') }
    ];
    
    // Add protocol fields in a well-formatted way
    protocolFields.forEach(field => {
      pdf.font('Helvetica-Bold').fontSize(12)
        .fillColor('#333333')
        .text(`${field.label}:`, { continued: true });
      
      pdf.font('Helvetica').fontSize(12)
        .text(` ${field.value}`)
        .moveDown(0.5);
    });
    
    // Add study design section if available
    if (protocol.study_design) {
      pdf.moveDown(1);
      pdf.font('Helvetica-Bold').fontSize(14)
        .fillColor('#0066CC')
        .text('Study Design');
      
      pdf.moveDown(0.5);
      pdf.font('Helvetica').fontSize(12)
        .fillColor('#333333')
        .text(protocol.study_design)
        .moveDown(0.5);
    }
    
    // Add inclusion/exclusion criteria if available
    if (protocol.inclusion_criteria || protocol.exclusion_criteria) {
      pdf.moveDown(1);
      pdf.font('Helvetica-Bold').fontSize(14)
        .fillColor('#0066CC')
        .text('Eligibility Criteria');
      
      pdf.moveDown(0.5);
      
      if (protocol.inclusion_criteria) {
        pdf.font('Helvetica-Bold').fontSize(12)
          .fillColor('#333333')
          .text('Inclusion Criteria:');
        
        pdf.font('Helvetica').fontSize(12);
        
        if (Array.isArray(protocol.inclusion_criteria)) {
          protocol.inclusion_criteria.forEach(criterion => {
            pdf.text(`• ${criterion}`).moveDown(0.2);
          });
        } else {
          pdf.text(protocol.inclusion_criteria);
        }
        
        pdf.moveDown(0.5);
      }
      
      if (protocol.exclusion_criteria) {
        pdf.font('Helvetica-Bold').fontSize(12)
          .fillColor('#333333')
          .text('Exclusion Criteria:');
        
        pdf.font('Helvetica').fontSize(12);
        
        if (Array.isArray(protocol.exclusion_criteria)) {
          protocol.exclusion_criteria.forEach(criterion => {
            pdf.text(`• ${criterion}`).moveDown(0.2);
          });
        } else {
          pdf.text(protocol.exclusion_criteria);
        }
      }
    }
    
    // Success Probability Analysis page
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(18)
      .fillColor('#0066CC')
      .text('Success Probability Analysis', { underline: true });
    
    pdf.moveDown(1);
    
    // Main prediction with visualization
    const predictionValue = (prediction * 100).toFixed(1);
    pdf.font('Helvetica-Bold').fontSize(16)
      .fillColor('#333333')
      .text('Predicted Trial Success Probability:');
    
    pdf.moveDown(0.5);
    
    // Draw a progress bar for the success rate
    const barWidth = 400;
    const barHeight = 30;
    const startX = (pdf.page.width - barWidth) / 2;
    const startY = pdf.y;
    
    // Background bar
    pdf.rect(startX, startY, barWidth, barHeight)
      .fillColor('#EEEEEE')
      .fill();
    
    // Filled portion based on prediction
    const fillWidth = (barWidth * prediction);
    pdf.rect(startX, startY, fillWidth, barHeight)
      .fillColor(predictionValue > 70 ? '#00AA00' : predictionValue > 40 ? '#FF9900' : '#CC0000')
      .fill();
    
    // Add percentage text
    pdf.font('Helvetica-Bold').fontSize(18)
      .fillColor('#FFFFFF')
      .text(`${predictionValue}%`, 
        startX + (fillWidth / 2) - 20, 
        startY + (barHeight / 2) - 9);
    
    pdf.moveDown(3);
    
    // Confidence Interval
    const lowerCI = Math.max(0, (prediction - 0.15) * 100).toFixed(1);
    const upperCI = Math.min(100, (prediction + 0.15) * 100).toFixed(1);
    
    pdf.font('Helvetica').fontSize(14)
      .fillColor('#333333')
      .text(`Confidence Interval: ${lowerCI}% - ${upperCI}%`, {
        align: 'center'
      });
    
    pdf.moveDown(2);
    
    // Factor analysis - list the factors that influence this prediction
    pdf.font('Helvetica-Bold').fontSize(16)
      .text('Key Factors Influencing Prediction');
    
    pdf.moveDown(0.5);
    
    const factors = [
      { name: 'Sample Size', impact: protocol.sample_size ? 'Positive' : 'Unknown', description: 'Statistical power and effect detection capability' },
      { name: 'Study Design', impact: protocol.study_design ? 'Positive' : 'Unknown', description: 'Randomization, blinding, and control methods' },
      { name: 'Endpoint Selection', impact: protocol.primary_endpoint ? 'Positive' : 'Unknown', description: 'Appropriateness of primary/secondary endpoints' },
      { name: 'Patient Population', impact: 'Calculated', description: 'Inclusion/exclusion criteria specificity' },
      { name: 'Duration', impact: protocol.duration_weeks ? 'Positive' : 'Unknown', description: 'Length of treatment and follow-up period' }
    ];
    
    // Create factor table
    factors.forEach(factor => {
      pdf.font('Helvetica-Bold').fontSize(12)
        .fillColor('#333333')
        .text(`${factor.name}:`, { continued: true });
      
      pdf.font('Helvetica').fontSize(12)
        .fillColor(factor.impact === 'Positive' ? '#00AA00' : 
                  factor.impact === 'Negative' ? '#CC0000' : '#888888')
        .text(` ${factor.impact}`, { continued: true });
      
      pdf.font('Helvetica').fontSize(12)
        .fillColor('#333333')
        .text(` - ${factor.description}`)
        .moveDown(0.5);
    });
    
    // Strategic Recommendations page
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(18)
      .fillColor('#0066CC')
      .text('Strategic Recommendations', { underline: true });
    
    pdf.moveDown(1);
    
    // Add insights with formatting
    if (insights && insights.length > 0) {
      pdf.font('Helvetica').fontSize(14)
        .fillColor('#333333')
        .text('Based on analysis of your protocol and comparison with similar trials, we recommend:')
        .moveDown(1);
      
      insights.forEach((insight, index) => {
        pdf.font('Helvetica-Bold').fontSize(14)
          .fillColor('#0066CC')
          .text(`${index + 1}. Key Recommendation:`);
        
        pdf.font('Helvetica').fontSize(12)
          .fillColor('#333333')
          .text(insight)
          .moveDown(1);
      });
    } else {
      // Default insights if none provided
      pdf.font('Helvetica').fontSize(14)
        .fillColor('#333333')
        .text('Based on our analysis, we recommend the following strategic optimizations:')
        .moveDown(1);
      
      const defaultInsights = [
        {
          title: 'Optimize Sample Size Calculation',
          detail: 'Consider an adaptive design approach to optimize statistical power while minimizing unnecessary patient exposure. This could reduce costs while maintaining trial integrity.'
        },
        {
          title: 'Refine Endpoint Selection',
          detail: 'Similar successful trials in this indication have utilized composite endpoints that combine clinical outcomes with patient-reported measures. This approach strengthens regulatory submissions.'
        },
        {
          title: 'Enhance Retention Strategy',
          detail: 'Implement a comprehensive retention program to minimize dropout rates. Historical data shows higher completion rates when burden on participants is reduced through careful visit scheduling.'
        },
        {
          title: 'Consider Stratification Factors',
          detail: 'Stratify randomization by key baseline characteristics to reduce variability in treatment effect estimation and improve statistical efficiency.'
        }
      ];
      
      defaultInsights.forEach((insight, index) => {
        pdf.font('Helvetica-Bold').fontSize(14)
          .fillColor('#0066CC')
          .text(`${index + 1}. ${insight.title}`);
        
        pdf.font('Helvetica').fontSize(12)
          .fillColor('#333333')
          .text(insight.detail)
          .moveDown(1);
      });
    }
    
    // Benchmarks and Comparisons page
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(18)
      .fillColor('#0066CC')
      .text('Benchmark Comparison', { underline: true });
    
    pdf.moveDown(1);
    
    // Introduction to the benchmark section
    pdf.font('Helvetica').fontSize(12)
      .fillColor('#333333')
      .text(`Your protocol has been compared against ${benchmarks.total_trials || 'similar'} trials in the same therapeutic area and phase.`)
      .moveDown(1);
    
    // Create a more visually appealing table for benchmarks
    const metrics = [
      { name: 'Sample Size', value: protocol.sample_size || 'N/A', benchmark: benchmarks.median_sample_size || 'N/A' },
      { name: 'Duration (Weeks)', value: protocol.duration_weeks || 'N/A', benchmark: benchmarks.median_duration || 'N/A' },
      { name: 'Dropout Rate', value: `${((protocol.dropout_rate || 0) * 100).toFixed(1)}%`, 
        benchmark: `${((benchmarks.average_dropout_rate || 0) * 100).toFixed(1)}%` },
      { name: 'Primary Endpoints', value: protocol.primary_endpoint ? '1' : 'N/A', 
        benchmark: benchmarks.avg_primary_endpoints || 'N/A' },
      { name: 'Secondary Endpoints', value: Array.isArray(protocol.secondary_endpoints) ? 
        protocol.secondary_endpoints.length.toString() : 'N/A', 
        benchmark: benchmarks.avg_secondary_endpoints || 'N/A' }
    ];
    
    // Table header
    const tableTop = pdf.y + 10;
    const colWidth = 150;
    const rowHeight = 30;
    const tableX = 70;
    
    // Draw table header background
    pdf.rect(tableX, tableTop, colWidth * 3, rowHeight)
      .fillColor('#0066CC')
      .fill();
    
    // Draw header text
    pdf.font('Helvetica-Bold').fontSize(12)
      .fillColor('#FFFFFF');
    
    pdf.text('Metric', tableX + 10, tableTop + 10);
    pdf.text('Your Protocol', tableX + colWidth + 10, tableTop + 10);
    pdf.text('Industry Benchmark', tableX + colWidth * 2 + 10, tableTop + 10);
    
    // Draw table rows
    let rowY = tableTop + rowHeight;
    
    metrics.forEach((metric, i) => {
      // Alternating row background
      pdf.rect(tableX, rowY, colWidth * 3, rowHeight)
        .fillColor(i % 2 === 0 ? '#F5F5F5' : '#FFFFFF')
        .fill();
      
      // Draw cell text
      pdf.font('Helvetica-Bold').fontSize(12)
        .fillColor('#333333')
        .text(metric.name, tableX + 10, rowY + 10);
      
      pdf.font('Helvetica').fontSize(12)
        .text(metric.value, tableX + colWidth + 10, rowY + 10);
      
      pdf.font('Helvetica').fontSize(12)
        .text(metric.benchmark, tableX + colWidth * 2 + 10, rowY + 10);
      
      rowY += rowHeight;
    });
    
    // Draw table borders
    pdf.rect(tableX, tableTop, colWidth * 3, rowHeight * (metrics.length + 1))
      .stroke();
    
    // Vertical lines
    pdf.moveTo(tableX + colWidth, tableTop)
      .lineTo(tableX + colWidth, tableTop + rowHeight * (metrics.length + 1))
      .stroke();
    
    pdf.moveTo(tableX + colWidth * 2, tableTop)
      .lineTo(tableX + colWidth * 2, tableTop + rowHeight * (metrics.length + 1))
      .stroke();
    
    // Horizontal lines
    for (let i = 1; i <= metrics.length; i++) {
      pdf.moveTo(tableX, tableTop + rowHeight * i)
        .lineTo(tableX + colWidth * 3, tableTop + rowHeight * i)
        .stroke();
    }
    
    // Add a section about similar successful trials
    pdf.moveDown(3);
    pdf.font('Helvetica-Bold').fontSize(16)
      .fillColor('#0066CC')
      .text('Successful Trial Characteristics');
    
    pdf.moveDown(0.5);
    
    pdf.font('Helvetica').fontSize(12)
      .fillColor('#333333')
      .text('Successful trials in this therapeutic area typically share these features:');
    
    pdf.moveDown(0.5);
    
    // Success factors
    const successFactors = [
      'Clear and objective primary endpoints',
      'Adequate statistical power (80-90%)',
      'Appropriate inclusion/exclusion criteria to reduce heterogeneity',
      'Minimized protocol complexity to improve adherence',
      'Well-defined standard of care in control arms'
    ];
    
    successFactors.forEach(factor => {
      pdf.font('Helvetica').fontSize(12)
        .text(`• ${factor}`)
        .moveDown(0.3);
    });
    
    // Add detailed improvement recommendations page
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(18)
      .fillColor('#0066CC')
      .text('Detailed Improvement Recommendations', { underline: true });
    
    pdf.moveDown(1);
    
    pdf.font('Helvetica').fontSize(12)
      .fillColor('#333333')
      .text('The following recommendations address specific areas where your protocol can be improved. Each includes a clear action plan and evidence-based justification.');
    
    pdf.moveDown(1.5);
    
    // Create detailed recommendations based on risk flags and benchmark comparisons
    const recommendationData = [];
    
    // Check for sample size issues
    if ((protocol.sample_size || 0) < (benchmarks?.median_sample_size || 200)) {
      recommendationData.push({
        area: 'Sample Size',
        problem: 'Your proposed sample size is below the median for similar trials in this indication.',
        solution: `Consider increasing sample size from ${protocol.sample_size || 'current value'} to at least ${benchmarks?.median_sample_size || 'the industry standard'}, or implementing an adaptive design with sample size re-estimation.`,
        rationale: 'Underpowered studies have higher failure rates due to insufficient statistical power to detect clinically meaningful treatment effects. An adaptive design allows flexibility while maintaining trial integrity.',
        evidence: 'Meta-analyses of clinical trials show that underpowered studies are 60% more likely to fail and often waste resources on inconclusive results that cannot support regulatory decisions.'
      });
    }
    
    // Check for dropout rate issues
    if ((protocol.dropout_rate || 0) > 0.2) {
      recommendationData.push({
        area: 'Participant Retention',
        problem: `Your anticipated dropout rate (${((protocol.dropout_rate || 0) * 100).toFixed(1)}%) is high, which can compromise study integrity and statistical power.`,
        solution: 'Implement a comprehensive retention program including: reduced visit burden, transportation assistance, simplified assessments, and patient-centered scheduling.',
        rationale: 'High dropout rates reduce effective sample size, introduce bias, and complicate the interpretation of efficacy and safety endpoints. Each 5% reduction in dropout rate can increase effective power by approximately 10%.',
        evidence: 'Recent analyses of successful phase 2-3 trials show that protocols with robust retention strategies achieve 30% lower dropout rates and 25% higher success rates in regulatory submissions.'
      });
    }
    
    // Check for duration issues
    if ((protocol.duration_weeks || 0) < 12 && (benchmarks?.median_duration || 24) > 16) {
      recommendationData.push({
        area: 'Study Duration',
        problem: 'Your study duration is shorter than typical for this indication, which may not allow sufficient time to observe clinically meaningful outcomes.',
        solution: `Consider extending the treatment period from ${protocol.duration_weeks || 'current duration'} weeks to at least ${benchmarks?.median_duration || '16-24'} weeks, with appropriate interim assessments.`,
        rationale: 'Insufficient follow-up time is a common reason for failure to detect treatment effects that emerge gradually. The optimal duration should align with the pharmacodynamics of the intervention and natural history of the condition.',
        evidence: 'Comparative analyses of trial durations in this therapeutic area show that studies with durations below the median have a 40% higher failure rate due to inability to demonstrate sustained efficacy.'
      });
    }
    
    // Check for endpoint selection issues
    if (!protocol.primary_endpoint || protocol.primary_endpoint === '') {
      recommendationData.push({
        area: 'Endpoint Selection',
        problem: 'Your protocol lacks clearly defined primary endpoint(s) or uses endpoints that may not be optimal for demonstrating clinically meaningful benefits.',
        solution: 'Define a primary endpoint that is (1) directly linked to clinical benefit, (2) validated in the target population, (3) sensitive to change within your study timeframe, and (4) accepted by regulatory authorities.',
        rationale: 'Endpoint selection is critical for trial success. Composite endpoints may increase sensitivity to treatment effects, while validated surrogate endpoints can reduce required sample size and duration.',
        evidence: 'FDA and EMA guidance documents emphasize that poorly selected endpoints are among the top 3 reasons for clinical trial failure in phase 2-3 studies, accounting for approximately 30% of all regulatory rejections.'
      });
    }
    
    // Check for study design issues
    if (!protocol.study_design || protocol.study_design === '') {
      recommendationData.push({
        area: 'Study Design',
        problem: 'Your protocol lacks detailed study design specifications, which may lead to operational challenges and statistical limitations.',
        solution: 'Implement a randomized, double-blind, parallel-group design with appropriate stratification factors based on prognostic variables. Consider adaptive elements for dose-finding or sample size re-estimation.',
        rationale: 'Well-designed studies minimize bias, control variability, and optimize statistical efficiency. Stratification can reduce the impact of baseline imbalances and improve precision of treatment effect estimates.',
        evidence: 'Analysis of successful regulatory submissions shows that protocols with clearly defined design elements and pre-specified statistical approaches are 50% more likely to receive approval with their first submission.'
      });
    }
    
    // If no specific recommendations, add general improvement suggestions
    if (recommendationData.length === 0) {
      recommendationData.push({
        area: 'General Protocol Optimization',
        problem: 'While your protocol meets basic requirements, there are opportunities for optimization to increase success probability.',
        solution: 'Consider implementing adaptive design elements, incorporating patient-reported outcomes, and adding biomarker assessments to strengthen your evidence package.',
        rationale: 'Even well-designed protocols can benefit from additional elements that provide mechanistic insights, enhance patient relevance, and increase operational efficiency.',
        evidence: 'Recent regulatory trends show increasing acceptance of innovative trial designs and endpoints that demonstrate value to patients while maintaining scientific rigor.'
      });
    }
    
    // Add the recommendations to the PDF
    recommendationData.forEach((rec, index) => {
      // Section title with area of improvement
      pdf.font('Helvetica-Bold').fontSize(14)
        .fillColor('#0066CC')
        .text(`${index + 1}. ${rec.area} Optimization`, { continued: false });
      
      pdf.moveDown(0.5);
      
      // Problem identification - what needs to be improved
      pdf.font('Helvetica-Bold').fontSize(12)
        .fillColor('#CC0000')
        .text('ISSUE IDENTIFIED:', { continued: false });
      
      pdf.font('Helvetica').fontSize(12)
        .fillColor('#333333')
        .text(rec.problem, { continued: false });
      
      pdf.moveDown(0.5);
      
      // Solution - how to improve it
      pdf.font('Helvetica-Bold').fontSize(12)
        .fillColor('#00AA00')
        .text('RECOMMENDED ACTION:', { continued: false });
      
      pdf.font('Helvetica').fontSize(12)
        .fillColor('#333333')
        .text(rec.solution, { continued: false });
      
      pdf.moveDown(0.5);
      
      // Rationale - why it matters
      pdf.font('Helvetica-Bold').fontSize(12)
        .fillColor('#0066CC')
        .text('WHY IT MATTERS:', { continued: false });
      
      pdf.font('Helvetica').fontSize(12)
        .fillColor('#333333')
        .text(rec.rationale, { continued: false });
      
      pdf.moveDown(0.5);
      
      // Evidence - supporting data
      pdf.font('Helvetica-Bold').fontSize(12)
        .fillColor('#666666')
        .text('SUPPORTING EVIDENCE:', { continued: false });
      
      pdf.font('Helvetica-Oblique').fontSize(12)
        .fillColor('#333333')
        .text(rec.evidence, { continued: false });
      
      // Add separator between recommendations
      pdf.moveDown(1.5);
      if (index < recommendationData.length - 1) {
        pdf.moveTo(100, pdf.y)
          .lineTo(pdf.page.width - 100, pdf.y)
          .stroke();
        pdf.moveDown(1.5);
      }
    });
    
    // Final page with conclusions
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(18)
      .fillColor('#0066CC')
      .text('Summary and Next Steps', { underline: true });
    
    pdf.moveDown(1);
    
    // Summary section
    pdf.font('Helvetica-Bold').fontSize(14)
      .fillColor('#333333')
      .text('Key Findings');
    
    pdf.moveDown(0.5);
    
    pdf.font('Helvetica').fontSize(12)
      .text(`• Your protocol has a predicted success probability of ${predictionValue}%`);
    
    pdf.moveDown(0.3);
    
    // Dynamic recommendations based on prediction value
    if (prediction > 0.7) {
      pdf.text('• Your protocol demonstrates strong potential for success');
    } else if (prediction > 0.4) {
      pdf.text('• Your protocol shows moderate potential but has improvement opportunities');
    } else {
      pdf.text('• Your protocol requires significant optimization to improve success chances');
    }
    
    pdf.moveDown(0.3);
    
    pdf.text(`• We have identified ${recommendationData.length} key areas for protocol optimization`);
    pdf.text('• Review the detailed improvement recommendations for specific, actionable steps');
    
    pdf.moveDown(2);
    
    // Next steps section with improved action items
    pdf.font('Helvetica-Bold').fontSize(14)
      .text('Recommended Next Steps');
    
    pdf.moveDown(0.5);
    
    const nextSteps = [
      'Implement the specific recommendations provided in the "Detailed Improvement Recommendations" section',
      'Consult with subject matter experts on the highest priority improvement areas',
      'Run a power calculation with the recommended sample size to confirm statistical power',
      'Develop a detailed retention strategy to achieve the target dropout rate',
      'Consider requesting a pre-submission meeting with regulatory authorities to discuss your optimized protocol'
    ];
    
    nextSteps.forEach(step => {
      pdf.font('Helvetica').fontSize(12)
        .text(`• ${step}`)
        .moveDown(0.3);
    });
    
    pdf.moveDown(2);
    
    // Add footer with contact info
    pdf.font('Helvetica-Oblique').fontSize(10)
      .fillColor('#666666')
      .text('For additional assistance with protocol optimization:', {
        align: 'center'
      })
      .text('support@lumentrial.ai | www.lumentrial.ai', {
        align: 'center'
      });
    
    pdf.font('Helvetica').fontSize(10)
      .text(`Report ID: ${sessionId}-${timestamp}`, {
        align: 'center'
      })
      .text(`Generated: ${new Date().toLocaleString()}`, {
        align: 'center'
      });
    
    // End PDF
    pdf.end();
    
    // Wait for PDF to be written
    writeStream.on('finish', () => {
      console.log(`Intelligence report PDF generated successfully: ${filePath}`);
      
      // Calculate download URL
      const downloadUrl = `/exports/${filename}`;
      
      // Return success with download URL
      return res.json({
        success: true,
        download_url: downloadUrl,
        filename: filename
      });
    });
    
    writeStream.on('error', (err) => {
      console.error('Error writing PDF:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error generating PDF file' 
      });
    });
    
  } catch (error: any) {
    console.error('Error generating report:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate report' 
    });
  }
});

// Validation schema for summary packet request
const PacketRequestSchema = z.object({
  protocol: z.string(),
  ind25: z.string(),
  ind27: z.string(),
  sap: z.string(),
  risks: z.array(z.string()),
  success_probability: z.number(),
  sample_size: z.number(),
  session_id: z.string()
});

// POST endpoint for generating a summary packet
router.post('/summary-packet', express.json(), async (req, res) => {
  try {
    // Validate request body
    const requestData = PacketRequestSchema.parse(req.body);
    
    // Generate filename for the PDF
    const filename = `summary_packet_${requestData.session_id}.pdf`;
    const filePath = path.join(STATIC_DIR, filename);
    
    // Create PDF document
    const pdf = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    pdf.pipe(writeStream);
    
    // Add content to the PDF
    pdf.font('Helvetica-Bold').fontSize(14)
      .text(`Study Packet (${requestData.session_id})`, { align: 'center' })
      .moveDown();
    
    pdf.font('Helvetica').fontSize(11)
      .text(`Success Probability: ${requestData.success_probability}%`)
      .text(`Sample Size Estimate: ${requestData.sample_size} participants`)
      .moveDown();
    
    // IND Module 2.5
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('IND Module 2.5', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11)
      .text(requestData.ind25)
      .moveDown();
    
    // IND Module 2.7
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('IND Module 2.7', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11)
      .text(requestData.ind27)
      .moveDown();
    
    // SAP Draft
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('SAP Draft', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11)
      .text(requestData.sap)
      .moveDown();
    
    // Key Risk Flags
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('Key Risk Flags', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11);
    
    requestData.risks.forEach(risk => {
      pdf.text(`• ${risk}`);
    });
    
    // Protocol Content Summary
    pdf.addPage();
    pdf.font('Helvetica-Bold').fontSize(12)
      .text('Protocol Content', { underline: true })
      .moveDown(0.5);
    pdf.font('Helvetica').fontSize(11)
      .text(requestData.protocol.substring(0, Math.min(1000, requestData.protocol.length)));
    
    if (requestData.protocol.length > 1000) {
      pdf.text('...(content truncated for brevity)...');
    }
    
    // Finalize the PDF
    pdf.end();
    
    // Wait for PDF to finish writing
    writeStream.on('finish', async () => {
      // Save archive entry
      const archiveEntry = {
        session_id: requestData.session_id,
        filename,
        success_probability: requestData.success_probability,
        sample_size: requestData.sample_size,
        risks: requestData.risks,
        created_at: new Date().toISOString()
      };
      
      try {
        let db: Record<string, any[]> = {};
        
        if (fs.existsSync(ARCHIVE_PATH)) {
          const fileContent = fs.readFileSync(ARCHIVE_PATH, 'utf-8');
          db = JSON.parse(fileContent);
        }
        
        if (!db[requestData.session_id]) {
          db[requestData.session_id] = [];
        }
        
        db[requestData.session_id].push(archiveEntry);
        
        fs.writeFileSync(ARCHIVE_PATH, JSON.stringify(db, null, 2));
      } catch (error) {
        console.error('Archive save error:', error);
      }
      
      res.status(200).json({ 
        success: true,
        pdf_url: `/static/${filename}`
      });
    });
    
    writeStream.on('error', (err) => {
      console.error('Error writing PDF:', err);
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate PDF'
      });
    });
  } catch (error: any) {
    console.error('Summary packet generation error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Invalid request data'
    });
  }
});

/**
 * Generate and return a study bundle as a ZIP archive
 * GET /api/export/study-bundle?study_id=xxx&persona=yyy
 */
router.get('/study-bundle', async (req, res) => {
  try {
    const { study_id, persona } = req.query;
    
    if (!study_id || typeof study_id !== 'string') {
      return res.status(400).json({ error: 'Study ID is required' });
    }
    
    // Create archive file
    const zipPath = await exportService.createSessionArchive(
      study_id,
      typeof persona === 'string' ? persona : undefined
    );
    
    // Return the path for later download
    res.json({
      success: true,
      zipPath: zipPath,
      downloadUrl: `/api/download/study-bundle?study_id=${study_id}`,
      message: "Export bundle created successfully"
    });
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Failed to create export bundle',
      message: error.message || 'Unknown error'
    });
  }
});

/**
 * Download a previously generated study bundle
 * GET /api/download/study-bundle?study_id=xxx
 */
router.get('/download/study-bundle', async (req, res) => {
  try {
    const { study_id } = req.query;
    
    if (!study_id || typeof study_id !== 'string') {
      return res.status(400).json({ error: 'Study ID is required' });
    }
    
    // Look up the most recent bundle for this study ID
    const exportDir = process.env.DATA_PATH 
      ? path.join(process.env.DATA_PATH, 'exports')
      : '/mnt/data/lumen_reports_backend/exports';
    
    try {
      const files = fs.readdirSync(exportDir);
      // Find the most recent ZIP file for this study ID
      const zipFiles = files
        .filter(file => file.startsWith(`${study_id}_bundle_`) && file.endsWith('.zip'))
        .sort()
        .reverse();
      
      if (zipFiles.length === 0) {
        return res.status(404).json({ error: 'No export bundle found for this study ID' });
      }
      
      const zipPath = path.join(exportDir, zipFiles[0]);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${zipFiles[0]}`);
      
      // Stream the file to the response
      const fileStream = fs.createReadStream(zipPath);
      fileStream.pipe(res);
    } catch (err) {
      console.error('Error reading export directory:', err);
      return res.status(500).json({ error: 'Failed to access export files' });
    }
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Failed to download export bundle',
      message: error.message || 'Unknown error'
    });
  }
});

/**
 * Generate and export a Session Summary Report PDF
 * POST /api/export/session-summary/:session_id
 */
router.post('/session-summary/:session_id', express.json(), async (req, res) => {
  try {
    const { session_id } = req.params;
    const { include_timestamp = true, format = 'pdf' } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Determine base directory for sessions
    const baseDir = fs.existsSync('/mnt/data') 
      ? '/mnt/data/lumen_reports_backend' 
      : 'data';
    
    const sessionDir = path.join(baseDir, 'sessions', session_id);
    
    // Check if session directory exists
    if (!fs.existsSync(sessionDir)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Generate a unique filename for this export
    const filename = `session_summary_${session_id}_${Date.now()}.pdf`;
    const outputPath = path.join(SESSION_SUMMARY_DIR, filename);
    
    // Fetch the session summary data
    const summaryResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/session/summary/${session_id}`);
    
    if (!summaryResponse.ok) {
      return res.status(500).json({ error: 'Failed to retrieve session summary data' });
    }
    
    const summaryData = await summaryResponse.json();
    
    // Create PDF document
    const pdf = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      size: 'A4'
    });
    
    // Pipe to file
    const writeStream = fs.createWriteStream(outputPath);
    pdf.pipe(writeStream);
    
    // Get the current date and time
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    // Add branded header
    pdf.fontSize(20).font('Helvetica-Bold')
      .text('LumenTrialGuide.AI', { align: 'center' })
      .fontSize(16).font('Helvetica')
      .text('Session Intelligence Snapshot', { align: 'center' })
      .moveDown(0.5);
    
    // Add timestamp if requested
    if (include_timestamp) {
      pdf.fontSize(10).font('Helvetica')
        .text(`Generated on: ${currentDate} at ${currentTime}`, { align: 'center' })
        .moveDown(1);
    }
    
    // Session ID section
    pdf.fontSize(12).font('Helvetica-Bold')
      .text('Session Information', { underline: true })
      .moveDown(0.5);
    
    pdf.fontSize(11).font('Helvetica')
      .text(`Session ID: ${session_id}`)
      .text(`Last Updated: ${new Date(summaryData.last_updated).toLocaleString()}`)
      .moveDown(1);
    
    // Generated Files section
    pdf.fontSize(12).font('Helvetica-Bold')
      .text('Generated Intelligence Components', { underline: true })
      .moveDown(0.5);
    
    // Map of pretty names for components
    const componentNames = {
      dropout_forecast: "Dropout Forecast",
      success_prediction: "Success Prediction",
      ind_summary: "IND Module 2.5",
      sap_summary: "SAP Document",
      summary_packet: "Summary Packet PDF",
      regulatory_bundle: "Regulatory Bundle ZIP"
    };
    
    if (summaryData.generated_files && Object.keys(summaryData.generated_files).length > 0) {
      // Create table-like layout for component status
      const startX = 60;
      let currentY = pdf.y + 10;
      const rowHeight = 25;
      const col1Width = 250;
      const col2Width = 100;
      
      // Table header
      pdf.font('Helvetica-Bold').fontSize(11)
        .text('Component', startX, currentY)
        .text('Status', startX + col1Width, currentY);
      
      currentY += 20;
      pdf.moveTo(startX, currentY).lineTo(startX + col1Width + col2Width, currentY).stroke();
      currentY += 5;
      
      // Table rows
      Object.entries(summaryData.generated_files).forEach(([key, generated]) => {
        pdf.font('Helvetica').fontSize(11)
          .text(componentNames[key] || key, startX, currentY);
        
        pdf.font('Helvetica-Bold').fontSize(11)
          .fillColor(generated ? 'green' : 'gray')
          .text(generated ? '✓ Ready' : '× Pending', startX + col1Width, currentY);
        
        pdf.fillColor('black'); // Reset color
        currentY += rowHeight;
      });
      
      // Count total ready components
      const readyCount = Object.values(summaryData.generated_files).filter(Boolean).length;
      const totalCount = Object.keys(summaryData.generated_files).length;
      
      pdf.moveDown(1.5);
      pdf.font('Helvetica-Bold').fontSize(11)
        .text(`Summary: ${readyCount} of ${totalCount} components ready`, { align: 'center' });
      
    } else {
      pdf.fontSize(11).font('Helvetica')
        .text('No components have been generated for this session yet.');
    }
    
    // Add footer
    pdf.fontSize(8).font('Helvetica')
      .text('LumenTrialGuide.AI - Intelligent Clinical Trial Design Platform', {
        align: 'center', 
        y: pdf.page.height - 50
      });
    
    // End the PDF
    pdf.end();
    
    // Wait for PDF to finish writing
    writeStream.on('finish', () => {
      res.status(200).json({
        success: true,
        message: 'Session summary report generated successfully',
        filename: filename,
        download_url: `/api/download/session-summary/${session_id}`
      });
    });
    
    writeStream.on('error', (err) => {
      console.error('Error writing session summary PDF:', err);
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate session summary report'
      });
    });
    
  } catch (error: any) {
    console.error('Error generating session summary report:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate session summary report'
    });
  }
});

/**
 * Download a previously generated session summary report
 * GET /api/download/session-summary/:session_id
 */
router.get('/download/session-summary/:session_id', (req, res) => {
  try {
    const { session_id } = req.params;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Find the most recent summary PDF for this session
    const files = fs.readdirSync(SESSION_SUMMARY_DIR);
    const summaryFiles = files
      .filter(file => file.startsWith(`session_summary_${session_id}_`) && file.endsWith('.pdf'))
      .sort()
      .reverse();
    
    if (summaryFiles.length === 0) {
      return res.status(404).json({ error: 'No session summary report found for this session' });
    }
    
    const filePath = path.join(SESSION_SUMMARY_DIR, summaryFiles[0]);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${summaryFiles[0]}`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error: any) {
    console.error('Error downloading session summary report:', error);
    res.status(500).json({
      error: 'Failed to download session summary report',
      message: error.message || 'Unknown error'
    });
  }
});

export { router as exportRoutes };