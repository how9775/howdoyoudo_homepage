import { User } from "@/types/dashboard";
import React from "react";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: User
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: {
    username: string;
    name: string;
    recentLogin: string;
  };
}

interface CreatePostRequest {
  title: string;
  content: string;
  author: string;
}

interface UpdatePostRequest {
  id: number;
  title?: string;
  content?: string;
  status?: 'published' | 'draft' | 'archived';
}

// 기본 API 호출 함수
async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다.'
    };
  }
}

// 인증 API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiCall<LoginResponse>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
};

// 대시보드 API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiCall('/api/dashboard/stats');
  }
};

// 게시글 API
export const postsApi = {
  // 게시글 목록 조회
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    status?: 'published' | 'draft' | 'archived';
    author?: string;
  }): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.author) searchParams.append('author', params.author);

    const queryString = searchParams.toString();
    const url = `/api/dashboard/posts${queryString ? `?${queryString}` : ''}`;
    
    return apiCall(url);
  },

  // 새 게시글 작성
  createPost: async (post: CreatePostRequest): Promise<ApiResponse<any>> => {
    return apiCall('/api/dashboard/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  // 게시글 수정
  updatePost: async (post: UpdatePostRequest): Promise<ApiResponse<any>> => {
    return apiCall('/api/dashboard/posts', {
      method: 'PUT',
      body: JSON.stringify(post),
    });
  },

  // 게시글 삭제
  deletePost: async (id: number): Promise<ApiResponse<any>> => {
    return apiCall(`/api/dashboard/posts?id=${id}`, {
      method: 'DELETE',
    });
  }
};

// 에러 핸들링 유틸리티
export const handleApiError = (error: string): string => {
  // 공통 에러 메시지 처리
  switch (error) {
    case 'Network error':
      return '네트워크 연결을 확인해주세요.';
    case 'Unauthorized':
      return '로그인이 필요합니다.';
    case 'Forbidden':
      return '접근 권한이 없습니다.';
    default:
      return error || '알 수 없는 오류가 발생했습니다.';
  }
};

// 로딩 상태 관리 Hook (React Hook)
export const useApiCall = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const execute = async <T,>(
    apiFunction: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();
      
      if (!response.success) {
        setError(handleApiError(response.error || ''));
        return null;
      }

      return response.data || null;
    } catch (err) {
      setError('API 호출 중 오류가 발생했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};