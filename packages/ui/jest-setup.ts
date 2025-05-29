// Import shared setup
import '@shared-jest-setup';

// Import the mockThemeContext function from shared setup
// eslint-disable-next-line no-duplicate-imports
import { mockThemeContext, mockUseTheme } from '@shared-jest-setup';

// Apply UI-specific mocks
mockThemeContext('../src/context/ThemeContext');
mockUseTheme('../src/hooks/useTheme');

// Add any other UI-specific mocks here if needed
