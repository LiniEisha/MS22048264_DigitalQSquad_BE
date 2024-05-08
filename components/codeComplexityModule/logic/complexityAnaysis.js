const acorn = require("acorn");
const walk = require("acorn-walk");

/**
 * Calculates the cyclomatic complexity of a JavaScript source code.
 * @param {string} sourceCode - The source code to analyze.
 * @returns {number} The cyclomatic complexity.
 */
function calculateCyclomaticComplexity(sourceCode) {
  const ast = acorn.parse(sourceCode, { ecmaVersion: 2020 });
  let decisionPoints = 0;

  // Define decision nodes (if, for, while, etc.)
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
    IfStatement(node) {
      decisionPoints++;
    },
    ForStatement(node) {
      decisionPoints++;
    },
    ForInStatement(node) {
      decisionPoints++;
    },
    ForOfStatement(node) {
      decisionPoints++;
    },
    WhileStatement(node) {
      decisionPoints++;
    },
    DoWhileStatement(node) {
      decisionPoints++;
    },
    SwitchCase(node) {
      if (node.test !== null) decisionPoints++; // Ignore default case
    },
  });

  return decisionPoints + 1; // V(G) = d + 1
}

/**
 * Calculate weighted composite complexity based on control structures and nesting.
 * This function assumes `calculateCyclomaticComplexity` has been used to handle basic control structure counting.
 * @param {string} sourceCode - The source code to analyze.
 * @returns {number} The weighted composite complexity.
 */
function calculateWeightedCompositeComplexity(sourceCode) {
  const ast = acorn.parse(sourceCode, { ecmaVersion: 2020 });
  let weightedComplexity = 0;
  let currentNestingLevel = 0;

  // A recursive function to handle nesting
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
    if (node.consequent) {
      computeWeight(node.consequent, level + 1);
    }
    if (node.alternate) {
      computeWeight(node.alternate, level + 1);
    }
  }

  computeWeight(ast);
  return weightedComplexity;
}

// Example usage:
const sourceCode = `
function example() {
  if (true) {
    for (let i = 0; i < 10; i++) {
      console.log(i);
    }
  }
}
`;

console.log(
  "Cyclomatic Complexity:",
  calculateCyclomaticComplexity(sourceCode)
);
console.log(
  "Weighted Composite Complexity:",
  calculateWeightedCompositeComplexity(sourceCode)
);
