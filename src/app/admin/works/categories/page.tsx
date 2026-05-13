'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, Tag, EyeOff, Eye } from 'lucide-react';

interface Category {
  id: number;
  display_name: string;
  is_active: boolean;
  is_hidden_from_public: boolean;
  created_at: string;
  worksCount?: number;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [catRes, worksRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/works?page=1&limit=1000'),
      ]);
      const catData = await catRes.json();
      const worksData = await worksRes.json();

      if (catData.success) {
        const works = worksData.works || [];
        const countMap: Record<number, number> = {};
        works.forEach((w: { categoryId: number }) => {
          countMap[w.categoryId] = (countMap[w.categoryId] || 0) + 1;
        });
        setCategories(
          catData.data.map((c: Category) => ({
            ...c,
            worksCount: countMap[c.id] || 0,
          }))
        );
      }
    } catch {
      setError('카테고리를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.display_name);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setError('');
  };

  const saveEdit = async (id: number) => {
    if (!editingName.trim()) {
      setError('카테고리 이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, displayName: editingName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, display_name: editingName.trim() } : c
          )
        );
        setEditingId(null);
      } else {
        setError(data.error || '수정에 실패했습니다.');
      }
    } catch {
      setError('수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError('카테고리 이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: newName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewName('');
        setShowAddForm(false);
        await fetchCategories();
      } else {
        setError(data.error || '추가에 실패했습니다.');
      }
    } catch {
      setError('추가 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHidden = async (category: Category) => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: category.id, isHiddenFromPublic: !category.is_hidden_from_public }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === category.id
              ? { ...c, is_hidden_from_public: !category.is_hidden_from_public }
              : c
          )
        );
      } else {
        alert(data.error || '수정에 실패했습니다.');
      }
    } catch {
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.worksCount && category.worksCount > 0) {
      alert(`이 카테고리에 ${category.worksCount}개의 작업이 있어 삭제할 수 없습니다.\n작업을 먼저 다른 카테고리로 옮기거나 삭제해주세요.`);
      return;
    }
    if (!confirm(`"${category.display_name}" 카테고리를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
      } else {
        alert(data.error || '삭제에 실패했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/works')}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
              <p className="mt-1 text-sm text-gray-600">
                Works 카테고리를 추가·수정·삭제할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setError('');
            }}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            카테고리 추가
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">새 카테고리 이름</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="카테고리 이름 입력"
                autoFocus
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                disabled={saving}
              />
              <button
                onClick={handleAdd}
                disabled={saving}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm"
              >
                {saving ? '추가 중...' : '추가'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setError('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                취소
              </button>
            </div>
            {error && !editingId && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        )}

        {/* Category List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm">로딩 중...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">카테고리가 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리 이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연결된 작업 수
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    외부 숨김
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === category.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(category.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                            disabled={saving}
                          />
                          <button
                            onClick={() => saveEdit(category.id)}
                            disabled={saving}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="저장"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="취소"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {error && editingId === category.id && (
                            <span className="text-xs text-red-600">{error}</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {category.display_name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {category.worksCount ?? 0}개
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleHidden(category)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          category.is_hidden_from_public
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={category.is_hidden_from_public ? '숨김 해제' : '숨김 설정'}
                      >
                        {category.is_hidden_from_public ? (
                          <><EyeOff className="w-3 h-3" /> 숨김</>
                        ) : (
                          <><Eye className="w-3 h-3" /> 공개</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {editingId !== category.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(category)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="이름 수정"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제"
                            disabled={(category.worksCount ?? 0) > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500">
          * 카테고리 이름을 수정하면 해당 카테고리를 사용하는 모든 작업에 즉시 반영됩니다.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          * 연결된 작업이 있는 카테고리는 삭제할 수 없습니다.
        </p>
      </main>
    </div>
  );
}
