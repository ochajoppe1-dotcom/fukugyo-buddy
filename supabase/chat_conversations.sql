-- AI相談のセッション管理テーブル
-- 目的：回数消費の判定をクライアント送信の messages 配列に頼らず、
-- サーバー側で「新しい会話かどうか」を判定する（カウント回避の穴を塞ぐ）。
-- 併せて1会話あたりのメッセージ数上限（APIコスト暴走防止）を管理する。
--
-- 読み書きはサーバー（service_role）のみ。クライアントには一切公開しない。

create table if not exists public.chat_conversations (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_conversations_user_idx
  on public.chat_conversations (user_id);

-- RLS 有効化・ポリシーは作らない = anon/authenticated からは読み書き不可
-- （service_role は RLS をバイパスするのでサーバーからは操作できる）
alter table public.chat_conversations enable row level security;
