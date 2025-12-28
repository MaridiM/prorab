-- Cleanup duplicate subscriptions
-- This removes incomplete subscriptions that were created with errors

-- Show current subscriptions before cleanup
SELECT
    id,
    "teamId",
    plan,
    status,
    "createdAt",
    "trialEndsAt"
FROM "Subscription"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Delete subscriptions in TRIALING status that were created in the last hour
-- and don't have any successful payments
DELETE FROM "Subscription"
WHERE status = 'TRIALING'
  AND "createdAt" > NOW() - INTERVAL '1 hour'
  AND id NOT IN (
    SELECT DISTINCT "subscriptionId"
    FROM "Payment"
    WHERE status = 'SUCCEEDED'
  );

-- Show remaining subscriptions after cleanup
SELECT
    id,
    "teamId",
    plan,
    status,
    "createdAt",
    "trialEndsAt"
FROM "Subscription"
ORDER BY "createdAt" DESC
LIMIT 10;
