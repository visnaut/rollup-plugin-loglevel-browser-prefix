import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { parse } from 'acorn';
import { walk } from 'estree-walker';

const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error'];

/**
 * Rollup plugin that wraps loglevel function calls with format function
 * @param {Object} options - Plugin options
 * @param {string|RegExp|Array<string|RegExp>} [options.include] - Files to include
 * @param {string|RegExp|Array<string|RegExp>} [options.exclude] - Files to exclude
 * @param {Array<string>} [options.logLevels] - Log levels to transform (defaults to all standard levels)
 * @param {boolean} [options.sourceMap=true] - Generate source maps
 * @returns {Object} Rollup plugin
 */
export default function loglevelBrowserPrefixPlugin(options = {}) {
  const {
    include = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
    exclude = ['node_modules/**'],
    logLevels = LOG_LEVELS,
    sourceMap = true
  } = options;

  const filter = createFilter(include, exclude);
  const logLevelSet = new Set(logLevels);

  return {
    name: 'loglevel-browser-prefix',

    transform(code, id) {
      // Skip if file doesn't match filter
      if (!filter(id)) {
        return null;
      }

      let ast;
      try {
        ast = parse(code, {
          ecmaVersion: 'latest',
          sourceType: 'module',
          locations: true
        });
      } catch (error) {
        // If parsing fails, return null to skip transformation
        this.warn(`Failed to parse ${id}: ${error.message}`);
        return null;
      }

      const magicString = new MagicString(code);
      let hasChanges = false;

      // Walk the AST to find loglevel function calls
      walk(ast, {
        enter(node, parent) {
          // Look for CallExpression nodes that match loglevel patterns
          if (node.type === 'CallExpression' && isLoglevelCall(node, logLevelSet)) {
            const { callee, arguments: args } = node;

            // Skip if no arguments to wrap
            if (args.length === 0) {
              return;
            }

            // Get the logger instance (e.g., 'log' from 'log.debug(...)')
            const loggerInstance = getLoggerInstance(callee, code);

            if (loggerInstance) {
              // Transform the call to wrap arguments with format
              transformCall(node, magicString, code, loggerInstance);
              hasChanges = true;
            }
          }
        }
      });

      // Return transformation result if changes were made
      if (hasChanges) {
        const result = {
          code: magicString.toString(),
          map: sourceMap ? magicString.generateMap({
            source: id,
            includeContent: true,
            hires: true
          }) : null
        };
        return result;
      }

      return null;
    }
  };
}

/**
 * Check if a CallExpression node is a loglevel function call
 * @param {Object} node - AST CallExpression node
 * @param {Set<string>} logLevelSet - Set of log levels to match
 * @returns {boolean} True if it's a loglevel call
 */
function isLoglevelCall(node, logLevelSet) {
  const { callee } = node;

  // Check for direct method calls like log.debug(), logger.info(), etc.
  if (callee.type === 'MemberExpression' &&
      callee.property &&
      callee.property.type === 'Identifier' &&
      logLevelSet.has(callee.property.name)) {

    // Additional check to ensure it's a logger instance
    // Look for common logger patterns in the object name
    const loggerInstance = getLoggerInstanceForValidation(callee);
    return isLikelyLoggerInstance(loggerInstance);
  }

  return false;
}

/**
 * Get logger instance for validation purposes
 * @param {Object} callee - The callee node (MemberExpression)
 * @returns {string|null} Logger instance name or null if not found
 */
function getLoggerInstanceForValidation(callee) {
  if (callee.object && callee.object.type === 'Identifier') {
    return callee.object.name;
  }
  return null;
}

/**
 * Check if an instance name is likely a logger
 * @param {string} instanceName - The instance name to check
 * @returns {boolean} True if it's likely a logger instance
 */
function isLikelyLoggerInstance(instanceName) {
  if (!instanceName) return true; // Allow complex expressions by default

  // Common logger instance patterns
  const loggerPatterns = [
    /^log$/i,
    /^logger$/i,
    /.*log$/i,
    /.*logger$/i,
    /^this$/i // Allow this.log, this.logger, etc.
  ];

  return loggerPatterns.some(pattern => pattern.test(instanceName));
}

/**
 * Extract the logger instance name from a member expression
 * @param {Object} callee - The callee node (MemberExpression)
 * @param {string} code - Original source code
 * @returns {string|null} Logger instance name or null if not found
 */
function getLoggerInstance(callee, code) {
  if (callee.type === 'MemberExpression' && callee.object) {
    // For simple cases like 'log.debug()', return 'log'
    if (callee.object.type === 'Identifier') {
      return callee.object.name;
    }

    // For complex cases like 'this.logger.debug()', extract the full expression
    if (callee.object.type === 'MemberExpression') {
      return code.slice(callee.object.start, callee.object.end);
    }

    // For other cases, try to extract the object expression
    return code.slice(callee.object.start, callee.object.end);
  }

  return null;
}

/**
 * Transform a loglevel call to wrap arguments with format function
 * @param {Object} node - AST CallExpression node
 * @param {MagicString} magicString - MagicString instance for modifications
 * @param {string} code - Original source code
 * @param {string} loggerInstance - Logger instance name
 */
function transformCall(node, magicString, code, loggerInstance) {
  const { arguments: args } = node;

  if (args.length === 0) {
    return;
  }

  // Get the range of the arguments
  const argsStart = args[0].start;
  const argsEnd = args[args.length - 1].end;

  // Extract the original arguments
  const originalArgs = code.slice(argsStart, argsEnd);

  // Create the new arguments wrapped with prefix function
  const newArgs = `...${loggerInstance}.prefix(${originalArgs})`;

  // Replace the arguments in the magic string
  magicString.overwrite(argsStart, argsEnd, newArgs);
}

// Export the plugin as both default and named export for compatibility
export { loglevelBrowserPrefixPlugin };