import React from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';

/**
 * ThemeSwitcher component for toggling between light and dark themes
 */
export const ThemeSwitcher = ({
  showLabel = false,
  compact = false,
  labelLight = 'Light',
  labelDark = 'Dark',
  style = {},
  ...props
}) => {
  // Added display name
  ThemeSwitcher.displayName = 'ThemeSwitcher';

  // Added display name
  ThemeSwitcher.displayName = 'ThemeSwitcher';

  // Added display name
  ThemeSwitcher.displayName = 'ThemeSwitcher';

  // Added display name
  ThemeSwitcher.displayName = 'ThemeSwitcher';

  // Added display name
  ThemeSwitcher.displayName = 'ThemeSwitcher';


  const { theme, mode, toggleMode } = useTheme();
  const { colors, spacing } = theme;

  // Determine if we're in dark mode
  const isDarkMode = mode === 'dark';

  // Switch styles
  const switchWidth = compact ? 36 : 48;
  const switchHeight = compact ? 20 : 24;
  const handleSize = compact ? 16 : 20;
  const handleOffset = compact ? 2 : 2;
  const labelMargin = compact ? spacing.xs : spacing.sm;

  // Container styles
  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    ...style,
  };

  // Switch track styles
  const trackStyles = {
    position: 'relative',
    width: `${switchWidth}px`,
    height: `${switchHeight}px`,
    backgroundColor: isDarkMode ? colors.primary.main : colors.grey[300],
    borderRadius: `${switchHeight}px`,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
  };

  // Switch handle styles
  const handleStyles = {
    position: 'absolute',
    top: `${handleOffset}px`,
    left: isDarkMode ? `${switchWidth - handleSize - handleOffset}px` : `${handleOffset}px`,
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    backgroundColor: isDarkMode ? colors.common.white : colors.common.white,
    borderRadius: '50%',
    transition: 'left 0.2s ease-in-out',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
  };

  // Icons for light/dark mode
  const renderIcons = () => {
  // Added display name
  renderIcons.displayName = 'renderIcons';

  // Added display name
  renderIcons.displayName = 'renderIcons';

  // Added display name
  renderIcons.displayName = 'renderIcons';

  // Added display name
  renderIcons.displayName = 'renderIcons';

  // Added display name
  renderIcons.displayName = 'renderIcons';


    const iconSize = compact ? 10 : 12;
    const moonColor = isDarkMode ? colors.common.white : colors.grey[500];
    const sunColor = isDarkMode ? colors.grey[500] : colors.common.white;

    return (
      <>
        {/* Moon icon */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '25%',
            transform: 'translate(-50%, -50%)',
            color: moonColor,
            fontSize: `${iconSize}px`,
          }}
        >
          🌙
        </div>

        {/* Sun icon */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '25%',
            transform: 'translate(50%, -50%)',
            color: sunColor,
            fontSize: `${iconSize}px`,
          }}
        >
          ☀️
        </div>
      </>
    );
  };

  // Label styles
  const labelStyles = {
    marginLeft: labelMargin,
    fontSize: compact ? '0.875rem' : '1rem',
    color: colors.text.primary,
  };

  return (
    <Box display="flex&quot; alignItems="center" style={containerStyles} {...props}>
      <div
        role="switch&quot;
        aria-checked={isDarkMode}
        tabIndex={0}
        onClick={toggleMode}
        onKeyDown={e => {
          if (e.key === "Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMode();
          }
        }}
        style={trackStyles}
      >
        {renderIcons()}
        <div style={handleStyles} />
      </div>

      {showLabel && <span style={labelStyles}>{isDarkMode ? labelDark : labelLight}</span>}
    </Box>
  );
};

ThemeSwitcher.displayName = 'ThemeSwitcher';

export default ThemeSwitcher;
