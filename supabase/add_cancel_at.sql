-- subscriptions に cancel_at カラム追加（解約予約日）
alter table public.subscriptions
  add column if not exists cancel_at timestamptz;

-- index は不要（少数の行検索なので）
