import React from 'react';

export type Interval = 'day' | 'month' | 'year';

interface DashboardFilterProps {
  start: string;
  end: string;
  n: number;
  interval: Interval;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  onChangeN: (value: number) => void;
  onChangeInterval: (value: Interval) => void;
  onApply: () => void;
}

const DashboardFilter: React.FC<DashboardFilterProps> = ({
  start, end, n, interval,
  onChangeStart, onChangeEnd, onChangeN, onChangeInterval, onApply
}) => (
  <div className="flex flex-wrap items-end gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded shadow transition-colors">
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 transition-colors">Start Date</label>
      <input
        type="date"
        value={start}
        onChange={e => onChangeStart(e.target.value)}
        className="border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1 rounded transition-colors"
      />
    </div>
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 transition-colors">End Date</label>
      <input
        type="date"
        value={end}
        onChange={e => onChangeEnd(e.target.value)}
        className="border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1 rounded transition-colors"
      />
    </div>
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 transition-colors">Top N</label>
      <input
        type="number"
        min={1}
        value={n}
        onChange={e => onChangeN(Number(e.target.value))}
        className="border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1 w-20 rounded transition-colors"
      />
    </div>
    <div>
      <label className="block text-sm text-gray-700 dark:text-gray-300 transition-colors">Interval</label>
      <select
        value={interval}
        onChange={e => onChangeInterval(e.target.value as Interval)}
        className="border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1 rounded transition-colors"
      >
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
    </div>
    <button
      onClick={onApply}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4 sm:mt-0 transition-colors"
    >Apply</button>
  </div>
);

export default DashboardFilter;