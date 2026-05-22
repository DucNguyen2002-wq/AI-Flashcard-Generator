-- ============================================================
-- Migration: 002_storage_bucket
-- Creates: documents storage bucket + storage policies
-- ============================================================

-- ─── Create storage bucket ───────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  5242880,
  ARRAY['application/pdf', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- ─── Storage Policies ────────────────────────────────────────
-- Users can upload files to their own folder only
CREATE POLICY "Users can upload their own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own files only
CREATE POLICY "Users can read their own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own files only
CREATE POLICY "Users can update their own documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own files only
CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
