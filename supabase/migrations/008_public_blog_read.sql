-- Allow anonymous (unauthenticated) users to read published blog posts
CREATE POLICY "public can read published blogs" ON public.posts
  FOR SELECT
  USING (
    data->>'type' = 'blog'
    AND data->>'status' = 'published'
  );
