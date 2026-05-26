-- ===================================================
-- chat_messages: AI相談チャットの会話履歴
-- Premium プランの「全記憶」機能で使用
-- ===================================================

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null,
    -- 同じ会話セッションに属するメッセージは同一の conversation_id を持つ
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- 履歴読み込みで頻繁に使うインデックス
create index if not exists idx_chat_messages_user_conv
  on public.chat_messages(user_id, conversation_id, created_at);

create index if not exists idx_chat_messages_user_created
  on public.chat_messages(user_id, created_at desc);

-- ===================================================
-- RLS：本人のみ自分のチャット履歴にアクセス可
-- ===================================================
alter table public.chat_messages enable row level security;

drop policy if exists "Users can view own chat" on public.chat_messages;
create policy "Users can view own chat"
  on public.chat_messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own chat" on public.chat_messages;
create policy "Users can insert own chat"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own chat" on public.chat_messages;
create policy "Users can delete own chat"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

-- 更新は不可（履歴の改ざん防止）
