-- supabase/migrations/20260909090000_line_bot_intake.sql
-- Add intake fields to line_conversations
ALTER TABLE public.line_conversations
ADD COLUMN IF NOT EXISTS intake_status text NOT NULL DEFAULT 'new'
  CHECK (intake_status IN ('new', 'awaiting_device', 'awaiting_service', 'awaiting_issue', 'completed')),
ADD COLUMN IF NOT EXISTS intake_data jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Index for filtering completed or active intakes in admin inbox
CREATE INDEX IF NOT EXISTS idx_line_conversations_intake ON public.line_conversations(intake_status);

-- Function to update intake state and data safely
CREATE OR REPLACE FUNCTION public.shop_update_line_intake(
  p_room uuid,
  p_status text,
  p_data jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  UPDATE public.line_conversations
  SET intake_status = p_status,
      intake_data = COALESCE(p_data, '{}'::jsonb)
  WHERE id = p_room;
END;
$$;

REVOKE ALL ON FUNCTION public.shop_update_line_intake(uuid, text, jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.shop_update_line_intake(uuid, text, jsonb) TO service_role;
