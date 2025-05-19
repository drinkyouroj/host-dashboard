# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Basic caller management interface
- Call queue functionality
- Caller details panel

### Changed
- Improved UI/UX for better usability
- Enhanced error handling and user feedback

## [0.1.2] - 2025-05-19

### Fixed
- Fixed status check in CallerDetails to use 'live' instead of 'on-air'
- Improved button states for call controls based on caller status
- Added visual feedback for call actions
- Enhanced button styling and transitions

### Added
- Different button text for 'Put On Air' vs 'Reconnect' states
- Better visual feedback for active call controls

## [0.1.1] - 2025-05-19

### Added
- Priority toggle functionality for callers
- Caller notes feature
- Status management for callers (waiting, live, rejected)
- Mute/unmute functionality

### Fixed
- TypeScript type definitions for caller management
- Improved state management for caller updates
- Fixed UI issues in the caller list and details components

## [0.1.0] - 2025-05-19

### Added
- Initial project setup with Create React App and TypeScript
- Authentication system with login/logout
- Protected routes for authenticated users
- Basic dashboard layout with Mantine UI
- Responsive design for different screen sizes
- Basic routing setup
- Environment configuration

### Changed
- Updated dependencies to their latest versions
- Configured ESLint and Prettier for code quality

### Fixed
- Fixed routing issues with React Router
- Resolved TypeScript type errors
- Addressed accessibility concerns
