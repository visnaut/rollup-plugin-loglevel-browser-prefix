import loglevelFormat from './plugin.js';

// Test cases with different scenarios
const testCases = [
  {
    name: 'Basic loglevel calls',
    code: `
log.debug('Debug message', variable);
log.info('Info with multiple args', arg1, arg2, arg3);
log.warn('Warning', { key: 'value' });
log.error('Error occurred', error.message);
log.trace('Trace call', stackTrace);
`
  },
  {
    name: 'Different logger instances',
    code: `
logger.debug('Logger instance');
this.log.info('Method logger');
app.logger.warn('Nested property logger');
getLogger().error('Function call logger');
`
  },
  {
    name: 'Mixed with non-loglevel calls',
    code: `
console.log('Should not transform');
log.debug('Should transform');
customFunction.debug('Should not transform');
log.customMethod('Should not transform');
`
  },
  {
    name: 'Calls without arguments',
    code: `
log.debug();
log.info('With args', arg);
log.warn();
`
  }
];

console.log('=== Rollup Plugin Loglevel Format Test ===\\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('Input:');
  console.log(testCase.code);
  
  const plugin = loglevelFormat();
  const result = plugin.transform(testCase.code, `test${index + 1}.js`);
  
  console.log('Output:');
  console.log(result ? result.code : 'No transformation applied');
  console.log('---\\n');
});

// Test with custom options
console.log('Test with custom options (only debug and info levels):');
const customPlugin = loglevelFormat({
  logLevels: ['debug', 'info']
});

const customTestCode = `
log.debug('Should transform');
log.info('Should transform');
log.warn('Should NOT transform');
log.error('Should NOT transform');
`;

console.log('Input:');
console.log(customTestCode);

const customResult = customPlugin.transform(customTestCode, 'custom-test.js');
console.log('Output:');
console.log(customResult ? customResult.code : 'No transformation applied');
