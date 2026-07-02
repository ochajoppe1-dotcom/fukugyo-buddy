-- diary_entries の RLS を確実に有効化＋自分の行だけ操作できるポリシー
-- （何度実行しても安全な冪等SQL。Supabase SQL Editor で実行する）
--
-- 背景：diary_entries はブラウザから直接 insert/delete しており、
-- RLS が唯一の防壁。リポジトリに定義が無かったため明文化する。

alter table public.diary_entries enable row level security;

drop policy if exists "Users can view own diary" on public.diary_entries;
create policy "Users can view own diary"
  on public.diary_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own diary" on public.diary_entries;
create policy "Users can insert own diary"
  on public.diary_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own diary" on public.diary_entries;
create policy "Users can update own diary"
  on public.diary_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own diary" on public.diary_entries;
create policy "Users can delete own diary"
  on public.diary_entries for delete
  using (auth.uid() = user_id);
