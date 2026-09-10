-- Migration: Add sender to line_messages for admin direct replies
ALTER TABLE public.line_messages
ADD COLUMN IF NOT EXISTS sender text NOT NULL DEFAULT 'customer'
  CHECK (sender IN ('customer', 'shop'));

CREATE INDEX IF NOT EXISTS line_messages_sender_idx
ON public.line_messages(conversation_id, sender);
