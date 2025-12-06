// src/app/admin/history/page.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Save, X, GripVertical, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HistoryItem {
    id: number;
    year: string;
    date: string;
    description: string;
    order: number;
}

type SaveStatus = 'saved' | 'saving' | 'unsaved';

const ITEMS_PER_PAGE = 20;

// SortableRow 컴포넌트
function SortableRow({
    item,
    isEditing,
    isSelected,
    onSelect,
    onEdit,
    onSave,
    onDelete,
    onUpdate,
}: {
    item: HistoryItem;
    isEditing: boolean;
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onEdit: () => void;
    onSave: () => void;
    onDelete: () => void;
    onUpdate: (field: keyof HistoryItem, value: any) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-center" style={{ width: '48px' }}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="rounded border-gray-300"
                />
            </td>
            <td className="px-4 py-3 text-center" style={{ width: '64px' }}>
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                >
                    <GripVertical className="w-5 h-5" />
                </button>
            </td>
            <td className="px-4 py-3 text-center text-sm text-gray-500" style={{ width: '80px' }}>
                {item.order}
            </td>
            <td className="px-4 py-3 text-center" style={{ width: '96px' }}>
                {isEditing ? (
                    <input
                        type="text"
                        value={item.year}
                        onChange={(e) => onUpdate('year', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        maxLength={4}
                    />
                ) : (
                    <span className="text-sm font-medium text-gray-900">{item.year}</span>
                )}
            </td>
            <td className="px-4 py-3" style={{ width: '160px' }}>
                {isEditing ? (
                    <input
                        type="text"
                        value={item.date}
                        onChange={(e) => onUpdate('date', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="YYYY.MM.DD"
                    />
                ) : (
                    <span className="text-sm text-gray-900">{item.date}</span>
                )}
            </td>
            <td className="px-4 py-3" style={{ width: 'auto' }}>
                {isEditing ? (
                    <textarea
                        value={item.description}
                        onChange={(e) => onUpdate('description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        rows={2}
                    />
                ) : (
                    <span className="text-sm text-gray-900">{item.description}</span>
                )}
            </td>
            <td className="px-4 py-3 text-center" style={{ width: '80px' }}>
                {isEditing ? (
                    <button
                        onClick={onSave}
                        className="text-green-600 hover:text-green-800"
                        title="저장"
                    >
                        <Save className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={onEdit}
                        className="text-blue-600 hover:text-blue-800"
                        title="수정"
                    >
                        수정
                    </button>
                )}
            </td>
            <td className="px-4 py-3 text-center" style={{ width: '80px' }}>
                <button
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-800"
                    title="삭제"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
}

// 저장 상태 표시 컴포넌트
function SaveStatusBadge({ status }: { status: SaveStatus }) {
    if (status === 'saved') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                <Check className="w-4 h-4" />
                <span>저장됨</span>
            </div>
        );
    }

    if (status === 'saving') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm font-medium">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>저장 중...</span>
            </div>
        );
    }

    if (status === 'unsaved') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>저장 대기 중</span>
            </div>
        );
    }

    return null;
}

// 페이지네이션 컴포넌트
function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange 
}: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
}) {
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(totalPages, startPage + showPages - 1);
        
        if (endPage - startPage < showPages - 1) {
            startPage = Math.max(1, endPage - showPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    이전
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    다음
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        전체 <span className="font-medium">{totalPages}</span> 페이지 중{' '}
                        <span className="font-medium">{currentPage}</span> 페이지
                    </p>
                </div>
                <div>
                    <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                    page === currentPage
                                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default function AdminHistoryPage() {
    const [histories, setHistories] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newRow, setNewRow] = useState<Partial<HistoryItem> | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const [pendingUpdates, setPendingUpdates] = useState<Array<{ id: number; order: number }> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 페이지네이션 계산
    const totalPages = Math.ceil(histories.length / ITEMS_PER_PAGE);
    const paginatedHistories = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return histories.slice(startIndex, endIndex);
    }, [histories, currentPage]);

    useEffect(() => {
        fetchHistories();
    }, []);

    // Debounced save effect
    useEffect(() => {
        if (pendingUpdates && saveStatus === 'unsaved') {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }

            saveTimerRef.current = setTimeout(async () => {
                setSaveStatus('saving');
                
                try {
                    const res = await fetch('/api/admin/history', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ updates: pendingUpdates }),
                    });

                    if (!res.ok) {
                        throw new Error('Failed to update order');
                    }

                    setSaveStatus('saved');
                    setPendingUpdates(null);
                    
                    setTimeout(() => {
                        setSaveStatus('saved');
                    }, 2000);
                } catch (error) {
                    console.error('Failed to update order:', error);
                    alert('순서 변경 저장에 실패했습니다.');
                    setSaveStatus('saved');
                    await fetchHistories();
                }
            }, 3000);
        }

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [pendingUpdates, saveStatus]);

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

    // 드래그앤드롭 핸들러 - 현재 페이지 내에서만 작동
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = histories.findIndex((item) => item.id === active.id);
            const newIndex = histories.findIndex((item) => item.id === over.id);

            const newHistories = arrayMove(histories, oldIndex, newIndex);

            const updatedHistories = newHistories.map((item, index) => ({
                ...item,
                order: index + 1,
            }));

            setHistories(updatedHistories);

            const updates = updatedHistories.map((item) => ({
                id: item.id,
                order: item.order,
            }));
            
            setPendingUpdates(updates);
            setSaveStatus('unsaved');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(paginatedHistories.map(h => h.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

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
                
                // 현재 페이지가 비어있으면 이전 페이지로
                if (paginatedHistories.length === selectedIds.length && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
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

    const isAllSelected = paginatedHistories.length > 0 && 
        paginatedHistories.every(h => selectedIds.includes(h.id));

    return (
        <div className="min-h-screen bg-gray-50">
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
                            {saveStatus !== 'saved' && <SaveStatusBadge status={saveStatus} />}
                            
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    선택 삭제 ({selectedIds.length})
                                </button>
                            )}
                            <button
                                onClick={handleAdd}
                                disabled={newRow !== null}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                                새 항목 추가
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto" style={{ minWidth: '100%' }}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '48px' }}>
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '64px' }}>
                                            드래그
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '80px' }}>
                                            순서
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '96px' }}>
                                            연도
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '160px' }}>
                                            날짜
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: 'auto' }}>
                                            설명
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '80px' }}>
                                            수정
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '80px' }}>
                                            삭제
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <SortableContext
                                        items={paginatedHistories.map(h => h.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {paginatedHistories.map((item) => (
                                            <SortableRow
                                                key={item.id}
                                                item={item}
                                                isEditing={editingId === item.id}
                                                isSelected={selectedIds.includes(item.id)}
                                                onSelect={(checked) => handleSelectOne(item.id, checked)}
                                                onEdit={() => handleEdit(item.id)}
                                                onSave={() => handleSave(item.id)}
                                                onDelete={() => handleDelete(item.id)}
                                                onUpdate={(field, value) => updateField(item.id, field, value)}
                                            />
                                        ))}
                                    </SortableContext>

                                    {newRow && (
                                        <tr className="bg-blue-50">
                                            <td className="px-4 py-3" style={{ width: '48px' }}></td>
                                            <td className="px-4 py-3" style={{ width: '64px' }}></td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-500" style={{ width: '80px' }}>
                                                New
                                            </td>
                                            <td className="px-4 py-3 text-center" style={{ width: '96px' }}>
                                                <input
                                                    type="text"
                                                    value={extractYearFromDate(newRow.date || '')}
                                                    readOnly
                                                    className="w-20 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-center"
                                                    placeholder="자동"
                                                />
                                            </td>
                                            <td className="px-4 py-3" style={{ width: '160px' }}>
                                                <input
                                                    type="text"
                                                    value={newRow.date || ''}
                                                    onChange={(e) => updateNewField('date', e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                    placeholder="YYYY.MM.DD"
                                                    autoFocus
                                                />
                                            </td>
                                            <td className="px-4 py-3" style={{ width: 'auto' }}>
                                                <textarea
                                                    value={newRow.description || ''}
                                                    onChange={(e) => updateNewField('description', e.target.value)}
                                                    onKeyPress={(e) => handleKeyPress(e, true)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                    rows={2}
                                                    placeholder="설명을 입력하세요"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center" style={{ width: '80px' }}>
                                                <button
                                                    onClick={handleSaveNew}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="저장"
                                                >
                                                    <Save className="w-5 h-5" />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-center" style={{ width: '80px' }}>
                                                <button
                                                    onClick={handleCancelNew}
                                                    className="text-gray-600 hover:text-gray-800"
                                                    title="취소"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </DndContext>
                    </div>

                    {histories.length === 0 && !newRow && (
                        <div className="text-center py-12 text-gray-500">
                            등록된 연혁이 없습니다. 새 항목을 추가해주세요.
                        </div>
                    )}

                    {/* 페이지네이션 */}
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </main>
        </div>
    );
}