# Changelog

All notable changes to this project will be documented in this file.

## [1.8.1] - 2026-01-11

### Fixed
- **Subscriptions**: Fixed subscription limit calculation to be global across all user teams.
- **Subscriptions**: Membership limits now scale dynamically with active projects (e.g. 2 projects = 6 member slots).
- **Subscriptions**: Owner is no longer counted as a plan participant (free seat).

### Changed
- **UI**: "About App" footer text updated to be region-neutral.

## [1.7.1] - 2026-01-08

### Fixed
- **Onboarding**: Allowed users to proceed with team creation if they are marked as "onboarding completed" but do not own a team (recovery from broken state).
- **Payment**: Fixed mock payment confirmation logic to handle edge cases.

### Changed
- **UI**: Overhauled Payment Success page with premium design, animations, and confetti effect.
- **Docs**: Updated roadmap and versioning.

## [1.7.0]
- Initial Release of Payment & Subscription System features.
