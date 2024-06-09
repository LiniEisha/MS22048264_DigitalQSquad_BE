const acorn = require("acorn");
const walk = require("acorn-walk");
const ComplexityResult = require('../models/complexityModel');

function cleanSourceCode(sourceCode) {
  // Remove content within template literals and other non-JavaScript code
  // This regex replaces the content inside template literals with an empty string
  return sourceCode.replace(/`([^`]*)`/g, '""')
                   .replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '') // Remove block comments
                   .replace(/\/\/[^\n]*/g, ''); // Remove line comments
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

  const decisionNodeTypes = new Set([
    "IfStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "WhileStatement",
    "DoWhileStatement",
    "SwitchCase",
  ]);

  walk.simple(ast, {
    IfStatement(node) { decisionPoints++; },
    ForStatement(node) { decisionPoints++; },
    ForInStatement(node) { decisionPoints++; },
    ForOfStatement(node) { decisionPoints++; },
    WhileStatement(node) { decisionPoints++; },
    DoWhileStatement(node) { decisionPoints++; },
    SwitchCase(node) { if (node.test !== null) decisionPoints++; },
  });

  console.log('Cyclomatic Complexity calculated:', decisionPoints + 1);
  return decisionPoints + 1;
}

function calculateWeightedCompositeComplexity(sourceCode) {
  sourceCode = cleanSourceCode(sourceCode);
  let ast;
  try {
    ast = acorn.parse(sourceCode, { ecmaVersion: 2020, sourceType: 'module' });
  } catch (error) {
    console.error('Error parsing source code for weighted composite complexity:', error.message);
    throw error;
  }

  let weightedComplexity = 0;

  function computeWeight(node, level = 0) {
    let localWeight = 0;

    if (node.type === "BlockStatement") {
      level++;
      node.body.forEach((innerNode) => computeWeight(innerNode, level));
    } else if (node.type === "IfStatement" || node.type === "SwitchStatement") {
      localWeight = 1 + level;
    } else if (
      node.type === "ForStatement" ||
      node.type === "WhileStatement" ||
      node.type === "DoWhileStatement"
    ) {
      localWeight = 2 + level;
    }

    weightedComplexity += localWeight;
    if (node.consequent) computeWeight(node.consequent, level + 1);
    if (node.alternate) computeWeight(node.alternate, level + 1);
  }

  computeWeight(ast);
  console.log('Weighted Composite Complexity calculated:', weightedComplexity);
  return weightedComplexity;
}

exports.calculateCyclomaticComplexity = calculateCyclomaticComplexity;
exports.calculateWeightedCompositeComplexity = calculateWeightedCompositeComplexity;

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
