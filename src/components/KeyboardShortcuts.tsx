import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { tapFeedback } from '@/utils/haptics';

interface Shortcut {
  keys: string[];
  label: string;
  action: () => void;
}

const KeyboardShortcuts: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const shortcuts: Shortcut[] = [
    { keys: ['Ctrl', 'U'], label: 'Upload document', action: () => navigate('/upload') },
    { keys: ['Ctrl', '/'], label: 'Focus chat input', action: () => { navigate('/chat'); setTimeout(() => document.querySelector<HTMLInputElement>('input[placeholder]')?.focus(), 300); } },
    { keys: ['Ctrl', 'H'], label: 'Analysis history', action: () => navigate('/history') },
    { keys: ['Ctrl', 'K'], label: 'AI Chat', action: () => navigate('/chat') },
    { keys: ['Ctrl', 'P'], label: 'Portfolio', action: () => navigate('/portfolio') },
    { keys: ['Ctrl', 'L'], label: 'Learn', action: () => navigate('/learn') },
    { keys: ['?'], label: 'Show shortcuts', action: () => setOpen(true) },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't fire in inputs/textareas
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Only handle ? in this case if it's not an input
      return;
    }

    // ? key (no modifiers)
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setOpen(prev => !prev);
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      const match = shortcuts.find(s => {
        if (s.keys.length === 2 && (s.keys[0] === 'Ctrl')) {
          return s.keys[1].toLowerCase() === key;
        }
        return false;
      });

      if (match) {
        e.preventDefault();
        tapFeedback();
        match.action();
        setOpen(false);
      }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <>
      {/* Floating ? button */}
      <button
        onClick={() => { tapFeedback(); setOpen(true); }}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-muted border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-all duration-200 hover:scale-110"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 pt-2">
            {shortcuts.map((shortcut, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm text-foreground">{shortcut.label}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, j) => (
                    <React.Fragment key={j}>
                      {j > 0 && <span className="text-muted-foreground text-xs">+</span>}
                      <kbd className="px-2 py-1 text-xs font-mono rounded border border-border bg-muted text-muted-foreground shadow-sm">
                        {key === 'Ctrl' ? modKey : key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border mt-2">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono rounded border border-border bg-muted">?</kbd> anywhere to toggle this panel
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KeyboardShortcuts;
