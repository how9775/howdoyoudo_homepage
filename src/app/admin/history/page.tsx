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

// SaveStatusBadge 컴포넌트
function SaveStatusBadge({ status }: { status: SaveStatus }) {
    if (status === 'saved') return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-sm">
            {status === 'saving' ? (
                <>
                    <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-gray-700">저장 중...</span>
                </>
            ) : (
                <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-gray-700">저장 대기</span>
                </>
            )}
        </div>
    );
}

// SortableRow 컴포넌트
function SortableRow({
    item,
    isEditing,
    isSaving,
    isSelected,
    onSelect,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onUpdate,
}: {
    item: HistoryItem;
    isEditing: boolean;
    isSaving: boolean;
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
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
                        readOnly
                        className="w-20 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-center"
                    />
                ) : (
                    <span className="text-sm text-gray-900">{item.year}</span>
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
                    <input
                        type="text"
                        value={item.description}
                        onChange={(e) => onUpdate('description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="설명을 입력하세요"
                    />
                ) : (
                    <span className="text-sm text-gray-900">{item.description}</span>
                )}
            </td>
            <td className="px-4 py-3 text-center" style={{ width: '80px' }}>
                {isEditing ? (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="저장"
                        >
                            {isSaving ? (
                                <Clock className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={isSaving}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="취소"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="수정"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                )}
            </td>
            <td className="px-4 py-3 text-center" style={{ width: '80px' }}>
                <button
                    onClick={onDelete}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="삭제"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}

// Main Component
export default function HistoryPage() {
    const [histories, setHistories] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [originalData, setOriginalData] = useState<HistoryItem | null>(null);
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

    // 드래그앤드롭 핸들러
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
        // 편집 시작 전에 원본 데이터 백업
        const item = histories.find(h => h.id === id);
        if (item) {
            setOriginalData({ ...item });
            setEditingId(id);
        }
    };

    const handleCancel = (id: number) => {
        // 원본 데이터로 복원
        if (originalData) {
            setHistories(
                histories.map(h => h.id === id ? originalData : h)
            );
        }
        setEditingId(null);
        setOriginalData(null);
    };

    const handleSave = async (id: number) => {
        const item = histories.find((h) => h.id === id);
        if (!item) return;

        const year = extractYearFromDate(item.date);

        setSavingId(id);

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
                setOriginalData(null);
                await fetchHistories();
            } else {
                alert('수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to update history:', error);
            alert('수정 중 오류가 발생했습니다.');
        } finally {
            setSavingId(null);
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
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                                새 항목 추가
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-center" style={{ width: '48px' }}>
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '64px' }}>
                                            순서
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '80px' }}>
                                            No.
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
                                                isSaving={savingId === item.id}
                                                isSelected={selectedIds.includes(item.id)}
                                                onSelect={(checked) => handleSelectOne(item.id, checked)}
                                                onEdit={() => handleEdit(item.id)}
                                                onSave={() => handleSave(item.id)}
                                                onCancel={() => handleCancel(item.id)}
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
                                                <input
                                                    type="text"
                                                    value={newRow.description || ''}
                                                    onChange={(e) => updateNewField('description', e.target.value)}
                                                    onKeyPress={(e) => handleKeyPress(e, true)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                                    placeholder="설명을 입력하세요"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center" style={{ width: '80px' }}>
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={handleSaveNew}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        title="저장"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelNew}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                        title="취소"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3" style={{ width: '80px' }}></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </DndContext>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 rounded-lg border ${
                                        currentPage === page
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}