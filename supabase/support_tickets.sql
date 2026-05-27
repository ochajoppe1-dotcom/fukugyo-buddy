-- ===================================================
-- support_tickets: ユーザーからの問い合わせ
-- ===================================================

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  category text not null check (
    category in (
      'billing',     -- 課金トラブル
      'account',     -- アカウント関連
      'feature',     -- 機能要望・バグ
      'data',        -- データ削除等
      'other'        -- その他
    )
  ),
  subject text not null,
  body text not null,
  status text not null default 'open' check (
    status in ('open', 'in_progress', 'resolved', 'closed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_user
  on public.support_tickets(user_id, created_at desc);
create index if not exists idx_support_tickets_status
  on public.support_tickets(status, created_at desc);

drop trigger if exists set_support_tickets_updated_at on public.support_tickets;
create trigger set_support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- ===================================================
-- RLS：本人のみ自分の問い合わせを閲覧可
-- 書き込みは service_role 経由（API側で行う）
-- ===================================================
alter table public.support_tickets enable row level security;

drop policy if exists "Users can view own tickets" on public.support_tickets;
create policy "Users can view own tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);
