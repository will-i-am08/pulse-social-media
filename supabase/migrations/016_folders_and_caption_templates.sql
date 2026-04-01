-- Photo folders (workspace-scoped, same pattern as posts/photos/clients)
CREATE TABLE IF NOT EXISTS public.folders (
  id           text PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  data         jsonb NOT NULL
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can manage folders"
  ON public.folders FOR ALL
  USING (workspace_id = public.my_workspace_id())
  WITH CHECK (workspace_id = public.my_workspace_id());

-- Caption templates (user-scoped — personal, not shared with team members)
CREATE TABLE IF NOT EXISTS public.caption_templates (
  id      text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data    jsonb NOT NULL
);

ALTER TABLE public.caption_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their caption templates"
  ON public.caption_templates FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
