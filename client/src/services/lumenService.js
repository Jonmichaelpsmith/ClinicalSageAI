import axios from 'axios';

// For demo purposes, we'll use a mock implementation that doesn't require the API
// In a production implementation, this would call the actual API endpoint
export default {
  chat: async ({ sessionId, context, message }) => {
    console.log('Lumen AI chat request:', { sessionId, message });
    
    // For demo, we'll generate responses locally instead of making API calls
    // This would be replaced with an actual API call in production
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample contextual responses based on sessionId
      const responses = {
        'coauthor-dashboard': `Based on your project, I recommend focusing on section 2.7 (Clinical Summary) next, as it's still in draft status and is critical for your FDA submission timeline.`,
        '2.7': `For your Clinical Summary section 2.7, you should include a comprehensive analysis of all efficacy and safety data. Make sure to include forest plots for the primary endpoints and clear tables for adverse events. I also recommend cross-referencing with section 5.3 to maintain consistency.`,
        '3.2': `When completing Quality Information section 3.2, remember to include detailed manufacturing process descriptions, quality control procedures, and stability data. FDA reviewers typically focus on batch consistency and validation of analytical methods in this section.`,
        '4.2': `For Pharmacology Studies section 4.2, ensure you include clear dose-response relationships and pharmacodynamic parameters. The mechanism of action should be clearly linked to your proposed indication, and any secondary pharmacology effects should be thoroughly discussed.`,
        'default': `I recommend following ICH guidelines for this section. Each CTD module has specific requirements for content and formatting. Would you like me to provide more detailed guidance for this specific section?`
      };
      
      // Return contextual response or default
      return responses[sessionId] || responses.default;
      
    } catch (error) {
      console.error('Error in mock Lumen chat:', error);
      return 'I apologize, but I encountered an issue processing your request. Please try again.';
    }
  },
};