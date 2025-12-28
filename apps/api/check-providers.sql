-- Check payment providers
SELECT id, type, name, isActive, isPrimary, createdAt 
FROM "PaymentProvider" 
ORDER BY isPrimary DESC, createdAt DESC;

-- Check subscriptions for the team
SELECT id, teamId, plan, planId, status, createdAt
FROM "Subscription"
ORDER BY createdAt DESC
LIMIT 5;
