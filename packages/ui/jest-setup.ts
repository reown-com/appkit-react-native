// Import shared setup
import '@shared-jest-setup';

// Import the mockThemeContext function from shared setup
import { mockThemeContext, mockUseTheme } from '@shared-jest-setup';

// Apply UI-specific mocks
mockThemeContext('../src/context/ThemeContext');
mockUseTheme('../src/hooks/useTheme');

// Add any other UI-specific mocks here if needed
