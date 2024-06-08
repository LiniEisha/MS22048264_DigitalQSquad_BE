const acorn = require("acorn");
const walk = require("acorn-walk");
const ComplexityResult = require('../models/complexityModel');

function calculateCyclomaticComplexity(sourceCode) {
  const ast = acorn.parse(sourceCode, { ecmaVersion: 2020 });
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

  return decisionPoints + 1;
}

function calculateWeightedCompositeComplexity(sourceCode) {
  const ast = acorn.parse(sourceCode, { ecmaVersion: 2020 });
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
  return weightedComplexity;
}

exports.analyzeComplexity = async (req, res) => {
  try {
    const { moduleName, sourceCode } = req.body;

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
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getResults = async (req, res) => {
  try {
    const results = await ComplexityResult.find();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
