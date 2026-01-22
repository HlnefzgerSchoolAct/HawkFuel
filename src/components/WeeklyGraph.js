/**
 * WeeklyGraph Component
 *
 * Purpose: Display 7-day line graph showing calorie trends
 *
 * What it shows:
 * - Red line: Calories eaten per day
 * - Orange line: Calories burned per day
 * - Blue dashed line: Target calories (goal)
 *
 * Library: Chart.js (simple, popular charting library)
 * Wrapper: react-chartjs-2 (makes Chart.js work with React)
 */

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getWeeklyGraphData } from "../utils/localStorage";
import "./WeeklyGraph.css";

/**
 * Register Chart.js Components
 *
 * Chart.js requires you to "register" which features you want to use
 * This keeps the library lightweight (only loads what you need)
 *
 * What we're registering:
 * - CategoryScale: X-axis (days of week)
 * - LinearScale: Y-axis (calorie numbers)
 * - PointElement: Dots on the line
 * - LineElement: The lines connecting dots
 * - Title: Chart title
 * - Tooltip: Hover info boxes
 * - Legend: Color key at top
 * - Filler: Shaded area under lines
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

/**
 * WeeklyGraph Component
 *
 * @param {Function} onRefresh - Callback to refresh data (passed from parent)
 */
function WeeklyGraph({ onRefresh }) {
  // STATE: Holds the graph data
  const [graphData, setGraphData] = useState(null);
  const [exporting, setExporting] = useState(false);

  // REF: Reference to the graph container for export
  const graphRef = useRef(null);

  /**
   * useEffect Hook
   *
   * Loads graph data when component first renders
   * Also re-loads when onRefresh changes
   */
  useEffect(() => {
    loadGraphData();
  }, [onRefresh]);

  /**
   * loadGraphData
   *
   * Fetches data from localStorage and formats it for Chart.js
   */
  const loadGraphData = () => {
    const data = getWeeklyGraphData();
    setGraphData(data);
  };

  /**
   * exportToImage
   *
   * Exports the graph as a PNG image
   * Uses html2canvas to capture the graph as an image
   */
  const exportToImage = async () => {
    if (!graphRef.current) return;

    setExporting(true);

    try {
      // Capture the graph as a canvas
      const canvas = await html2canvas(graphRef.current, {
        backgroundColor: "#0A0A0A",
        scale: 2, // Higher quality (2x resolution)
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const date = new Date().toLocaleDateString("en-US").replace(/\//g, "-");
        link.download = `hawk-fuel-progress-${date}.png`;
        link.href = url;
        link.click();

        // Cleanup
        URL.revokeObjectURL(url);
        setExporting(false);
      });
    } catch (error) {
      console.error("Error exporting graph:", error);
      alert("Failed to export graph. Please try again.");
      setExporting(false);
    }
  };

  /**
   * Chart Options
   *
   * Configures how the chart looks and behaves
   *
   * These settings control:
   * - Responsive behavior
   * - Animations
   * - Axis labels
   * - Tooltip formatting
   * - Legend position
   */
  const options = {
    responsive: true, // Resize with container
    maintainAspectRatio: true, // Keep proportions
    aspectRatio: 2, // Width to height ratio (2:1)

    plugins: {
      // LEGEND - Color key at top
      legend: {
        position: "top",
        labels: {
          usePointStyle: true, // Circle instead of rectangle
          padding: 15,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },

      // TITLE - Chart heading
      title: {
        display: true,
        text: "7-Day Calorie Trends",
        font: {
          size: 18,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },

      // TOOLTIP - Hover boxes
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          // Format tooltip text
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            // Add comma separator for thousands
            label += context.parsed.y.toLocaleString() + " cal";
            return label;
          },
        },
      },
    },

    // SCALES - X and Y axes
    scales: {
      // Y-AXIS (vertical - calorie numbers)
      y: {
        beginAtZero: true, // Start at 0
        ticks: {
          // Format numbers with commas
          callback: function (value) {
            return value.toLocaleString() + " cal";
          },
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)", // Light grid lines
        },
      },

      // X-AXIS (horizontal - days of week)
      x: {
        ticks: {
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          display: false, // No vertical grid lines
        },
      },
    },

    // INTERACTION
    interaction: {
      mode: "index", // Show all datasets on hover
      intersect: false, // Don't need to hover exactly on line
    },
  };

  // RENDER
  return (
    <div className="weekly-graph" ref={graphRef}>
      <div className="graph-header-with-export">
        <h3>7-Day Calorie Trends</h3>
        <button
          className="btn-export"
          onClick={exportToImage}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Save as Image"}
        </button>
      </div>

      <div className="graph-container">
        {graphData ? (
          // Show graph when data is loaded
          <Line data={graphData} options={options} />
        ) : (
          // Show loading message while fetching data
          <div className="graph-loading">
            <p>Loading graph data...</p>
          </div>
        )}
      </div>

      {/* EXPLANATION SECTION */}
      <div className="graph-info">
        <h4>How to Read This Graph</h4>
        <div className="graph-legend-items">
          <div className="legend-item">
            <span className="legend-color eaten"></span>
            <strong>Red Line (Eaten):</strong> Total calories consumed each day
          </div>
          <div className="legend-item">
            <span className="legend-color burned"></span>
            <strong>Orange Line (Burned):</strong> Calories burned through
            exercise
          </div>
          <div className="legend-item">
            <span className="legend-color target"></span>
            <strong>Blue Dashed Line (Target):</strong> Your daily calorie goal
          </div>
        </div>
        <p className="graph-tip">
          <strong>Tip:</strong> Hover over any point to see exact values!
        </p>
      </div>
    </div>
  );
}

