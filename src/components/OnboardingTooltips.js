/**
 * Onboarding Tooltips / Coach Marks
 * Guides new users through app features
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Lightbulb } from "lucide-react";
import { haptics } from "../utils/haptics";
import "./OnboardingTooltips.css";

/**
 * Default tooltips for the app
 */
export const APP_TOOLTIPS = {
  // Home page
  CALORIE_RING: {
    id: "calorie_ring",
    title: "Daily Progress",
    content:
      "This ring shows your daily calorie progress. Tap it to see detailed macros.",
    position: "bottom",
  },
  ADD_FOOD_BUTTON: {
    id: "add_food_button",
    title: "Quick Add",
    content:
      "Tap here to quickly log food. You can also use Ctrl+N as a shortcut.",
    position: "top",
  },
  STREAK_COUNTER: {
    id: "streak_counter",
    title: "Logging Streak",
    content:
      "Track how many consecutive days you've logged. Keep the streak alive!",
    position: "bottom",
  },
  SWIPE_TO_DELETE: {
    id: "swipe_to_delete",
    title: "Swipe Actions",
    content: "Swipe left on any food item to delete it, or right to edit.",
    position: "top",
  },

  // Log page
  MEAL_SECTIONS: {
    id: "meal_sections",
    title: "Organized Meals",
    content:
      "Your foods are organized by meal. Tap a section to expand or collapse.",
    position: "bottom",
  },
  COPY_MEALS: {
    id: "copy_meals",
    title: "Copy Previous Meals",
    content:
      "Had the same breakfast? Copy meals from previous days with one tap.",
    position: "top",
  },

  // Search
  BARCODE_SCAN: {
    id: "barcode_scan",
    title: "Scan Barcodes",
    content: "Quickly add packaged foods by scanning their barcode.",
    position: "bottom",
  },
  AI_SEARCH: {
    id: "ai_search",
    title: "AI Food Search",
    content:
      "Can't find a food? Describe it in natural language and AI will estimate nutrition.",
    position: "bottom",
  },
};

/**
 * Context for tooltip state management
 */
const TooltipContext = createContext(null);

/**
 * Tooltip Provider
 */
export const TooltipProvider = ({ children }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [completedTooltips, setCompletedTooltips] = useState(() => {
    try {
      const stored = localStorage.getItem("nutrinoteplus_tooltips_completed");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isEnabled, setIsEnabled] = useState(true);

  // Save completed tooltips
  useEffect(() => {
    try {
      localStorage.setItem(
        "nutrinoteplus_tooltips_completed",
        JSON.stringify(completedTooltips),
      );
    } catch {
      // Storage error
    }
  }, [completedTooltips]);

  // Show tooltip if not already completed
  const showTooltip = useCallback(
    (tooltip, targetRef) => {
      if (!isEnabled || completedTooltips.includes(tooltip.id)) {
        return false;
      }
      setActiveTooltip({ ...tooltip, targetRef });
      return true;
    },
    [isEnabled, completedTooltips],
  );

  // Dismiss tooltip
  const dismissTooltip = useCallback(
    (markComplete = true) => {
      if (activeTooltip && markComplete) {
        setCompletedTooltips((prev) => [...prev, activeTooltip.id]);
        haptics.light();
      }
      setActiveTooltip(null);
    },
    [activeTooltip],
  );

  // Check if tooltip was completed
  const isCompleted = useCallback(
    (tooltipId) => completedTooltips.includes(tooltipId),
    [completedTooltips],
  );

  // Reset all tooltips (for testing or user request)
  const resetTooltips = useCallback(() => {
    setCompletedTooltips([]);
    setActiveTooltip(null);
  }, []);

  const value = {
    activeTooltip,
    showTooltip,
    dismissTooltip,
    isCompleted,
    isEnabled,
    setIsEnabled,
    resetTooltips,
    completedTooltips,
  };

  return (
    <TooltipContext.Provider value={value}>
      {children}
      <TooltipOverlay />
    </TooltipContext.Provider>
  );
};

/**
 * useTooltip hook
 */
export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within TooltipProvider");
  }
  return context;
};

/**
 * Tooltip trigger hook - shows tooltip on mount if not completed
 */
