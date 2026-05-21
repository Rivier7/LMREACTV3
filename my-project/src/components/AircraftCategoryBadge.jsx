/**
 * AircraftCategoryBadge - Displays aircraft category as a colored badge
 *
 * Categories:
 * - NARROW_BODY: Boeing single-aisle (blue)
 * - WIDE_BODY: Twin-aisle aircraft (purple)
 * - AIRBUS_NARROW_BODY: Airbus single-aisle (indigo)
 * - REGIONAL: Small jets/turboprops (green)
 * - FREIGHTER: Cargo aircraft (amber)
 * - UNKNOWN: Unrecognized type (gray)
 */

const categoryConfig = {
  NARROW_BODY: {
    label: 'Narrow Body',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  WIDE_BODY: {
    label: 'Wide Body',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  AIRBUS_NARROW_BODY: {
    label: 'Airbus',
    className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  REGIONAL: {
    label: 'Regional',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  FREIGHTER: {
    label: 'Freighter',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  UNKNOWN: {
    label: 'Unknown',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

/**
 * Get the display label for a category
 */
export function getCategoryLabel(category) {
  return categoryConfig[category]?.label || categoryConfig.UNKNOWN.label;
}

/**
 * Get the Tailwind classes for a category
 */
export function getCategoryClassName(category) {
  return categoryConfig[category]?.className || categoryConfig.UNKNOWN.className;
}

/**
 * AircraftCategoryBadge component
 *
 * @param {Object} props
 * @param {string} props.category - The aircraft category (e.g., "NARROW_BODY", "WIDE_BODY")
 * @param {string} [props.size="sm"] - Badge size: "xs", "sm", or "md"
 * @param {string} [props.className] - Additional CSS classes
 */
export default function AircraftCategoryBadge({ category, size = 'sm', className = '' }) {
  if (!category) return null;

  const config = categoryConfig[category] || categoryConfig.UNKNOWN;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${sizeClasses[size]} ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

/**
 * AircraftWithCategory - Displays aircraft code with its category badge
 *
 * @param {Object} props
 * @param {string} props.aircraftCode - The aircraft code (e.g., "B738")
 * @param {string} props.category - The aircraft category
 * @param {string} [props.size="sm"] - Badge size
 */
export function AircraftWithCategory({ aircraftCode, category, size = 'sm' }) {
  if (!aircraftCode) return <span className="text-gray-400">-</span>;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-semibold text-gray-800">{aircraftCode}</span>
      {category && <AircraftCategoryBadge category={category} size={size} />}
    </span>
  );
}
