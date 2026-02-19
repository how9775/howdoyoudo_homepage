// Supabase 응답 타입 (실제로 받는 데이터 구조)
export interface WorkItemFromDB {
  id: number;
  title: string;
  category_id: number;
  description: string;
  event_date: string;
  thumbnail_image: string;
  content_images: string | string[];
  view_count: number;
  created_at: string;
  updated_at: string;
  work_categories: {  // 단일 객체
    display_name: string;
  } | null;
}

// 전체 Work 데이터 타입 (테이블 구조)
export interface WorkItemDB {
  id: number;
  title: string;
  category_id: number;
  description: string;
  event_date: string;
  thumbnail_image: string;
  content_images: string | string[];
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// API 응답 타입
export interface WorkItem {
  id: number;
  title: string;
  categoryId: number;
  categoryDisplayName: string;
  description: string;
  eventDate: string;
  eventYear: string;
  thumbnailImage: string;
  contentImages: string[];
  viewCount: number;
}

export interface WorksResponse {
  works: WorkItem[];
  totalCount: number;
  categories: CategoryInfo[];
  hasMore: boolean;
  currentPage: number;
}

export interface CategoryInfo {
  id: number;
  displayName: string;
  isActive: boolean;
  createdAt: string;
}

export interface WorksFilterParams {
  page?: number;
  limit?: number;
  categoryId?: number | null;
  year?: 'recent' | 'previous' | null;
}