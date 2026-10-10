import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('GeoStamp app shell', () => {
  it('renders the main photo workflow and ad placeholders', () => {
    render(<App />);
    expect(screen.getByText('GeoStamp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload photos/i })).toBeInTheDocument();
    expect(screen.getByText(/top banner ad space/i)).toBeInTheDocument();
  });
});