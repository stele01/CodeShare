import { NavigateFunction } from 'react-router-dom';

/**
 * Handles navigation with support for Ctrl/Cmd + Click to open in a new tab.
 * @param e Mouse event
 * @param url The target URL
 * @param navigate The React Router navigate function
 */
export function handleCtrlClickNavigation(
  e: React.MouseEvent,
  url: string,
  navigate: NavigateFunction
) {
  if (e.ctrlKey || e.metaKey) {
    window.open(url, '_blank');
  } else {
    navigate(url);
  }
} 