'use client';

import { CategoryInfo } from '@/types/works';

interface WorksFilterProps {
  categories: CategoryInfo[];
  selectedCategoryId: number | null;
  selectedYear: 'recent' | 'previous' | null;
  onCategoryChange: (categoryId: number | null) => void;
  onYearChange: (year: 'recent' | 'previous' | null) => void;
}

export default function WorksFilter({ 
  categories, 
  selectedCategoryId,
  selectedYear,
  onCategoryChange,
  onYearChange
}: WorksFilterProps) {
  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 데스크톱 버전 */}
        <div className="hidden md:flex flex-row justify-between items-center gap-4">
          {/* 연도 필터 (왼쪽) */}
          {/* <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onYearChange(null)}
              className={`
                px-6 py-3 text-sm font-medium rounded-full transition-all duration-300
                ${selectedYear === null
                  ? 'text-red-600 bg-red-50 border border-red-200 shadow-sm'
                  : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
              `}
            >
              전체
            </button>
            <button
              onClick={() => onYearChange('recent')}
              className={`
                px-6 py-3 text-sm font-medium rounded-full transition-all duration-300
                ${selectedYear === 'recent'
                  ? 'text-red-600 bg-red-50 border border-red-200 shadow-sm'
                  : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
              `}
            >
              최근
            </button>
            <button
              onClick={() => onYearChange('previous')}
              className={`
                px-6 py-3 text-sm font-medium rounded-full transition-all duration-300
                ${selectedYear === 'previous'
                  ? 'text-red-600 bg-red-50 border border-red-200 shadow-sm'
                  : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
              `}
            >
              이전
            </button>
          </div> */}

          {/* 카테고리 필터 (오른쪽) */}
          <div className="flex flex-wrap items-center gap-3 w-full justify-center">
            <button
              onClick={() => onCategoryChange(null)}
              className={`
                px-6 py-3 text-sm font-medium rounded-full transition-all duration-300
                ${selectedCategoryId === null
                  ? 'text-red-600 bg-red-50 border border-red-200 shadow-sm'
                  : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
              `}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`
                  px-6 py-3 text-sm font-medium rounded-full transition-all duration-300
                  ${selectedCategoryId === category.id
                    ? 'text-red-600 bg-red-50 border border-red-200 shadow-sm'
                    : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
                `}
              >
                {category.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* 모바일 버전 - 셀렉트 박스 */}
        <div className="md:hidden flex flex-col gap-3">
          {/* 연도 필터 셀렉트 */}
          {/* <div className="w-full">
            <select
              value={selectedYear || 'all'}
              onChange={(e) => {
                const value = e.target.value;
                onYearChange(value === 'all' ? null : value as 'recent' | 'previous');
              }}
              className="w-full px-4 py-3 text-sm font-medium bg-white border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         text-gray-700 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">전체 기간</option>
              <option value="recent">최근</option>
              <option value="previous">이전</option>
            </select>
          </div> */}

          {/* 카테고리 필터 셀렉트 */}
          <div className="w-full">
            <select
              value={selectedCategoryId === null ? 'all' : selectedCategoryId}
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
                paddingRight: '2.5rem'
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
        </div>
      </div>
    </section>
  );
}