'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Pencil, X, Check, Clock, Search, CalendarDays } from 'lucide-react';
import {
    HistoryRecord,
    compareHistoryDesc,
    formatHistoryLabel,
    yearOf,
} from '@/lib/historyUtils';

type YearFilter = 'all' | string;

interface DraftForm {
    eventDate: string;
    eventTime: string;
    description: string;
}

const todayString = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toTimeInput = (t: string | null) => (t ? t.slice(0, 5) : '');

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// ─────────────────────────────────────────────
// 시간 선택 (24시간제, 오전/오후 혼동 방지)
// value: "HH:mm" | ""
// ─────────────────────────────────────────────
function TimeSelect({
    value,
    onChange,
    size = 'md',
}: {
    value: string;
    onChange: (value: string) => void;
    size?: 'sm' | 'md';
}) {
    const [hour, minute] = value ? value.split(':') : ['', ''];
    const selectClass = `border border-gray-300 rounded-lg text-sm bg-white tabular-nums ${
        size === 'sm' ? 'px-1.5 py-1' : 'px-2 py-2'
    }`;

    return (
        <div className="flex items-center gap-1">
            <select
                value={hour}
                onChange={(e) => onChange(e.target.value ? `${e.target.value}:${minute || '00'}` : '')}
                className={selectClass}
                aria-label="시"
            >
                <option value="">--시</option>
                {HOURS.map((h) => (
                    <option key={h} value={h}>{h}시</option>
                ))}
            </select>
            <select
                value={minute}
                onChange={(e) => onChange(`${hour}:${e.target.value}`)}
                disabled={!hour}
                className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}
                aria-label="분"
            >
                {!hour && <option value="">--분</option>}
                {MINUTES.map((m) => (
                    <option key={m} value={m}>{m}분</option>
                ))}
            </select>
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="시간 지우기"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// 등록 폼
// ─────────────────────────────────────────────
function AddHistoryForm({ onCreated }: { onCreated: (item: HistoryRecord) => void }) {
    const [form, setForm] = useState<DraftForm>({ eventDate: todayString(), eventTime: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const descRef = useRef<HTMLInputElement>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.eventDate || !form.description.trim()) {
            alert('일자와 설명을 입력해주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(json.error || '추가에 실패했습니다.');
                return;
            }
            onCreated(json.data);
            // 같은 일자로 연속 등록하기 쉽게 일자는 유지
            setForm((prev) => ({ ...prev, eventTime: '', description: '' }));
            descRef.current?.focus();
        } catch (error) {
            console.error('Failed to add history:', error);
            alert('추가 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">새 연혁 등록</h2>
                <span className="text-xs text-gray-400">일자·시간 기준으로 최신순 자동 정렬됩니다</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[160px_auto_1fr_auto] gap-2 sm:gap-3">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">일자 *</span>
                    <input
                        type="date"
                        value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                    />
                </label>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">시간 (선택 · 24시간제)</span>
                    <TimeSelect
                        value={form.eventTime}
                        onChange={(eventTime) => setForm({ ...form, eventTime })}
                    />
                </div>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">설명 *</span>
                    <input
                        ref={descRef}
                        type="text"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="예) GS25 팝업스토어 in 성수"
                        required
                    />
                </label>
                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm"
                    >
                        {isSubmitting ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        추가
                    </button>
                </div>
            </div>
            {form.eventDate && (
                <p className="mt-2 text-xs text-gray-400">
                    외부 표기: <span className="text-gray-600">{formatHistoryLabel(form.eventDate)}</span>
                </p>
            )}
        </form>
    );
}

// ─────────────────────────────────────────────
// 행
// ─────────────────────────────────────────────
function HistoryRow({
    item,
    isSelected,
    isHighlighted,
    onSelect,
    onSaved,
    onDelete,
}: {
    item: HistoryRecord;
    isSelected: boolean;
    isHighlighted: boolean;
    onSelect: (checked: boolean) => void;
    onSaved: (item: HistoryRecord) => void;
    onDelete: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draft, setDraft] = useState<DraftForm>({
        eventDate: item.event_date,
        eventTime: toTimeInput(item.event_time),
        description: item.description,
    });

    const startEdit = () => {
        setDraft({
            eventDate: item.event_date,
            eventTime: toTimeInput(item.event_time),
            description: item.description,
        });
        setIsEditing(true);
    };

    const save = async () => {
        if (!draft.eventDate || !draft.description.trim()) {
            alert('일자와 설명을 입력해주세요.');
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/history/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draft),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(json.error || '수정에 실패했습니다.');
                return;
            }
            onSaved(json.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update history:', error);
            alert('수정 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            save();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    return (
        <li
            className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 transition-colors ${
                isEditing ? 'bg-blue-50' : isHighlighted ? 'bg-amber-50' : 'hover:bg-gray-50'
            }`}
        >
            <div className="flex items-center gap-3 sm:w-[360px] shrink-0">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="rounded border-gray-300"
                    aria-label="선택"
                />
                {isEditing ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="date"
                            value={draft.eventDate}
                            onChange={(e) => setDraft({ ...draft, eventDate: e.target.value })}
                            onKeyDown={onKeyDown}
                            className="px-2 py-1 border border-gray-300 rounded text-sm w-[140px]"
                        />
                        <TimeSelect
                            size="sm"
                            value={draft.eventTime}
                            onChange={(eventTime) => setDraft({ ...draft, eventTime })}
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 tabular-nums">{item.event_date}</span>
                        {item.event_time && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded tabular-nums">
                                {toTimeInput(item.event_time)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 pl-7 sm:pl-0">
                {isEditing ? (
                    <input
                        type="text"
                        value={draft.description}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        onKeyDown={onKeyDown}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        autoFocus
                    />
                ) : (
                    <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-sm text-gray-900 break-keep">{item.description}</span>
                        <span className="text-xs text-gray-400 shrink-0" title="외부 노출 표기">
                            {item.date}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 justify-end shrink-0">
                {isEditing ? (
                    <>
                        <button
                            onClick={save}
                            disabled={isSaving}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            title="저장 (Enter)"
                        >
                            {isSaving ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                            title="취소 (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={startEdit}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="수정"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="삭제"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </li>
    );
}

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────
export default function HistoryPage() {
    const [histories, setHistories] = useState<HistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [yearFilter, setYearFilter] = useState<YearFilter | null>(null);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [highlightId, setHighlightId] = useState<number | null>(null);
    const headerRef = useRef<HTMLElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    // 연도 헤더(sticky)가 상단 헤더 바로 아래에 붙도록 실제 높이 측정
    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        const update = () => setHeaderHeight(el.offsetHeight);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [isLoading]);

    const fetchHistories = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/history');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: HistoryRecord[] = await res.json();
            setHistories([...data].sort(compareHistoryDesc));
            setLoadError(null);
        } catch (error) {
            console.error('Failed to fetch histories:', error);
            setLoadError('연혁을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistories();
    }, [fetchHistories]);

    // 연도별 개수 (내림차순)
    const yearCounts = useMemo(() => {
        const map = new Map<string, number>();
        histories.forEach((h) => {
            const y = yearOf(h.event_date);
            map.set(y, (map.get(y) ?? 0) + 1);
        });
        return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
    }, [histories]);

    // 최초 로드 시 가장 최근 연도 선택
    useEffect(() => {
        if (yearFilter === null && yearCounts.length > 0) {
            setYearFilter(yearCounts[0][0]);
        }
    }, [yearCounts, yearFilter]);

    const activeYear = yearFilter ?? 'all';
    const keyword = search.trim().toLowerCase();

    const filtered = useMemo(
        () =>
            histories.filter((h) => {
                if (keyword) {
                    // 검색 시에는 연도 필터와 무관하게 전체에서 검색
                    return h.description.toLowerCase().includes(keyword) || h.event_date.includes(keyword);
                }
                return activeYear === 'all' || yearOf(h.event_date) === activeYear;
            }),
        [histories, activeYear, keyword]
    );

    const grouped = useMemo(() => {
        const groups: { year: string; items: HistoryRecord[] }[] = [];
        filtered.forEach((h) => {
            const y = yearOf(h.event_date);
            const last = groups[groups.length - 1];
            if (last && last.year === y) last.items.push(h);
            else groups.push({ year: y, items: [h] });
        });
        return groups;
    }, [filtered]);

    // 필터가 바뀌면 보이지 않는 항목의 선택 해제
    useEffect(() => {
        const visible = new Set(filtered.map((h) => h.id));
        setSelectedIds((prev) => prev.filter((id) => visible.has(id)));
    }, [filtered]);

    const upsertLocal = (item: HistoryRecord) => {
        setHistories((prev) => {
            const next = prev.some((h) => h.id === item.id)
                ? prev.map((h) => (h.id === item.id ? item : h))
                : [...prev, item];
            return next.sort(compareHistoryDesc);
        });
        setHighlightId(item.id);
        setTimeout(() => setHighlightId((cur) => (cur === item.id ? null : cur)), 2500);
    };

    const handleCreated = (item: HistoryRecord) => {
        upsertLocal(item);
        setSearch('');
        setYearFilter(yearOf(item.event_date));
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/admin/history/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                alert('삭제에 실패했습니다.');
                return;
            }
            setHistories((prev) => prev.filter((h) => h.id !== id));
            setSelectedIds((prev) => prev.filter((x) => x !== id));
        } catch (error) {
            console.error('Failed to delete history:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`선택한 ${selectedIds.length}개 항목을 삭제하시겠습니까?`)) return;
        try {
            const res = await fetch('/api/admin/history', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });
            if (!res.ok) {
                alert('삭제에 실패했습니다.');
                return;
            }
            const ids = new Set(selectedIds);
            setHistories((prev) => prev.filter((h) => !ids.has(h.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error('Failed to delete histories:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const isAllSelected = filtered.length > 0 && filtered.every((h) => selectedIds.includes(h.id));
    const toggleAll = (checked: boolean) => setSelectedIds(checked ? filtered.map((h) => h.id) : []);
    const toggleOne = (id: number, checked: boolean) =>
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header ref={headerRef} className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                                ← 대시보드
                            </Link>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">History 관리</h1>
                            <span className="hidden sm:inline text-sm text-gray-500">총 {histories.length}건</span>
                        </div>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                선택 삭제 ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
                <AddHistoryForm onCreated={handleCreated} />

                {loadError && (
                    <div className="px-4 py-3 rounded-lg bg-red-50 text-sm text-red-700 flex items-center justify-between">
                        {loadError}
                        <button onClick={fetchHistories} className="underline">다시 시도</button>
                    </div>
                )}

                {/* 필터 바 */}
                <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="설명 또는 일자로 전체 검색"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div className={`flex gap-2 overflow-x-auto pb-1 ${keyword ? 'opacity-40 pointer-events-none' : ''}`}>
                        <YearChip label="전체" count={histories.length} active={activeYear === 'all'} onClick={() => setYearFilter('all')} />
                        {yearCounts.map(([year, count]) => (
                            <YearChip
                                key={year}
                                label={year}
                                count={count}
                                active={activeYear === year}
                                onClick={() => setYearFilter(year)}
                            />
                        ))}
                    </div>
                </div>

                {/* 목록 (overflow-hidden 금지: 연도 헤더 sticky가 동작하지 않음) */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 rounded-t-lg text-xs text-gray-500">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) => toggleAll(e.target.checked)}
                            className="rounded border-gray-300"
                            aria-label="전체 선택"
                        />
                        <span>
                            {keyword ? `"${search.trim()}" 검색 결과` : activeYear === 'all' ? '전체' : `${activeYear}년`} · {filtered.length}건
                        </span>
                        <span className="ml-auto hidden sm:inline">최신 일자·시간 순</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-gray-500">
                            {keyword ? '검색 결과가 없습니다.' : '등록된 연혁이 없습니다.'}
                        </div>
                    ) : (
                        grouped.map((group) => (
                            <section key={group.year}>
                                {(activeYear === 'all' || keyword) && (
                                    <div
                                        style={{ top: headerHeight }}
                                        className="sticky z-10 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold">
                                        <CalendarDays className="w-4 h-4" />
                                        {group.year}
                                        <span className="text-xs font-normal text-gray-300">{group.items.length}건</span>
                                    </div>
                                )}
                                <ul className="divide-y divide-gray-100">
                                    {group.items.map((item) => (
                                        <HistoryRow
                                            key={item.id}
                                            item={item}
                                            isSelected={selectedIds.includes(item.id)}
                                            isHighlighted={highlightId === item.id}
                                            onSelect={(checked) => toggleOne(item.id, checked)}
                                            onSaved={upsertLocal}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    ))}
                                </ul>
                            </section>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

function YearChip({
    label,
    count,
    active,
    onClick,
}: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
        >
            {label}
            <span className={`text-xs ${active ? 'text-gray-300' : 'text-gray-400'}`}>{count}</span>
        </button>
    );
}
