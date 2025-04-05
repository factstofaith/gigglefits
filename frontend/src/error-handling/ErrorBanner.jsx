import React from 'react';
import { styled } from "@/design-system/adapter";
import { useErrorContext } from './ErrorContext';

/**
 * ErrorBanner - Global error notification component
 * 
 * Displays a banner for global errors managed by the ErrorContext.
 * 
 * @returns {JSX.Element|null} The ErrorBanner component or null if no global error
 * 
 * @example
 * function App() {
 *   return (
 *     <>
 *       <ErrorBanner />
 *       <MainContent />
 *     </>
 *   );
 * }
 */
function ErrorBanner() {
  const {
    globalError,
    clearGlobalError
  } = useErrorContext();

  // Only render if there's a global error
  if (!globalError) {
    return null;
  }

  // Format error message
  const errorMessage = typeof globalError === 'string' ? globalError : globalError.message || 'An unknown error occurred';
  return <StyledErrorBanner role="alert" aria-live="assertive" data-testid="global-error-banner">
      <div className="error-content">
        <div className="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div className="error-message">
          {errorMessage}
        </div>
        <button className="close-button" onClick={clearGlobalError} aria-label="Dismiss error message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </StyledErrorBanner>;
}

// Styled component
const StyledErrorBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: #f44336;
  color: white;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: slide-down 0.3s ease-out forwards;

  @keyframes slide-down {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(0);
    }
  }

  .error-content {
    display: flex;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 16px;
  }

  .error-icon {
    flex-shrink: 0;
    margin-right: 12px;
  }

  .error-message {
    flex-grow: 1;
    font-size: 14px;
    line-height: 1.5;
  }

  .close-button {
    flex-shrink: 0;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 16px;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
    }
  }
`;
export default ErrorBanner;