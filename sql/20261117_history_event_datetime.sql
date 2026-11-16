-- history: 일자/시간 기반 정렬 컬럼 추가
-- Supabase SQL Editor에서 1회 실행 (배포 전에 실행해야 함)

-- 1) 정렬용 컬럼 추가
alter table public.history add column if not exists event_date date;
alter table public.history add column if not exists event_time time;

-- 2) 기존 데이터 마이그레이션
--    date 텍스트("2023. 04", "2019. 05~06", "2024.03.15" 등)에서 연/월/일 추출
--    월/일이 없으면 1로 채움, 연도 파싱 실패 시 year 컬럼 사용
update public.history
set event_date = make_date(
  coalesce(
    substring(date from '^\s*(\d{4})')::int,
    nullif(regexp_replace(year::text, '\D', '', 'g'), '')::int,
    2000
  ),
  least(greatest(coalesce(nullif(substring(date from '^\s*\d{4}\s*[.\-/]\s*(\d{1,2})'), '')::int, 1), 1), 12),
  least(greatest(coalesce(nullif(substring(date from '^\s*\d{4}\s*[.\-/]\s*\d{1,2}\s*[.\-/]\s*(\d{1,2})'), '')::int, 1), 1), 28)
)
where event_date is null;

alter table public.history alter column event_date set not null;

-- 3) 정렬 인덱스 (일자 desc → 시간 desc → 등록순(id) desc)
create index if not exists history_event_sort_idx
  on public.history (event_date desc, event_time desc nulls last, id desc);

-- 4) 수동 순서(order) 컬럼 deprecated
--    앱에서 더 이상 값을 쓰지 않으므로 NOT NULL 제약이 있다면 해제 (데이터는 보존)
alter table public.history alter column "order" drop not null;
comment on column public.history."order" is 'DEPRECATED (2026-11-17): 수동 정렬 폐기. event_date/event_time/id 기준 자동 정렬 사용. 추후 drop 예정';
-- 완전 제거 시 (충분히 안정화된 후):
-- alter table public.history drop column "order";

-- 확인용
-- select id, year, date, event_date, event_time, description
-- from public.history
-- order by event_date desc, event_time desc nulls last, id desc
-- limit 50;
