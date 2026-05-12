'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WorkItem, WorksResponse, CategoryInfo } from '@/types/works';
import WorksFilter from './WorksFilter';
import WorksGrid from './WorksGrid';

const SPECIAL_CATEGORY_NAME = '제작';

interface WorksClientProps {
  initialData: WorksResponse;
}

export default function WorksClient({ initialData }: WorksClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [works, setWorks] = useState<WorkItem[]>(initialData.works);
  const [allCategories] = useState<CategoryInfo[]>(initialData.categories);
  const specialCategory = allCategories.find(c => c.displayName === SPECIAL_CATEGORY_NAME);
  const categories = allCategories.filter(c => c.displayName !== SPECIAL_CATEGORY_NAME);

  // URL에서 초기 카테고리 읽기
  const getUrlCategory = () => {
    const cat = searchParams.get('category');
    return cat && !isNaN(parseInt(cat)) ? parseInt(cat) : null;
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(getUrlCategory);
  const [selectedYear, setSelectedYear] = useState<'recent' | 'previous' | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [currentPage, setCurrentPage] = useState(1);

  // 공통 fetch 함수
  const fetchWorks = useCallback(async (
    categoryId: number | null,
    year: 'recent' | 'previous' | null,
    page: number,
    append = false,
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '21' });

      if (categoryId !== null) {
        params.append('categoryId', categoryId.toString());
      } else if (specialCategory) {
        params.append('excludeCategoryId', specialCategory.id.toString());
      }

      if (year) params.append('year', year);

      const response = await fetch(`/api/works?${params.toString()}`);
      if (response.ok) {
        const data: WorksResponse = await response.json();
        setWorks(prev => append ? [...prev, ...data.works] : data.works);
        setHasMore(data.hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  }, [specialCategory]);

  // 마운트 시 URL에 카테고리가 있으면 해당 데이터로 교체
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const catFromUrl = getUrlCategory();
    if (catFromUrl !== null) {
      fetchWorks(catFromUrl, null, 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL 업데이트
  const updateUrl = useCallback((categoryId: number | null) => {
    const params = new URLSearchParams();
    if (categoryId !== null) params.set('category', categoryId.toString());
    const query = params.toString();
    router.replace(`/works${query ? `?${query}` : ''}`, { scroll: false });
  }, [router]);

  // 카테고리 필터 변경
  const handleCategoryChange = (categoryId: number | null) => {
    if (categoryId === selectedCategoryId) return;
    setSelectedCategoryId(categoryId);
    updateUrl(categoryId);
    fetchWorks(categoryId, selectedYear, 1);
  };

  // 연도 필터 변경
  const handleYearChange = (year: 'recent' | 'previous' | null) => {
    if (year === selectedYear) return;
    setSelectedYear(year);
    fetchWorks(selectedCategoryId, year, 1);
  };

  // 무한 스크롤
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchWorks(selectedCategoryId, selectedYear, currentPage + 1, true);
  }, [loading, hasMore, selectedCategoryId, selectedYear, currentPage, fetchWorks]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return (
    <>
      <WorksFilter
        categories={categories}
        specialCategory={specialCategory}
        selectedCategoryId={selectedCategoryId}
        selectedYear={selectedYear}
        onCategoryChange={handleCategoryChange}
        onYearChange={handleYearChange}
      />
      <WorksGrid
        works={works}
        loading={loading}
        hasMore={hasMore}
        selectedCategoryId={selectedCategoryId}
      />
    </>
  );
}
