// Test file to verify the plugin transformation
import loglevelFormat from './plugin.js';

// Example test case
const testCode = `
const log = require('loglevel');

log.debug('Here are all of the things', variable, object);
logger.info('User logged in', userId, userAgent);
this.log.warn('Connection timeout', timeout, retryCount);
console.log('This should not be transformed');
`;

// Test the plugin
const plugin = loglevelFormat();
const result = plugin.transform(testCode, 'test.js');

console.log('Original code:');
console.log(testCode);
console.log('\nTransformed code:');
console.log(result ? result.code : 'No transformation applied');
