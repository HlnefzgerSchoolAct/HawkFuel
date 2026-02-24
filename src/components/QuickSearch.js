/**
 * Quick Search Component
 * Command palette style search for foods, recipes, and navigation
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Apple,
  BookOpen,
  ChevronRight,
  Clock,
  Star,
  Home,
  ClipboardList,
  Settings,
  User,
  History,
  MessageCircle,
} from "lucide-react";
import { haptics } from "../utils/haptics";
import { loadRecentFoods } from "../utils/localStorage";
import { foodsDatabaseUSDA } from "../data/foods_usda_accurate";
import { foodsDatabaseExtended } from "../data/foods_extended_categories";
import "./QuickSearch.css";

/**
 * Search result categories
 */
const CATEGORIES = {
  NAVIGATION: "navigation",
  RECENT: "recent",
  FREQUENT: "frequent",
  FOOD: "food",
  RECIPE: "recipe",
};

/**
 * Navigation items
 */
const NAVIGATION_ITEMS = [
  { id: "home", name: "Home", path: "/", icon: Home },
  { id: "log", name: "Food Log", path: "/log", icon: ClipboardList },
  { id: "coach", name: "AI Coach", path: "/coach", icon: MessageCircle },
  { id: "history", name: "History", path: "/history", icon: History },
  { id: "recipes", name: "Recipes", path: "/recipes", icon: BookOpen },
  { id: "profile", name: "Profile", path: "/profile", icon: User },
  { id: "settings", name: "Settings", path: "/settings", icon: Settings },
];

/**
 * Debounce hook
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Quick Search Component
 */
