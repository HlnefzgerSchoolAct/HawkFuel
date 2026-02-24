/**
 * Skip Links Component
 * Provides keyboard users a way to skip navigation and go directly to main content
 */

import React from "react";
import "./SkipLinks.css";

const DEFAULT_LINKS = [
  { target: "main-content", label: "Skip to main content" },
  { target: "navigation", label: "Skip to navigation" },
];

/**
 * Skip Links Component
 * Place at the top of your app, before any other content
 * @param {Object} props
 * @param {Array<{target: string, label: string}>} [props.links] - Optional custom skip links
 */
export const SkipLinks = ({ links = DEFAULT_LINKS }) => {
  const items = Array.isArray(links) && links.length > 0 ? links : DEFAULT_LINKS;

  return (
    <nav className="skip-links" aria-label="Skip links">
      {items.map((link) => (
        <a
          key={link.target}
          href={`#${link.target}`}
          className="skip-link"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

/**
 * Main content landmark wrapper
 * Use this to wrap your main page content
 */
export const MainContent = ({ children, className = "" }) => {
  return (
    <main
      id="main-content"
      className={`main-content ${className}`}
      tabIndex={-1}
      role="main"
    >
      {children}
    </main>
  );
};

/**
 * Live Region for Screen Reader Announcements
 * Announces dynamic content changes to screen readers
 */
export const LiveRegion = ({ message, politeness = "polite" }) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only live-region"
    >
      {message}
    </div>
  );
};

/**
 * Hook to announce messages to screen readers
 */
export const useAnnounce = () => {
  const [announcement, setAnnouncement] = React.useState("");

  const announce = React.useCallback((message, clearAfter = 1000) => {
    // Clear first to ensure re-announcement of same message
    setAnnouncement("");

    // Small delay to ensure screen reader picks up change
    setTimeout(() => {
      setAnnouncement(message);

      // Clear after timeout
      if (clearAfter > 0) {
        setTimeout(() => setAnnouncement(""), clearAfter);
      }
    }, 50);
  }, []);

  return { announcement, announce };
};

/**
 * Focus Trap Component
 * Traps focus within a container, useful for modals and dialogs
 */
export const FocusTrap = ({ children, active = true, restoreFocus = true }) => {
  const containerRef = React.useRef(null);
  const previousFocusRef = React.useRef(null);

  React.useEffect(() => {
    if (!active) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus first focusable element
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (event) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, restoreFocus]);

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  );
};

/**
 * Get all focusable elements within a container
 */
const getFocusableElements = (container) => {
  if (!container) return [];

  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  return Array.from(container.querySelectorAll(selector)).filter(
    (el) => !el.closest("[aria-hidden='true']"),
  );
};

/**
 * Visually Hidden Text Component
 * Text that is hidden visually but accessible to screen readers
 */
export const VisuallyHidden = ({ children, as: Component = "span" }) => {
  return <Component className="sr-only">{children}</Component>;
};

export default SkipLinks;
