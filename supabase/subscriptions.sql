-- ===================================================
-- subscriptions テーブル：ユーザーの課金状態を保存
-- ===================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'standard', 'premium')),
  status text not null default 'inactive' check (
    status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive')
  ),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- インデックス（webhookで頻繁に検索するため）
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_customer_id on public.subscriptions(stripe_customer_id);
create index if not exists idx_subscriptions_stripe_subscription_id on public.subscriptions(stripe_subscription_id);

-- updated_at 自動更新トリガー
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ===================================================
-- RLS（行レベルセキュリティ）
-- ===================================================
alter table public.subscriptions enable row level security;

-- 本人のみ自分の課金情報を読める
drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- 書き込み・更新はサーバー（Stripe webhook）からのみ
-- → サービスロールキーでバイパスするので、anon/authenticated には許可しない
-- （insert/update/delete ポリシーは作らない＝ブロックされる）

-- ===================================================
-- 既存ユーザー向け：free プラン行を自動作成する関数
-- ===================================================
-- 新規ユーザー登録時に free プランの行を1つ作る
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- ===================================================
-- 既存ユーザー（テーブル作成前に登録済み）にも free 行を入れる
-- ===================================================
insert into public.subscriptions (user_id, plan, status)
select id, 'free', 'inactive' from auth.users
on conflict (user_id) do nothing;
