/**
 * Theme type definitions for design system
 */

/**
 * Color palettes
 */
export interface ColorPalette {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

/**
 * Typography variants
 */
export interface TypographyVariants {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
  subtitle1: TypographyStyle;
  subtitle2: TypographyStyle;
  body1: TypographyStyle;
  body2: TypographyStyle;
  button: TypographyStyle;
  caption: TypographyStyle;
  overline: TypographyStyle;
}

/**
 * Typography style properties
 */
export interface TypographyStyle {
  fontFamily: string;
  fontSize: string | number;
  fontWeight: number;
  lineHeight: string | number;
  letterSpacing?: string | number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

/**
 * Design system tokens
 */
export interface ThemeTokens {
  // Colors
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    error: ColorPalette;
    warning: ColorPalette;
    info: ColorPalette;
    success: ColorPalette;
    grey: Record<number, string>;
    common: {
      black: string;
      white: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    background: {
      paper: string;
      default: string;
    };
    action: {
      active: string;
      hover: string;
      selected: string;
      disabled: string;
      disabledBackground: string;
    };
  };
  
  // Typography
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeightLight: number;
    fontWeightRegular: number;
    fontWeightMedium: number;
    fontWeightBold: number;
  } & TypographyVariants;
  
  // Spacing
  spacing: (factor: number) => number | string;
  
  // Shapes
  shape: {
    borderRadius: number;
  };
  
  // Shadows
  shadows: string[];
  
  // Z-index
  zIndex: {
    mobileStepper: number;
    speedDial: number;
    appBar: number;
    drawer: number;
    modal: number;
    snackbar: number;
    tooltip: number;
  };
  
  // Transitions
  transitions: {
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
      sharp: string;
    };
    duration: {
      shortest: number;
      shorter: number;
      short: number;
      standard: number;
      complex: number;
      enteringScreen: number;
      leavingScreen: number;
    };
  };
  
  // Breakpoints
  breakpoints: {
    values: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    up: (key: string) => string;
    down: (key: string) => string;
    between: (start: string, end: string) => string;
  };
}

/**
 * Theme object interface
 */
export interface Theme {
  tokens: ThemeTokens;
  palette: ThemeTokens['colors'];
  typography: ThemeTokens['typography'];
  spacing: ThemeTokens['spacing'];
  shape: ThemeTokens['shape'];
  shadows: ThemeTokens['shadows'];
  zIndex: ThemeTokens['zIndex'];
  transitions: ThemeTokens['transitions'];
  breakpoints: ThemeTokens['breakpoints'];
}

/**
 * Theme context interface
 */
export interface ThemeContextInterface {
  theme: Theme;
  toggleTheme?: () => void;
}