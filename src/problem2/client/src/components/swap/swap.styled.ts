import styled from 'styled-components';

// Type definitions for styled component props
export interface StyledSelectProps {
  hasError?: boolean;
}

export interface StyledInputProps {
  hasError?: boolean;
  isReadOnly?: boolean;
}

export interface LoadingSpinnerProps {
  size?: string;
}

export interface OutputTextProps {
  highlight?: boolean;
}

// Main Container
export const Container = styled.div`
  min-width: 480px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

// Title
export const Title = styled.h1`
  text-align: center;
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// Swap Card
export const SwapCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

// Input Group
export const InputGroup = styled.div`
  min-height: 79px;
  margin-bottom: 1.5rem;
  position: relative;
`;

// Label
export const Label = styled.label`
  width: '100%';
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
`;

// Input Container
export const InputContainer = styled.div`
  width: 155px;
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
`;

// Select Component
export const Select = styled.select<StyledSelectProps>`
  flex: 1;
  padding: 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  color: #374151;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
  
  &:hover {
    border-color: ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  }
`;

// Input Component
export const Input = styled.input<StyledInputProps>`
  flex: 1;
  padding: 1rem;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: ${props => props.isReadOnly ? '#f8fafc' : 'white'};
  cursor: ${props => props.isReadOnly ? 'not-allowed' : 'text'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
  
  &:hover {
    border-color: ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  }
`;

// Swap Button Container
export const SwapButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
  position: relative;
`;

// Swap Button
export const SwapIcon = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: rotate(180deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: rotate(180deg) scale(0.95);
  }

  &:focus {
    outline: none;
  }
`;

export const SwapButton = styled.button`
  border: 3px solid white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`

// Error Message
export const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
  font-weight: 500;
`;

// Loading Spinner
export const LoadingSpinner = styled.div<LoadingSpinnerProps>`
  display: inline-block;
  width: ${props => props.size || '16px'};
  height: ${props => props.size || '16px'};
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
  margin-left: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Output Info Container
export const OutputInfo = styled.div`
  background: #f8fafc;
  padding: 1rem;
  margin-top: 1rem;
  border-left: 4px solid #667eea;
`;

// Output Text
export const OutputText = styled.p<OutputTextProps>`
  margin: 0;
  color: ${props => props.highlight ? '#1e293b' : '#64748b'};
  font-size: ${props => props.highlight ? '1rem' : '0.875rem'};
  font-weight: ${props => props.highlight ? '600' : 'normal'};
`;

// Loading Container for initial loading state
export const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

export const LoadingText = styled.p`
  margin-top: 1rem;
  color: #64748b;
`;