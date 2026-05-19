import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';

const optionConfig = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'alternative', label: 'Alternative' },
];

const formatLocation = location =>
  [location?.city, location?.state, location?.country].filter(Boolean).join(', ') || 'Unknown location';

function RouteLaneCard({ group, renderOption, isOpen = false, onToggle }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
              Route
            </p>
            <h2 className="text-sm font-semibold text-slate-800 leading-snug flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500">{formatLocation(group.origin)}</span>
              <ChevronRight size={14} className="text-slate-400 shrink-0" />
              <MapPin size={13} className="text-blue-500 shrink-0" />
              <span>{formatLocation(group.destination)}</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
              {group.totalOptions} option{group.totalOptions === 1 ? '' : 's'}
            </span>
            {optionConfig.map(({ key, label }) => (
              <span
                key={key}
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  group[key]
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-100 text-gray-400'
                }`}
              >
                {label}
              </span>
            ))}
            <span className="text-slate-400">
              {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {optionConfig.map(({ key, label }) => {
            const lane = group[key];
            return (
              <div key={key} className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="px-5 pt-4">
                  <span className="inline-flex items-center rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                    {label}
                  </span>
                  {!lane && (
                    <span className="ml-3 text-sm text-gray-400">No {label} option available</span>
                  )}
                </div>
                {lane && (
                  <div className="px-5 pb-5 pt-3">
                    {renderOption(lane)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RouteLaneCard;
