# Changelog

All notable changes to ClipBridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- macOS support
- End-to-end encryption (AES-256-GCM)
- Device authentication (Ed25519)
- Image and file support
- Persistent clipboard history
- Mobile apps (Android/iOS)

## [0.1.0] - 2025-01-20

### Added
- ✨ Initial release of ClipBridge
- 📋 Clipboard synchronization for Windows and Linux
- 🌐 P2P network communication (TCP on port 7879)
- 🔍 Automatic device discovery (UDP multicast on port 7878)
- 🖥️ Desktop application using Tauri framework
- ⚛️ Modern React UI with gradient design
- 📱 System tray integration
- 🔄 Real-time clipboard monitoring (500ms polling)
- 📦 Protocol definitions (`@clipbridge/protocol`)
- ⚙️ Core sync engine (`@clipbridge/core`)
- 📚 Comprehensive documentation
  - Technical specification
  - Architecture design
  - Development guide
  - Getting started guide
- 🔧 GitHub Actions CI/CD pipeline
- 🚀 Automated release builds for Windows (.msi) and Linux (.deb)

### Platform Support
- **Windows**: clipboard-win integration
- **Linux**: arboard integration with X11/Wayland support

### Known Limitations
- ⚠️ No encryption - communications are in plain text
- ⚠️ No device authentication
- ⚠️ Text-only clipboard support (no images/files)
- ⚠️ In-memory history only (not persistent)
- ⚠️ macOS not supported yet

### Technical Details
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Rust + Tauri 1.5
- **Network**: Custom TCP/UDP implementation
- **Build**: GitHub Actions for CI/CD
- **License**: MIT

### Documentation
- README.md - Project overview
- SPECIFICATION.md - Technical specification
- docs/ARCHITECTURE.md - System architecture
- docs/DEVELOPMENT.md - Development guide
- docs/GETTING_STARTED.md - Quick start guide
- docs/RELEASE.md - Release process
- packages/desktop/README.md - Desktop app guide
- CONTRIBUTING.md - Contribution guidelines

[Unreleased]: https://github.com/yourusername/clipbridge/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/clipbridge/releases/tag/v0.1.0
