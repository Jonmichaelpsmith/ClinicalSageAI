/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoAuthor from '../CoAuthor';
import * as hub from '@/services/documentIntelligenceHub';

jest.mock('@/services/documentIntelligenceHub');

describe('CoAuthor Document Intelligence', () => {
  beforeEach(() => {
    (hub.initializeIntelligence as jest.Mock).mockResolvedValue({ sessionId: 'session123' });
    (hub.generateSectionContent as jest.Mock).mockResolvedValue({ content: 'Generated text' });
  });

  test('initializes intelligence when a document is selected', async () => {
    render(<CoAuthor />);
    fireEvent.click(screen.getByText('Module 2.5 Clinical Overview'));
    await waitFor(() => expect(hub.initializeIntelligence).toHaveBeenCalled());
  });

  test('displays generated section content', async () => {
    render(<CoAuthor />);
    fireEvent.click(screen.getByText('Module 2.5 Clinical Overview'));
    await screen.findByText('Generate Section Content');
    fireEvent.click(screen.getByText('Generate Section Content'));
    await waitFor(() => expect(hub.generateSectionContent).toHaveBeenCalled());
    expect(await screen.findByTestId('section-content')).toHaveTextContent('Generated text');
  });
});
