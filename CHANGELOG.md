# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-06-23

### Added
- Initial release of rollup-plugin-loglevel-format
- AST-based transformation of loglevel function calls
- Support for all standard log levels (trace, debug, info, warn, error)
- Source map support
- Configurable file filtering using @rollup/pluginutils
- Comprehensive logger instance detection
- Protection against false positive transformations
- Support for complex logger expressions (this.log, app.logger, getLogger(), etc.)
- TypeScript and JavaScript file support

### Features
- Transforms `log.debug(args...)` to `log.debug(...log.format(args...))`
- Configurable log levels to transform
- Include/exclude file patterns
- Source map generation
- Rollup plugin best practices compliance
