-- ===================================================
-- 修正：subscriptions.status の CHECK 制約を緩める
-- 理由：Stripe は "incomplete", "incomplete_expired", "paused" など
--       より多くのステータスを返す。webhook 側で normalize するが
--       万一のためにDB側も柔軟にしておく。
-- ===================================================

-- 既存のCHECK制約を削除
alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;

-- より柔軟なCHECK制約を追加（Stripeの全status対応）
alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in (
    'active',
    'trialing',
    'past_due',
    'canceled',
    'unpaid',
    'inactive',
    'incomplete',
    'incomplete_expired',
    'paused'
  ));

-- ===================================================
-- 念のため：既存ユーザー全員に free レコードを確実に作る
-- （前回の SQL で漏れがあった場合の補完）
-- ===================================================
insert into public.subscriptions (user_id, plan, status)
select id, 'free', 'inactive' from auth.users
on conflict (user_id) do nothing;
