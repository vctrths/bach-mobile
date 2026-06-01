-- Message notification trigger
-- Run after conversations, messages, profiles, and notifications have been created.

CREATE OR REPLACE FUNCTION public.notify_conversation_participant_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  conversation_record RECORD;
  sender_record RECORD;
  recipient_id uuid;
  sender_name text;
BEGIN
  SELECT user1_id, user2_id INTO conversation_record
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF conversation_record.user1_id IS NULL OR conversation_record.user2_id IS NULL THEN
    RETURN NEW;
  END IF;

  recipient_id := CASE
    WHEN conversation_record.user1_id = NEW.sender_id THEN conversation_record.user2_id
    WHEN conversation_record.user2_id = NEW.sender_id THEN conversation_record.user1_id
    ELSE NULL
  END;

  IF recipient_id IS NULL OR recipient_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  SELECT first_name, last_name INTO sender_record
  FROM public.profiles
  WHERE id = NEW.sender_id;

  sender_name := COALESCE(
    NULLIF(TRIM(COALESCE(sender_record.first_name, '') || ' ' || COALESCE(sender_record.last_name, '')), ''),
    'Iemand'
  );

  INSERT INTO public.notifications (user_id, type, title, body, related_id)
  VALUES (
    recipient_id,
    'message',
    'Nieuw bericht van ' || sender_name,
    LEFT(NEW.content, 160),
    NEW.conversation_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_participant_on_message ON public.messages;
CREATE TRIGGER trigger_notify_participant_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_conversation_participant_on_message();
