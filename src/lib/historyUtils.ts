// history 공통 유틸 (서버/클라이언트 공용)

export interface HistoryRecord {
  id: number;
  year: string;
  /** 외부 노출용 표기 (예: "2025. 03") */
  date: string;
  description: string;
  /** @deprecated 수동 순서(drag & drop) 기능 폐기. 더 이상 읽거나 쓰지 않음 */
  order?: number | null;
  /** 정렬 기준 일자 YYYY-MM-DD */
  event_date: string;
  /** 같은 일자 내 정렬용 시간 HH:mm(:ss), 선택 */
  event_time: string | null;
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export function isValidEventDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function normalizeEventTime(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !TIME_RE.test(value)) return undefined; // invalid
  return value.slice(0, 5);
}

/** event_date(YYYY-MM-DD) → 외부 노출 표기 "YYYY. MM" (기존 연혁 표기와 동일) */
export function formatHistoryLabel(eventDate: string): string {
  const [y, m] = eventDate.split('-');
  return `${y}. ${m}`;
}

export function yearOf(eventDate: string): string {
  return eventDate.slice(0, 4);
}

/** 일자 desc → 시간 desc(없으면 뒤) → 등록순(id) desc */
export function compareHistoryDesc(a: HistoryRecord, b: HistoryRecord): number {
  if (a.event_date !== b.event_date) return a.event_date < b.event_date ? 1 : -1;
  const at = a.event_time ?? '';
  const bt = b.event_time ?? '';
  if (at !== bt) {
    if (!at) return 1;
    if (!bt) return -1;
    return at < bt ? 1 : -1;
  }
  return b.id - a.id;
}
