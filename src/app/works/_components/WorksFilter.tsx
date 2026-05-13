'use client';

import { CategoryInfo } from '@/types/works';

interface WorksFilterProps {
  categories: CategoryInfo[];
  hiddenCategories: CategoryInfo[];
  selectedCategoryId: number | null;
  selectedYear: 'recent' | 'previous' | null;
  onCategoryChange: (categoryId: number | null) => void;
  onYearChange: (year: 'recent' | 'previous' | null) => void;
}

const btnBase =
  'px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50';
const btnActive = 'text-red-600 bg-red-50 border border-red-200 shadow-sm';
const btnIdle = 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300';

export default function WorksFilter({
  categories,
  hiddenCategories,
  selectedCategoryId,
  selectedYear,
  onCategoryChange,
  onYearChange,
}: WorksFilterProps) {
  const isHiddenSelected = hiddenCategories.some(c => c.id === selectedCategoryId);

  return (
    <section className="py-0 sm:py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 데스크톱 버전 */}
        <div className="hidden md:flex flex-row items-center justify-center gap-3 w-full">
          <button
            onClick={() => onCategoryChange(null)}
            className={`${btnBase} ${selectedCategoryId === null && !isHiddenSelected ? btnActive : btnIdle}`}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`${btnBase} ${selectedCategoryId === category.id ? btnActive : btnIdle}`}
            >
              {category.displayName}
            </button>
          ))}

          {/* 숨김 카테고리: 구분선 후 별도 표시 */}
          {hiddenCategories.length > 0 && (
            <>
              <span className="w-px h-6 bg-gray-200 flex-shrink-0" />
              {hiddenCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`${btnBase} flex-shrink-0 ${selectedCategoryId === category.id ? btnActive : btnIdle}`}
                >
                  {category.displayName}
                </button>
              ))}
            </>
          )}
        </div>

        {/* 모바일 버전 */}
        <div className="md:hidden flex items-center gap-2">
          {/* 일반 카테고리 셀렉트 */}
          <div className="flex-1 min-w-0">
            <select
              value={isHiddenSelected ? 'all' : (selectedCategoryId === null ? 'all' : selectedCategoryId)}
              onChange={(e) => {
                const value = e.target.value;
                onCategoryChange(value === 'all' ? null : parseInt(value));
              }}
              className="w-full px-4 py-3 text-sm font-medium bg-white border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         text-gray-700 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              <option value="all">전체 카테고리</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* 숨김 카테고리 버튼들 */}
          {hiddenCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
                ${selectedCategoryId === category.id
                  ? 'text-red-600 bg-red-50 border-red-200 shadow-sm'
                  : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
            >
              {category.displayName}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
