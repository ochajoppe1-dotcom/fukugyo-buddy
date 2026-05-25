-- ===================================================
-- usage_counters: ユーザーごと・機能ごとの月次利用回数
-- ===================================================

create table if not exists public.usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
    -- 'lp_diagnose' | 'assessment' | 'ai_chat' など
  month_key text not null,
    -- 'YYYY-MM' 形式（例：'2026-05'）
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, feature, month_key)
);

create index if not exists idx_usage_counters_user_feature
  on public.usage_counters(user_id, feature, month_key);

-- updated_at 自動更新トリガー（既存の set_updated_at 関数を再利用）
drop trigger if exists set_usage_counters_updated_at on public.usage_counters;
create trigger set_usage_counters_updated_at
  before update on public.usage_counters
  for each row execute function public.set_updated_at();

-- ===================================================
-- RLS：本人のみ自分の利用回数を読める
-- 書き込みはサーバー（service_role）からのみ
-- ===================================================
alter table public.usage_counters enable row level security;

drop policy if exists "Users can view own usage" on public.usage_counters;
create policy "Users can view own usage"
  on public.usage_counters for select
  using (auth.uid() = user_id);

-- insert/update/delete ポリシーは作らない（service_roleでバイパス）
