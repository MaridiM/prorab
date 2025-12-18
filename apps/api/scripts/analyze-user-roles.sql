-- ============================================================
-- User Role Analysis Query
-- ============================================================
-- This query analyzes current user-team relationships to determine:
-- 1. Who owns teams (should be FOREMAN)
-- 2. Who is only a member (should be WORKER)
-- 3. Who has BOTH roles (CONFLICT - needs resolution)
-- 4. Who has no teams yet (NONE)
--
-- Run this before implementing role constraints
-- ============================================================

WITH user_team_stats AS (
  SELECT
    u.id AS user_id,
    u.email,
    u."full_name" AS full_name,
    u."has_completed_onboarding" AS has_onboarding,

    -- Count owned teams
    COUNT(DISTINCT t.id) AS owned_teams_count,

    -- Count team memberships where role = 'member'
    COUNT(DISTINCT CASE WHEN tm.role = 'member' THEN tm.id END) AS member_teams_count,

    -- Count owner memberships (should match owned_teams_count)
    COUNT(DISTINCT CASE WHEN tm.role = 'owner' THEN tm.id END) AS owner_memberships_count

  FROM users u
  LEFT JOIN teams t ON t."owner_id" = u.id
  LEFT JOIN team_members tm ON tm."user_id" = u.id
  GROUP BY u.id, u.email, u."full_name", u."has_completed_onboarding"
),

classified_users AS (
  SELECT
    *,
    CASE
      WHEN owned_teams_count > 0 AND member_teams_count > 0 THEN 'CONFLICT'
      WHEN owned_teams_count > 0 THEN 'FOREMAN'
      WHEN member_teams_count > 0 THEN 'WORKER'
      ELSE 'NONE'
    END AS suggested_role,

    CASE
      WHEN owned_teams_count > 0 AND member_teams_count > 0 THEN '⚠️  CONFLICT: Owns ' || owned_teams_count || ' team(s), member of ' || member_teams_count || ' team(s)'
      WHEN owned_teams_count > 0 THEN '✅ Owns ' || owned_teams_count || ' team(s)'
      WHEN member_teams_count > 0 THEN '✅ Member of ' || member_teams_count || ' team(s)'
      ELSE '⏳ No teams yet'
    END AS status_description

  FROM user_team_stats
)

-- ============================================================
-- SUMMARY STATISTICS
-- ============================================================
SELECT
  '📊 SUMMARY' AS section,
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE suggested_role = 'FOREMAN') AS foremen_count,
  COUNT(*) FILTER (WHERE suggested_role = 'WORKER') AS workers_count,
  COUNT(*) FILTER (WHERE suggested_role = 'NONE') AS no_role_count,
  COUNT(*) FILTER (WHERE suggested_role = 'CONFLICT') AS conflicts_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE suggested_role = 'FOREMAN') / NULLIF(COUNT(*), 0), 1) AS foremen_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE suggested_role = 'WORKER') / NULLIF(COUNT(*), 0), 1) AS workers_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE suggested_role = 'NONE') / NULLIF(COUNT(*), 0), 1) AS no_role_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE suggested_role = 'CONFLICT') / NULLIF(COUNT(*), 0), 1) AS conflicts_pct
FROM classified_users

UNION ALL

-- ============================================================
-- CONFLICT CASES (HIGHEST PRIORITY)
-- ============================================================
SELECT
  '⚠️  CONFLICTS' AS section,
  email AS total_users,
  full_name AS foremen_count,
  owned_teams_count::TEXT AS workers_count,
  member_teams_count::TEXT AS no_role_count,
  status_description AS conflicts_count,
  NULL AS foremen_pct,
  NULL AS workers_pct,
  NULL AS no_role_pct,
  NULL AS conflicts_pct
FROM classified_users
WHERE suggested_role = 'CONFLICT'
ORDER BY owned_teams_count DESC, member_teams_count DESC
LIMIT 20

UNION ALL

-- ============================================================
-- FOREMEN (Team Owners)
-- ============================================================
SELECT
  '👷 FOREMEN' AS section,
  email AS total_users,
  full_name AS foremen_count,
  owned_teams_count::TEXT AS workers_count,
  status_description AS no_role_count,
  NULL AS conflicts_count,
  NULL AS foremen_pct,
  NULL AS workers_pct,
  NULL AS no_role_pct,
  NULL AS conflicts_pct
FROM classified_users
WHERE suggested_role = 'FOREMAN'
ORDER BY owned_teams_count DESC
LIMIT 10

UNION ALL

-- ============================================================
-- WORKERS (Team Members)
-- ============================================================
SELECT
  '🔧 WORKERS' AS section,
  email AS total_users,
  full_name AS foremen_count,
  member_teams_count::TEXT AS workers_count,
  status_description AS no_role_count,
  NULL AS conflicts_count,
  NULL AS foremen_pct,
  NULL AS workers_pct,
  NULL AS no_role_pct,
  NULL AS conflicts_pct
FROM classified_users
WHERE suggested_role = 'WORKER'
ORDER BY member_teams_count DESC
LIMIT 10

UNION ALL

-- ============================================================
-- USERS WITHOUT TEAMS
-- ============================================================
SELECT
  '👤 NO TEAMS' AS section,
  COUNT(*)::TEXT || ' users have not joined/created teams yet' AS total_users,
  NULL AS foremen_count,
  NULL AS workers_count,
  NULL AS no_role_count,
  NULL AS conflicts_count,
  NULL AS foremen_pct,
  NULL AS workers_pct,
  NULL AS no_role_pct,
  NULL AS conflicts_pct
FROM classified_users
WHERE suggested_role = 'NONE';

-- ============================================================
-- DETAILED LIST (Optional - uncomment to see all users)
-- ============================================================
/*
SELECT
  email,
  full_name,
  suggested_role,
  owned_teams_count,
  member_teams_count,
  status_description,
  has_onboarding
FROM classified_users
ORDER BY
  CASE suggested_role
    WHEN 'CONFLICT' THEN 1
    WHEN 'FOREMAN' THEN 2
    WHEN 'WORKER' THEN 3
    WHEN 'NONE' THEN 4
  END,
  owned_teams_count DESC,
  member_teams_count DESC;
*/
