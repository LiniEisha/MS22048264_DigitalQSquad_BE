const acorn = require("acorn");
const walk = require("acorn-walk");

function cleanSourceCode(sourceCode) {
  return sourceCode.replace(/`([^`]*)`/g, '""')
                   .replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '') 
                   .replace(/\/\/[^\n]*/g, '');
}

function calculateCyclomaticComplexity(sourceCode) {
  sourceCode = cleanSourceCode(sourceCode);
  let ast;
  try {
    ast = acorn.parse(sourceCode, { ecmaVersion: 2020, sourceType: 'module' });
  } catch (error) {
    console.error('Error parsing source code for cyclomatic complexity:', error.message);
    throw error;
  }

  let decisionPoints = 0;

  walk.simple(ast, {
    IfStatement() { decisionPoints++; },
    ForStatement() { decisionPoints++; },
    ForInStatement() { decisionPoints++; },
    ForOfStatement() { decisionPoints++; },
    WhileStatement() { decisionPoints++; },
    DoWhileStatement() { decisionPoints++; },
    SwitchCase(node) { if (node.test !== null) decisionPoints++; },
  });

  console.log('Cyclomatic Complexity calculated:', decisionPoints + 1);
  return decisionPoints + 1;
}

module.exports = { calculateCyclomaticComplexity };
