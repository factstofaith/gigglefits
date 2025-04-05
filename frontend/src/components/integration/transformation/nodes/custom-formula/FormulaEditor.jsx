require('dotenv').config();

/**
 * Formula Editor Component
 * 
 * Provides a comprehensive editor for formula building with syntax highlighting,
 * autocomplete, and validation feedback.
 * 
 * This component leverages our zero technical debt approach by implementing
 * an ideal formula editing experience without legacy UI constraints.
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { TokenTypes } from './formula-parser';
import './formula-editor.css';

/**
 * Keywords for syntax highlighting
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const KEYWORDS = ['if', 'and', 'or', 'not', 'true', 'false', 'null', 'undefined'];

/**
 * Operators for syntax highlighting
 */
const OPERATORS = ['+', '-', '*', '/', '%', '^', '=', '!', '<', '>', '&', '|', '==', '!=', '>=', '<=', '&&', '||'];

/**
 * Punctuation for syntax highlighting
 */
const PUNCTUATION = ['(', ')', '[', ']', '{', '}', ',', '.', ':'];

/**
 * Formula editor with syntax highlighting and autocomplete
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current formula value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.readOnly - Whether editor is in read-only mode
 * @param {Object} props.validation - Validation result with errors
 * @param {Array} props.suggestions - Function suggestions for autocomplete
 */