export const QuickSearch = ({ isOpen, onClose, onSelect, onSelectFood }) => {
  const navigate = useNavigate();

  const defaultHandleSelect = useCallback(
    (item) => {
      if (item.type === "navigation") {
        navigate(item.path);
      } else if (item.type === "food") {
        onSelectFood?.(item);
      }
    },
    [navigate, onSelectFood],
  );

  const handleItemSelect = onSelect || defaultHandleSelect;
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 150);

  // Get recent and frequent foods
  const recentFoods = useMemo(() => {
    if (!isOpen) return [];
    return loadRecentFoods?.() || [];
  }, [isOpen]);

  const frequentFoods = useMemo(() => {
    if (!isOpen) return [];
    // Use recent foods as a proxy for frequent (take top 5 most used)
    const recent = loadRecentFoods?.() || [];
    return recent.slice(0, 5);
  }, [isOpen]);

  // Search results
  const results = useMemo(() => {
    const items = [];
    const searchTerm = debouncedQuery.toLowerCase().trim();

    // If no query, show recent/frequent/navigation
    if (!searchTerm) {
      // Navigation (show top 3)
      const navItems = NAVIGATION_ITEMS.slice(0, 3).map((item) => ({
        ...item,
        category: CATEGORIES.NAVIGATION,
        type: "navigation",
      }));
      items.push(...navItems);

      // Recent foods (show top 5)
      if (recentFoods.length > 0) {
        const recent = recentFoods.slice(0, 5).map((food) => ({
          ...food,
          id: `recent-${food.id || food.name}`,
          category: CATEGORIES.RECENT,
          type: "food",
        }));
        items.push(...recent);
      }

      // Frequent foods (show top 5)
      if (frequentFoods.length > 0) {
        const frequent = frequentFoods.slice(0, 5).map((food) => ({
          ...food,
          id: `frequent-${food.id || food.name}`,
          category: CATEGORIES.FREQUENT,
          type: "food",
        }));
        items.push(...frequent);
      }

      return items;
    }

    // Search navigation
    const matchingNav = NAVIGATION_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.path.includes(searchTerm),
    ).map((item) => ({
      ...item,
      category: CATEGORIES.NAVIGATION,
      type: "navigation",
    }));
    items.push(...matchingNav);

    // Search foods
    const allFoods = [
      ...(foodsDatabaseUSDA || []),
      ...(foodsDatabaseExtended || []),
    ];
    const matchingFoods = allFoods
      .filter((food) => {
        const name = (food.name || food.food_name || "").toLowerCase();
        const category = (food.category || "").toLowerCase();
        return name.includes(searchTerm) || category.includes(searchTerm);
      })
      .slice(0, 15)
      .map((food) => ({
        ...food,
        id: `food-${food.id || food.name || food.food_name}`,
        name: food.name || food.food_name,
        category: CATEGORIES.FOOD,
        type: "food",
      }));
    items.push(...matchingFoods);

    return items;
  }, [debouncedQuery, recentFoods, frequentFoods]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedItem = listRef.current.children[selectedIndex];
    selectedItem?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Handle item selection
  const handleSelect = useCallback(
    (item) => {
      haptics.selection();
      handleItemSelect(item);
      onClose();
    },
    [handleItemSelect, onClose],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev,
          );
          haptics.selection();
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          haptics.selection();
          break;
        case "Enter":
          event.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [results, selectedIndex, handleSelect, onClose],
  );

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups = {};
    results.forEach((item, index) => {
      const cat = item.category;
      if (!groups[cat]) {
        groups[cat] = { items: [], startIndex: index };
      }
      groups[cat].items.push({ ...item, absoluteIndex: index });
    });
    return groups;
  }, [results]);

  // Category labels
  const getCategoryLabel = (category) => {
    switch (category) {
      case CATEGORIES.NAVIGATION:
        return "Navigation";
      case CATEGORIES.RECENT:
        return "Recently Added";
      case CATEGORIES.FREQUENT:
        return "Frequently Used";
      case CATEGORIES.FOOD:
        return "Foods";
      case CATEGORIES.RECIPE:
        return "Recipes";
      default:
        return "";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="quick-search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Quick search"
        >
          <motion.div
            className="quick-search__panel"
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="quick-search__input-wrapper">
              <Search
                size={20}
                className="quick-search__icon"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="text"
                className="quick-search__input"
                placeholder="Search foods, recipes, or navigate..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search"
                aria-autocomplete="list"
                aria-controls="quick-search-results"
              />
              {query && (
                <button
                  className="quick-search__clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Results */}
            <div
              ref={listRef}
              id="quick-search-results"
              className="quick-search__results"
              role="listbox"
            >
              {results.length === 0 && debouncedQuery && (
                <div className="quick-search__empty">
                  <p>No results for "{debouncedQuery}"</p>
                </div>
              )}

              {Object.entries(groupedResults).map(([category, group]) => (
                <div key={category} className="quick-search__group">
                  <div className="quick-search__group-label">
                    {getCategoryLabel(category)}
                  </div>
                  {group.items.map((item) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      isSelected={selectedIndex === item.absoluteIndex}
                      onSelect={() => handleSelect(item)}
                      onHover={() => setSelectedIndex(item.absoluteIndex)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="quick-search__footer">
              <span>
                <kbd>↑↓</kbd> Navigate
              </span>
              <span>
                <kbd>↵</kbd> Select
              </span>
              <span>
                <kbd>Esc</kbd> Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Search Result Item
 */
const SearchResultItem = ({ item, isSelected, onSelect, onHover }) => {
  const getIcon = () => {
    if (item.type === "navigation") {
      const Icon = item.icon || ChevronRight;
      return <Icon size={18} />;
    }
    if (item.category === CATEGORIES.RECENT) return <Clock size={18} />;
    if (item.category === CATEGORIES.FREQUENT) return <Star size={18} />;
    if (item.type === "recipe") return <BookOpen size={18} />;
    return <Apple size={18} />;
  };

  const getDetail = () => {
    if (item.type === "navigation") return item.path;
    if (item.calories)
      return `${item.calories} cal • ${item.serving || "1 serving"}`;
    return item.serving || "";
  };

  return (
    <div
      className={`quick-search__item ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      role="option"
      aria-selected={isSelected}
    >
      <div className="quick-search__item-icon">{getIcon()}</div>
      <div className="quick-search__item-content">
        <span className="quick-search__item-name">{item.name}</span>
        {getDetail() && (
          <span className="quick-search__item-detail">{getDetail()}</span>
        )}
      </div>
      <ChevronRight size={16} className="quick-search__item-arrow" />
    </div>
  );
};

/**
 * useQuickSearch hook
 */
export const useQuickSearch = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    haptics.light();
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for keyboard shortcut
  useEffect(() => {
    const handler = () => open();
    document.addEventListener("shortcut:search", handler);
    return () => document.removeEventListener("shortcut:search", handler);
  }, [open]);

  return { isOpen, open, close };
};

export default QuickSearch;
