/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentIntelligencePanel from '../DocumentIntelligencePanel';

describe('DocumentIntelligencePanel', () => {
  test('renders suggestions based on props and callbacks', async () => {
    const onGenerate = jest.fn(() => Promise.resolve());
    const onAnalyze = jest.fn(() => Promise.resolve());
    const onImprove = jest.fn(() => Promise.resolve());

    render(
      <DocumentIntelligencePanel
        onGenerate={onGenerate}
        onAnalyze={onAnalyze}
        onImprove={onImprove}
        sectionContent="Section text"
        qualityAnalysis={{ overallScore: 80 }}
        improvements={[{ suggestion: 'Use active voice' }]}
        loading={false}
        sessionInitialized={true}
      />
    );

    fireEvent.click(screen.getByText(/generate section content/i));
    expect(onGenerate).toHaveBeenCalled();

    fireEvent.click(screen.getByText(/analyze quality/i));
    expect(onAnalyze).toHaveBeenCalled();

    fireEvent.click(screen.getByText(/writing improvements/i));
    expect(onImprove).toHaveBeenCalled();

    expect(screen.getByTestId('section-content')).toHaveTextContent('Section text');
    expect(screen.getByTestId('quality-analysis')).toHaveTextContent('80');
    expect(screen.getByTestId('writing-improvements')).toHaveTextContent('Use active voice');
  });
});
