import { useState, useEffect } from 'react';

export function useProctoring({ enabled = false, onViolation = () => {} }) {
  const [violations, setViolations] = useState([]);
  const [warningsCount, setWarningsCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    // 1. Tab switch / Visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const v = { type: 'TAB_SWITCH', timestamp: new Date().toLocaleTimeString(), message: 'Navigated away from exam tab' };
        setViolations(prev => [...prev, v]);
        setWarningsCount(c => c + 1);
        onViolation(v);
      }
    };

    // 2. Prevent Copy/Paste
    const handleCopyPaste = (e) => {
      e.preventDefault();
      const v = { type: 'COPY_PASTE_PREVENTED', timestamp: new Date().toLocaleTimeString(), message: 'Copy/Paste is disabled during exam' };
      setViolations(prev => [...prev, v]);
      onViolation(v);
    };

    // 3. Prevent Right-Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enabled, onViolation]);

  return { violations, warningsCount };
}
