SELECT 
  id,
  status,
  amount,
  "paidAt",
  "periodStartAt",
  "periodEndAt",
  "createdAt"
FROM payments 
WHERE status = 'SUCCEEDED'
ORDER BY "paidAt" DESC
LIMIT 10;