export default WeeklyGraph;

/**
 * DATA STRUCTURE EXPLANATION
 * ==========================
 *
 * 1. STORAGE IN LOCALSTORAGE
 * ---------------------------
 * Saved under key: 'hawkfuel_weekly_history'
 * Format: JSON object with dates as keys
 *
 * Example:
 * {
 *   "2026-01-16": { eaten: 2100, burned: 450, target: 2000 },
 *   "2026-01-17": { eaten: 1950, burned: 300, target: 2000 },
 *   "2026-01-18": { eaten: 2200, burned: 500, target: 2000 },
 *   "2026-01-19": { eaten: 1800, burned: 200, target: 2000 },
 *   "2026-01-20": { eaten: 2050, burned: 400, target: 2000 },
 *   "2026-01-21": { eaten: 1900, burned: 350, target: 2000 },
 *   "2026-01-22": { eaten: 2000, burned: 300, target: 2000 }
 * }
 *
 * 2. PROCESSING FOR CHART.JS
 * ---------------------------
 * getWeeklyGraphData() converts above to Chart.js format:
 *
 * {
 *   labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'],
 *   datasets: [
 *     {
 *       label: 'Calories Eaten',
 *       data: [2100, 1950, 2200, 1800, 2050, 1900, 2000],
 *       borderColor: 'rgb(231, 76, 60)',
 *       backgroundColor: 'rgba(231, 76, 60, 0.1)',
 *       tension: 0.3
 *     },
 *     {
 *       label: 'Calories Burned',
 *       data: [450, 300, 500, 200, 400, 350, 300],
 *       borderColor: 'rgb(243, 156, 18)',
 *       backgroundColor: 'rgba(243, 156, 18, 0.1)',
 *       tension: 0.3
 *     },
 *     {
 *       label: 'Target Calories',
 *       data: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
 *       borderColor: 'rgb(52, 152, 219)',
 *       backgroundColor: 'rgba(52, 152, 219, 0.1)',
 *       tension: 0.3,
 *       borderDash: [5, 5]
 *     }
 *   ]
 * }
 *
 * 3. DATA UPDATE FLOW
 * -------------------
 *
 * User logs food → saveDailyDataToHistory() called
 *                   ↓
 *              Calculates today's totals (eaten, burned, target)
 *                   ↓
 *              Loads existing weekly history
 *                   ↓
 *              Updates/adds today's data
 *                   ↓
 *              Keeps only last 7 days (removes older)
 *                   ↓
 *              Saves back to localStorage
 *                   ↓
 *              Graph component refreshes
 *                   ↓
 *              User sees updated graph!
 *
 * 4. MISSING DATA HANDLING
 * ------------------------
 * If a day has no data (user didn't log anything):
 * - That day shows 0 for all values
 * - Graph line dips to 0
 * - User can see gaps in their tracking
 *
 * 5. WHY LAST 7 DAYS?
 * -------------------
 * - Weekly trends are meaningful
 * - Not too much data (keeps graph readable)
 * - Keeps localStorage usage low
 * - Easy to see patterns
 *
 * 6. DATE FORMAT
 * --------------
 * We use ISO date format (YYYY-MM-DD) because:
 * - Sorts correctly alphabetically
 * - Unambiguous (no confusion like MM/DD vs DD/MM)
 * - Standard format
 * - Works across timezones
 */
