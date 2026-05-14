import { useState } from 'react';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';

const optionConfig = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'alternative', label: 'Alternative' },
];

const formatLocation = location =>
  [location?.city, location?.state, location?.country].filter(Boolean).join(', ') || 'Unknown location';

function RouteLaneCard({ group, renderOption }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(current => !current)}
        className="w-full px-5 py-4 border-b border-gray-200 bg-slate-50 text-left hover:bg-slate-100 transition"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <MapPin size={13} />
              Route
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-950 leading-snug">
              {formatLocation(group.origin)} <span className="text-slate-400">-&gt;</span> {formatLocation(group.destination)}
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
                    ? 'border-slate-300 bg-white text-slate-700'
                    : 'border-gray-200 bg-gray-100 text-gray-400'
                }`}
              >
                {label}
              </span>
            ))}
            <span className="rounded-lg p-1 text-slate-500">
              {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </span>
          </div>
        </div>
      </button>

      {isOpen && <div className="divide-y divide-gray-200">
        {optionConfig.map(({ key, label }) => {
          const lane = group[key];
          return (
            <div key={key} className="bg-white">
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
      </div>}
    </section>
  );
}

export default RouteLaneCard;
