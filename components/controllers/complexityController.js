const acorn = require("acorn");
const walk = require("acorn-walk");
const ComplexityResult = require('../models/complexityModel');

// Cyclomatic Complexity Calculation
function cleanSourceCode(sourceCode) {
  return sourceCode.replace(/`([^`]*)`/g, '""')
                   .replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '') 
                   .replace(/\/\/[^\n]*/g, '');
}

function calculateCyclomaticComplexity(sourceCode) {
  sourceCode = cleanSourceCode(sourceCode);
  console.log('Source code for cyclomatic complexity calculation:', sourceCode);
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

// Weighted Composite Complexity Calculation
function calculateWeightedCompositeComplexity(sourceCode) {
  sourceCode = cleanSourceCode(sourceCode);
  console.log('Source code for weighted composite complexity calculation:', sourceCode);
  let ast;
  try {
    ast = acorn.parse(sourceCode, { ecmaVersion: 2020, sourceType: 'module' });
  } catch (error) {
    console.error('Error parsing source code for weighted composite complexity:', error.message);
    throw error;
  }

  let weightedComplexity = 0;

  function tokenize(node) {
    let tokens = [];
    switch (node.type) {
      // Various case handlers as in original
    }
    return tokens;
  }

  function computeWeight(node, level = 0) {
    let localWeight = 0;

    switch (node.type) {
      case 'IfStatement':
      case 'SwitchStatement':
        localWeight = 1;
        break;
      case 'ForStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
        localWeight = 2;
        break;
    }

    weightedComplexity += localWeight * (level + 1);
    if (node.consequent) computeWeight(node.consequent, level + 1);
    if (node.alternate) computeWeight(node.alternate, level + 1);
    if (node.body && Array.isArray(node.body)) {
      node.body.forEach(innerNode => computeWeight(innerNode, level + 1));
    }
  }

  ast.body.forEach(node => computeWeight(node));

  let lines = sourceCode.split('\n');
  lines.forEach(line => {
    let lineAst;
    try {
      lineAst = acorn.parseExpressionAt(line, 0, { ecmaVersion: 2020 });
    } catch (error) {
      console.error('Error parsing line for tokens:', error.message);
      return;
    }
    let tokens = tokenize(lineAst);
    let size = tokens.length;
    let weight = 0;

    function calculateLineWeight(node, level = 0) {
      let localWeight = 0;

      switch (node.type) {
        case 'IfStatement':
        case 'SwitchStatement':
          localWeight = 1;
          break;
        case 'ForStatement':
        case 'WhileStatement':
        case 'DoWhileStatement':
          localWeight = 2;
          break;
      }

      weight += localWeight * (level + 1);
      if (node.consequent) calculateLineWeight(node.consequent, level + 1);
      if (node.alternate) calculateLineWeight(node.alternate, level + 1);
      if (node.body && Array.isArray(node.body)) {
        node.body.forEach(innerNode => calculateLineWeight(innerNode, level + 1));
      }
    }

    calculateLineWeight(lineAst);
    let wcc = size * weight;
    console.log(`Line: ${line.trim()}, Tokens: ${tokens.join(', ')}, Size: ${size}, Weight: ${weight}, WCC: ${wcc}`);
  });

  return weightedComplexity;
}

// Export the functions
exports.calculateCyclomaticComplexity = calculateCyclomaticComplexity;
exports.calculateWeightedCompositeComplexity = calculateWeightedCompositeComplexity;


// Complexity Controller Methods
exports.analyzeComplexity = async (req, res) => {
  try {
    const { moduleName, sourceCode } = req.body;

    console.log('Analyzing complexity for module:', moduleName);
    console.log('Source code:', sourceCode);

    const cyclomaticComplexity = calculateCyclomaticComplexity(sourceCode);
    const weightedCompositeComplexity = calculateWeightedCompositeComplexity(sourceCode);

    let complexityLevel = "Low";
    if (cyclomaticComplexity > 10 || weightedCompositeComplexity > 154.75) {
      complexityLevel = "High";
    }

    console.log(`Cyclomatic Complexity (CC): ${cyclomaticComplexity}`);
    console.log(`Weighted Composite Complexity (WCC): ${weightedCompositeComplexity}`);
    console.log(`Complexity Level: ${complexityLevel}`);

    const newResult = new ComplexityResult({
      moduleName,
      cyclomaticComplexity,
      weightedCompositeComplexity,
      complexityLevel,
    });

    await newResult.save();
    res.json({ message: 'Complexity analysis completed successfully', result: newResult });
  } catch (err) {
    console.error('Error analyzing complexity:', err.message);
    res.status(500).send('Server error');
  }
};

exports.getResults = async (req, res) => {
  try {
    const results = await ComplexityResult.find();
    res.json(results);
  } catch (err) {
    console.error('Error fetching results:', err.message);
    res.status(500).send('Server error');
  }
};
