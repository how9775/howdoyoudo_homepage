// src/app/admin/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';

interface HistoryItem {
    id: number;
    year: string;
    date: string;
    description: string;
}

export default function AdminHistoryPage() {
    const [histories, setHistories] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newRow, setNewRow] = useState<Partial<HistoryItem> | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchHistories();
    }, []);

    const fetchHistories = async () => {
        try {
            const res = await fetch('/api/admin/history');
            if (res.ok) {
                const data = await res.json();
                setHistories(data);
            }
        } catch (error) {
            console.error('Failed to fetch histories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 전체 선택/해제
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(histories.map(h => h.id));
        } else {
            setSelectedIds([]);
        }
    };

    // 개별 선택/해제
    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    // 일괄 삭제
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            alert('삭제할 항목을 선택해주세요.');
            return;
        }

        if (!confirm(`선택한 ${selectedIds.length}개 항목을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const res = await fetch('/api/admin/history', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });

            if (res.ok) {
                await fetchHistories();
                setSelectedIds([]);
                const data = await res.json();
                alert(data.message);
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to delete histories:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const extractYearFromDate = (date: string): string => {
        const match = date.match(/^(\d{4})/);
        return match ? match[1] : new Date().getFullYear().toString();
    };

    const handleAdd = () => {
        setNewRow({
            date: '',
            description: '',
        });
    };

    const handleSaveNew = async () => {
        if (!newRow || !newRow.date || !newRow.description) {
            alert('날짜와 설명을 입력해주세요.');
            return;
        }

        const year = extractYearFromDate(newRow.date);

        try {
            const res = await fetch('/api/admin/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newRow,
                    year,
                }),
            });

            if (res.ok) {
                await fetchHistories();
                setNewRow(null);
            } else {
                alert('추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to add history:', error);
            alert('추가 중 오류가 발생했습니다.');
        }
    };

    const handleCancelNew = () => {
        setNewRow(null);
    };

    const handleEdit = (id: number) => {
        setEditingId(id);
    };

    const handleSave = async (id: number) => {
        const item = histories.find((h) => h.id === id);
        if (!item) return;

        const year = extractYearFromDate(item.date);

        try {
            const res = await fetch(`/api/admin/history/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...item,
                    year,
                }),
            });

            if (res.ok) {
                setEditingId(null);
                await fetchHistories();
            } else {
                alert('수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to update history:', error);
            alert('수정 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/admin/history/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await fetchHistories();
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to delete history:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const updateField = (id: number, field: keyof HistoryItem, value: any) => {
        setHistories(
            histories.map((h) => (h.id === id ? { ...h, [field]: value } : h))
        );
    };

    const updateNewField = (field: keyof HistoryItem, value: any) => {
        setNewRow((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const handleKeyPress = (e: React.KeyboardEvent, isDescription: boolean = false) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (isDescription) {
                handleSaveNew();
            }
        }
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    const isAllSelected = histories.length > 0 && selectedIds.length === histories.length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/admin/dashboard"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                ← 대시보드
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">History 관리</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 size={20} />
                                    선택 삭제 ({selectedIds.length})
                                </button>
                            )}
                            <button
                                onClick={handleAdd}
                                disabled={newRow !== null}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus size={20} />
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left w-12">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold w-20">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold w-32">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newRow && (
                                    <tr className="border-b bg-blue-50">
                                        <td className="px-4 py-2"></td>
                                        <td className="px-4 py-2 text-sm text-gray-500">NEW</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={newRow.date || ''}
                                                onChange={(e) => updateNewField('date', e.target.value)}
                                                onKeyPress={(e) => handleKeyPress(e, false)}
                                                className="w-full px-2 py-1 border rounded text-sm"
                                                placeholder="YYYY. MM"
                                                autoFocus
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={newRow.description || ''}
                                                onChange={(e) => updateNewField('description', e.target.value)}
                                                onKeyPress={(e) => handleKeyPress(e, true)}
                                                className="w-full px-2 py-1 border rounded text-sm"
                                                placeholder="설명을 입력하세요 (엔터로 저장)"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveNew}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    title="저장"
                                                >
                                                    <Save size={18} />
                                                </button>
                                                <button
                                                    onClick={handleCancelNew}
                                                    className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                                    title="취소"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {histories.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50 group">
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.id}</td>
                                        <td className="px-4 py-2">
                                            {editingId === item.id ? (
                                                <input
                                                    type="text"
                                                    value={item.date}
                                                    onChange={(e) => updateField(item.id, 'date', e.target.value)}
                                                    className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                            ) : (
                                                <span className="text-sm">{item.date}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {editingId === item.id ? (
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => updateField(item.id, 'description', e.target.value)}
                                                    className="w-full px-2 py-1 border rounded text-sm"
                                                />
                                            ) : (
                                                <span className="text-sm">{item.description}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {editingId === item.id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSave(item.id)}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                        title="저장"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            fetchHistories();
                                                        }}
                                                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                                        title="취소"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(item.id)}
                                                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="삭제"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {histories.length === 0 && !newRow && (
                        <div className="text-center py-12 text-gray-500">
                            등록된 히스토리가 없습니다.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}