const FormulaEditor = ({
  value,
  onChange,
  readOnly,
  validation,
  suggestions
}) => {
  // Editor state
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [currentWord, setCurrentWord] = useState('');
  const editorRef = useRef(null);
  const suggestionsRef = useRef(null);
  const highlightedContentRef = useRef(null);

  // Tokenize value for syntax highlighting
  const tokenize = useCallback(text => {
    const result = [];
    let currentToken = '';
    let currentType = null;
    const processToken = () => {
      if (currentToken) {
        let type = currentType;
        if (type === 'identifier') {
          if (KEYWORDS.includes(currentToken.toLowerCase())) {
            type = 'keyword';
          } else if (suggestions.some(s => s.name === currentToken)) {
            type = 'function';
          }
        }
        result.push({
          type,
          value: currentToken
        });
        currentToken = '';
        currentType = null;
      }
    };
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Handle whitespace
      if (/\s/.test(char)) {
        processToken();
        result.push({
          type: 'whitespace',
          value: char
        });
        continue;
      }

      // Handle numbers
      if (/[0-9]/.test(char)) {
        if (currentType && currentType !== 'number' && currentType !== 'identifier') {
          processToken();
        }
        if (!currentType || currentType !== 'number' && currentType !== 'identifier') {
          currentType = 'number';
        }
        currentToken += char;
        continue;
      }

      // Handle decimal point in numbers
      if (char === '.' && currentType === 'number') {
        currentToken += char;
        continue;
      }

      // Handle identifiers
      if (/[a-zA-Z_]/.test(char) || currentType === 'identifier' && /[0-9]/.test(char)) {
        if (currentType && currentType !== 'identifier') {
          processToken();
        }
        if (!currentType) {
          currentType = 'identifier';
        }
        currentToken += char;
        continue;
      }

      // Handle operators
      if (/[+\-*/%^=!<>&|]/.test(char)) {
        const nextChar = i + 1 < text.length ? text[i + 1] : '';
        const twoCharOp = char + nextChar;
        if (currentType) {
          processToken();
        }
        if (['==', '!=', '>=', '<=', '&&', '||'].includes(twoCharOp)) {
          result.push({
            type: 'operator',
            value: twoCharOp
          });
          i++; // Skip next character
        } else {
          result.push({
            type: 'operator',
            value: char
          });
        }
        continue;
      }

      // Handle punctuation
      if (/[\(\),\.\[\]{}:]/.test(char)) {
        if (currentType) {
          processToken();
        }
        result.push({
          type: 'punctuation',
          value: char
        });
        continue;
      }

      // Handle strings
      if (char === '"' || char === "'") {
        if (currentType) {
          processToken();
        }
        const quote = char;
        let value = quote;
        let escaped = false;
        i++;
        while (i < text.length) {
          const c = text[i];
          value += c;
          if (escaped) {
            escaped = false;
          } else if (c === '\\') {
            escaped = true;
          } else if (c === quote) {
            break;
          }
          i++;
        }
        result.push({
          type: 'string',
          value
        });
        continue;
      }

      // Handle any other character
      if (currentType) {
        processToken();
      }
      result.push({
        type: 'unknown',
        value: char
      });
    }

    // Process any remaining token
    processToken();
    return result;
  }, [suggestions]);

  // Generate HTML for syntax highlighting
  const highlightedContent = useMemo(() => {
    if (!value) return '';
    const tokens = tokenize(value);
    return tokens.map((token, index) => {
      const className = `token-${token.type}`;
      return `<span class="${className}">${escapeHtml(token.value)}</span>`;
    }).join('');
  }, [value, tokenize]);

  // Escape HTML for safe injection
  const escapeHtml = text => {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
  };

  // Update highlighted content when value changes
  useEffect(() => {
    if (highlightedContentRef.current) {
      highlightedContentRef.current.innerHTML = highlightedContent;
    }
  }, [highlightedContent]);

  // Find the current word at cursor position for suggestions
  const getCurrentWord = useCallback(() => {
    if (!value || cursorPosition === 0) return '';

    // Search backward for the start of a word
    let start = cursorPosition;
    while (start > 0 && /[a-zA-Z0-9_]/.test(value[start - 1])) {
      start--;
    }

    // If we're not at the start of a word, return empty
    if (start === cursorPosition) return '';

    // Extract the word
    return value.substring(start, cursorPosition);
  }, [value, cursorPosition]);

  // Update current word when cursor position changes
  useEffect(() => {
    const word = getCurrentWord();
    setCurrentWord(word);

    // Filter suggestions based on current word
    if (word) {
      const filtered = suggestions.filter(suggestion => suggestion.name.toLowerCase().startsWith(word.toLowerCase()));
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestion(0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [cursorPosition, value, suggestions, getCurrentWord]);

  // Handle editor value change
  const handleChange = useCallback(e => {
    const newValue = e.target.value;
    onChange(newValue);
    setCursorPosition(e.target.selectionStart);
  }, [onChange]);

  // Handle cursor position change
  const handleSelect = useCallback(e => {
    setCursorPosition(e.target.selectionStart);
  }, []);

  // Scroll the editor to keep the cursor in view
  const scrollToCursor = useCallback(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const cursorPos = editor.selectionStart;

    // Create a temporary div to measure text
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'pre-wrap';
    temp.style.wordWrap = 'break-word';
    temp.style.width = `${editor.clientWidth}px`;
    temp.style.fontFamily = getComputedStyle(editor).fontFamily;
    temp.style.fontSize = getComputedStyle(editor).fontSize;
    temp.style.padding = getComputedStyle(editor).padding;

    // Add text up to cursor
    const textUntilCursor = editor.value.substring(0, cursorPos);
    temp.textContent = textUntilCursor;

    // Calculate cursor position
    document.body.appendChild(temp);
    const cursorPosition = temp.clientHeight;
    document.body.removeChild(temp);

    // Calculate scroll position to keep cursor in view
    const editorHeight = editor.clientHeight;
    const cursorHeight = parseInt(getComputedStyle(editor).lineHeight);
    const scrollPosition = editor.scrollTop;
    if (cursorPosition - scrollPosition > editorHeight - cursorHeight) {
      editor.scrollTop = cursorPosition - editorHeight + cursorHeight;
    } else if (cursorPosition < scrollPosition) {
      editor.scrollTop = cursorPosition;
    }
  }, []);

  // Handle key press for special handling
  const handleKeyDown = useCallback(e => {
    // Auto-complete parentheses
    if (e.key === '(' && !readOnly) {
      e.preventDefault();
      const newValue = `${value.substring(0, cursorPosition)}()${value.substring(cursorPosition)}`;
      onChange(newValue);
      // Set cursor position inside parentheses
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = cursorPosition + 1;
          editorRef.current.selectionEnd = cursorPosition + 1;
          setCursorPosition(cursorPosition + 1);
        }
      }, 0);
      return;
    }

    // Auto-complete brackets
    if (e.key === '[' && !readOnly) {
      e.preventDefault();
      const newValue = `${value.substring(0, cursorPosition)}[]${value.substring(cursorPosition)}`;
      onChange(newValue);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = cursorPosition + 1;
          editorRef.current.selectionEnd = cursorPosition + 1;
          setCursorPosition(cursorPosition + 1);
        }
      }, 0);
      return;
    }

    // Auto-complete braces
    if (e.key === '{' && !readOnly) {
      e.preventDefault();
      const newValue = `${value.substring(0, cursorPosition)}{}${value.substring(cursorPosition)}`;
      onChange(newValue);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = cursorPosition + 1;
          editorRef.current.selectionEnd = cursorPosition + 1;
          setCursorPosition(cursorPosition + 1);
        }
      }, 0);
      return;
    }

    // Auto-complete quotes
    if ((e.key === '"' || e.key === "'") && !readOnly) {
      e.preventDefault();
      const quote = e.key;
      const newValue = `${value.substring(0, cursorPosition)}${quote}${quote}${value.substring(cursorPosition)}`;
      onChange(newValue);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = cursorPosition + 1;
          editorRef.current.selectionEnd = cursorPosition + 1;
          setCursorPosition(cursorPosition + 1);
        }
      }, 0);
      return;
    }

    // Suggestion navigation
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion(prev => prev < filteredSuggestions.length - 1 ? prev + 1 : prev);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : 0);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const suggestion = filteredSuggestions[activeSuggestion];
        insertSuggestion(suggestion);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    // Indentation
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const newValue = `${value.substring(0, cursorPosition)}  ${value.substring(cursorPosition)}`;
      onChange(newValue);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = cursorPosition + 2;
          editorRef.current.selectionEnd = cursorPosition + 2;
          setCursorPosition(cursorPosition + 2);
        }
      }, 0);
    }
    scrollToCursor();
  }, [value, cursorPosition, onChange, readOnly, showSuggestions, filteredSuggestions, activeSuggestion, insertSuggestion, scrollToCursor]);

  // Insert a suggestion into the formula
  const insertSuggestion = useCallback(suggestion => {
    if (!suggestion) return;

    // Find the start position of the current word
    let start = cursorPosition;
    while (start > 0 && /[a-zA-Z0-9_]/.test(value[start - 1])) {
      start--;
    }

    // Build function call with proper number of arguments
    const argCount = suggestion.params ? suggestion.params.length : 0;
    let args = [];

    // Create placeholder arguments based on parameter count and types
    if (suggestion.params) {
      args = suggestion.params.map(param => {
        // Skip var args parameters (they're optional)
        if (param.isVarArgs) return '';
        // Return empty string for optional parameters
        if (param.isOptional) return '';

        // Create appropriate placeholder based on type
        if (Array.isArray(param.type)) {
          return param.type[0] === 'string' ? '""' : '0';
        }
        switch (param.type) {
          case 'string':
            return '""';
          case 'number':
            return '0';
          case 'boolean':
            return 'false';
          case 'date':
            return 'now()';
          case 'array':
            return '[]';
          case 'object':
            return '{}';
          default:
            return '';
        }
      }).filter(arg => arg !== ''); // Filter out empty args (for var args)
    }
    const argsStr = args.join(', ');
    // Replace the current word with the suggestion and add parentheses with arguments
    const insertText = `${suggestion.name}(${argsStr})`;
    const newValue = value.substring(0, start) + insertText + value.substring(cursorPosition);
    onChange(newValue);

    // Position cursor inside the parentheses if there are no arguments,
    // or at the end if there are arguments
    const newCursorPosition = start + suggestion.name.length + 1 + (args.length ? 0 : 0);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.selectionStart = newCursorPosition;
        editorRef.current.selectionEnd = newCursorPosition;
        setCursorPosition(newCursorPosition);
      }
    }, 0);
    setShowSuggestions(false);
  }, [value, cursorPosition, onChange]);

  // Use click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = e => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return <div className="formula-editor-container">
      <div className="formula-editor-wrapper">
        <div className="syntax-highlight-container">
          <div className="syntax-highlight" ref={highlightedContentRef} />
          <textarea ref={editorRef} className={`formula-editor-textarea ${validation?.isValid ? '' : 'has-errors'}`} value={value} onChange={handleChange} onSelect={handleSelect} onKeyDown={handleKeyDown} disabled={readOnly} placeholder="Enter your formula here..." rows={5} spellCheck={false} data-testid="formula-editor" />

        </div>
      </div>
      
      {!validation?.isValid && validation?.errors?.length > 0 && <div className="formula-editor-errors">
          {validation.errors.map((error, index) => <div key={index} className="formula-editor-error">
              {error.message}
              {error.position !== undefined && <span className="formula-editor-error-position"> at position {error.position}</span>}

            </div>)}

        </div>}

      
      {showSuggestions && filteredSuggestions.length > 0 && <div className="formula-editor-suggestions" ref={suggestionsRef}>
          {filteredSuggestions.slice(0, 7).map((suggestion, index) => <div key={index} className={`formula-editor-suggestion ${index === activeSuggestion ? 'active' : ''}`} onClick={() => insertSuggestion(suggestion)} onMouseEnter={() => setActiveSuggestion(index)}>

              <div className="suggestion-header">
                <span className="suggestion-name">{suggestion.name}</span>
                <span className="suggestion-category">{suggestion.category}</span>
              </div>
              <div className="suggestion-description">{suggestion.description}</div>
              {suggestion.params && suggestion.params.length > 0 && <div className="suggestion-params">
                  <span className="params-label">Parameters:</span>
                  <ul className="params-list">
                    {suggestion.params.map((param, paramIndex) => <li key={paramIndex} className="param-item">
                        <span className="param-name">{param.name}</span>
                        <span className="param-type">
                          {Array.isArray(param.type) ? param.type.join('|') : param.type}
                          {param.isOptional && ' (optional)'}
                          {param.isVarArgs && ' (multiple)'}
                        </span>
                        <span className="param-description">{param.description}</span>
                      </li>)}

                  </ul>
                </div>}

              {suggestion.examples && suggestion.examples.length > 0 && <div className="suggestion-examples">
                  <span className="examples-label">Examples:</span>
                  <ul className="examples-list">
                    {suggestion.examples.map((example, exampleIndex) => <li key={exampleIndex} className="example-item">{example}</li>)}

                  </ul>
                </div>}

            </div>)}

          {filteredSuggestions.length > 7 && <div className="formula-editor-more-suggestions">
              {filteredSuggestions.length - 7} more suggestions available...
            </div>}

        </div>}

    </div>;
};
FormulaEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  validation: PropTypes.shape({
    isValid: PropTypes.bool.isRequired,
    errors: PropTypes.arrayOf(PropTypes.shape({
      message: PropTypes.string.isRequired,
      position: PropTypes.number
    }))
  }),
  suggestions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    params: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
      description: PropTypes.string,
      isOptional: PropTypes.bool,
      isVarArgs: PropTypes.bool
    })),
    examples: PropTypes.arrayOf(PropTypes.string)
  }))
};
FormulaEditor.defaultProps = {
  readOnly: false,
  validation: {
    isValid: true,
    errors: []
  },
  suggestions: []
};
export default FormulaEditor;