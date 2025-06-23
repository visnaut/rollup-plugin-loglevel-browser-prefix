# rollup-plugin-loglevel-browser-prefix

A Rollup plugin that automatically wraps loglevel function call arguments with format functions using AST transformation.

## Features

- Transforms loglevel function calls (`trace`, `debug`, `info`, `warn`, `error`) to use format functions
- Supports source maps
- Configurable file filtering
- Supports TypeScript and JavaScript files
- Uses AST parsing for accurate transformations

## Installation

```bash
npm install rollup-plugin-loglevel-browser-prefix --save-dev
```

## Usage

### Basic Usage

```javascript
// rollup.config.js
import loglevelBrowserPrefix from 'rollup-plugin-loglevel-browser-prefix';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  plugins: [
    loglevelBrowserPrefix()
  ]
};
```

### With Options

```javascript
// rollup.config.js
import loglevelBrowserPrefix from 'rollup-plugin-loglevel-browser-prefix';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  plugins: [
    loglevelBrowserPrefix({
      include: ['src/**/*.js', 'lib/**/*.ts'],
      exclude: ['**/*.test.js'],
      logLevels: ['debug', 'info', 'warn', 'error'],
      sourceMap: true
    })
  ]
};
```

## Options

- **include** (`string|RegExp|Array<string|RegExp>`): Files to include (default: `['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']`)
- **exclude** (`string|RegExp|Array<string|RegExp>`): Files to exclude (default: `['node_modules/**']`)
- **logLevels** (`Array<string>`): Log levels to transform (default: `['trace', 'debug', 'info', 'warn', 'error']`)
- **sourceMap** (`boolean`): Generate source maps (default: `true`)

## Transformation Examples

### Input

```javascript
log.debug('Here are all of the things', variable, object);
logger.info('User action', userId, action);
this.log.warn('Warning message', details);
```

### Output

```javascript
log.debug(...log.format('Here are all of the things', variable, object));
logger.info(...logger.format('User action', userId, action));
this.log.warn(...this.log.format('Warning message', details));
```

## Requirements

- Rollup 3.x or 4.x
- Node.js 14+

## License

MIT