export const useTooltipTrigger = (tooltip, delay = 500) => {
  const targetRef = useRef(null);
  const { showTooltip, isCompleted } = useTooltip();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current || isCompleted(tooltip.id)) return;

    const timer = setTimeout(() => {
      if (targetRef.current && !hasShown.current) {
        const shown = showTooltip(tooltip, targetRef);
        if (shown) hasShown.current = true;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [tooltip, delay, showTooltip, isCompleted]);

  return targetRef;
};

/**
 * Tooltip Overlay Component
 */
const TooltipOverlay = () => {
  const { activeTooltip, dismissTooltip } = useTooltip();
  const [position, setPosition] = useState({ top: 0, left: 0, width: 280 });
  const [arrowPosition, setArrowPosition] = useState({ left: "50%" });

  // Calculate position based on target element
  useEffect(() => {
    if (!activeTooltip?.targetRef?.current) return;

    const updatePosition = () => {
      const target = activeTooltip.targetRef.current;
      const rect = target.getBoundingClientRect();
      const isNarrow = window.innerWidth < 400;
      const tooltipWidth = isNarrow ? Math.min(280, window.innerWidth - 32) : 280;
      const tooltipHeight = 140;
      const padding = 16;

      let top, left;
      const placement = activeTooltip.position || "bottom";

      if (placement === "bottom") {
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
      } else if (placement === "top") {
        top = rect.top - tooltipHeight - 12;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
      } else if (placement === "left") {
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 12;
      } else {
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 12;
      }

      // Clamp to viewport
      left = Math.max(
        padding,
        Math.min(left, window.innerWidth - tooltipWidth - padding),
      );
      top = Math.max(
        padding,
        Math.min(top, window.innerHeight - tooltipHeight - padding),
      );

      // Calculate arrow position
      const targetCenter = rect.left + rect.width / 2;
      const arrowLeft = Math.max(
        24,
        Math.min(targetCenter - left, tooltipWidth - 24),
      );

      setPosition({ top, left, width: tooltipWidth });
      setArrowPosition({ left: `${arrowLeft}px` });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [activeTooltip]);

  return (
    <AnimatePresence>
      {activeTooltip && (
        <>
          {/* Backdrop */}
          <motion.div
            className="tooltip-overlay__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dismissTooltip(true)}
          />

          {/* Spotlight on target */}
          {activeTooltip.targetRef?.current && (
            <TargetSpotlight target={activeTooltip.targetRef.current} />
          )}

          {/* Tooltip */}
          <motion.div
            className={`tooltip-overlay__tooltip tooltip-overlay__tooltip--${activeTooltip.position || "bottom"}`}
            style={{ top: position.top, left: position.left, width: position.width, maxWidth: "calc(100vw - 32px)" }}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            role="tooltip"
          >
            <div className="tooltip-overlay__arrow" style={arrowPosition} />

            <div className="tooltip-overlay__header">
              <Lightbulb size={16} aria-hidden="true" />
              <span className="tooltip-overlay__title">
                {activeTooltip.title}
              </span>
              <button
                className="tooltip-overlay__close"
                onClick={() => dismissTooltip(true)}
                aria-label="Dismiss tip"
              >
                <X size={16} />
              </button>
            </div>

            <p className="tooltip-overlay__content">{activeTooltip.content}</p>

            <button
              className="tooltip-overlay__action"
              onClick={() => dismissTooltip(true)}
            >
              Got it <ChevronRight size={16} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Target Spotlight Component
 */
const TargetSpotlight = ({ target }) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const update = () => {
      const r = target.getBoundingClientRect();
      setRect({
        top: r.top - 4,
        left: r.left - 4,
        width: r.width + 8,
        height: r.height + 8,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [target]);

  if (!rect) return null;

  return (
    <motion.div
      className="tooltip-overlay__spotlight"
      style={rect}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  );
};

/**
 * Feature Highlight Component
 * Inline component to mark new features
 */
export const FeatureHighlight = ({
  children,
  tooltip,
  badge = "New",
  showBadge = true,
}) => {
  const targetRef = useTooltipTrigger(tooltip, 1000);
  const { isCompleted } = useTooltip();

  const completed = isCompleted(tooltip.id);

  return (
    <div ref={targetRef} className="feature-highlight">
      {children}
      {showBadge && !completed && (
        <span className="feature-highlight__badge">{badge}</span>
      )}
    </div>
  );
};

export default TooltipProvider;
