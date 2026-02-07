-- Drop trigger if exists and recreate to ensure it's properly attached
DROP TRIGGER IF EXISTS encrypt_webhook_secret_on_insert ON public.webhooks;
DROP TRIGGER IF EXISTS encrypt_webhook_secret_on_update ON public.webhooks;

-- Create trigger to automatically encrypt webhook secrets on INSERT
CREATE TRIGGER encrypt_webhook_secret_on_insert
  BEFORE INSERT ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_webhook_secret_trigger();

-- Create trigger to automatically encrypt webhook secrets on UPDATE (when secret changes)
CREATE TRIGGER encrypt_webhook_secret_on_update
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  WHEN (NEW.secret IS DISTINCT FROM OLD.secret)
  EXECUTE FUNCTION public.encrypt_webhook_secret_trigger();

-- Encrypt any existing plain-text webhook secrets
UPDATE public.webhooks 
SET 
  secret = public.encrypt_webhook_secret(secret, id),
  secret_encrypted = true
WHERE secret IS NOT NULL 
  AND (secret_encrypted IS NULL OR secret_encrypted = false);