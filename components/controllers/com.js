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

  return decisionPoints + 1;
}

// Weighted Composite Complexity Calculation
// function tokenize(line) {
//   return line.match(/[a-zA-Z_]\w*|'.*?'|".*?"|\d+|[^\w\s]/g) || [];
// }

function tokenize(line) {
  return line.match(/(?<!\breturn\b)(?<!\btry\b)(\b(int|float|double|char|void|short|long|signed|unsigned|if|for|while|switch|case|default|break|continue|goto|sizeof|typedef|extern|register|static|auto|const|volatile|inline|restrict|else|do|catch)\b|\b[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)|\b[A-Za-z_][A-Za-z0-9_]*\[\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(\.\d+)?\b|[\+\-\*\/=<>!&|]+|\.)/g) || [];
  console.log(line);
}
function calculateWt(line, nestingLevel, inheritanceLevel) {
    const controlStructureWeights = {
        'if': 1, 'else': 1, 'for': 2, 'while': 2, 'do': 2, 'switch': 1,
        'try': 0, 'catch': 1, 'finally': 1
    };
    let wc = 0;
    let wi = inheritanceLevel;
    const tokens = tokenize(line);
    console.log(line);
    console.log(tokens);
    for (let token of tokens) {
        if (controlStructureWeights[token] !== undefined) {
            wc += controlStructureWeights[token];
        } else if (token === 'case') {
            wc += 1;
        }
    }
    let wn = nestingLevel;
    let wt = wc + wn + wi;
    return wt;
}

function calculateWcc(line, nestingLevel, inheritanceLevel) {
    const tokens = tokenize(line);
    const s = tokens.length;
    const wt = calculateWt(line, nestingLevel, inheritanceLevel);
    return s * wt;
}

function processCode(code) {
    const lines = code.split('\n');
    let wccValues = [];
    let nestingLevel = 0;
    let inheritanceLevel = 0;
    for (let line of lines) {
        let strippedLine = line.trim();
        if (strippedLine.startsWith('class')) {
            inheritanceLevel++;
        } else if (strippedLine.startsWith('}')) {
            nestingLevel--;
        }
        let wcc = calculateWcc(line, nestingLevel, inheritanceLevel);
        wccValues.push(wcc);
        if (strippedLine.endsWith('{')) {
            nestingLevel++;
        }
    }
    return wccValues;
}

function calculateWeightedCompositeComplexity(sourceCode) {
    const wccValues = processCode(sourceCode);
    return wccValues.reduce((acc, val) => acc + val, 0);
}

// Export the functions
exports.calculateCyclomaticComplexity = calculateCyclomaticComplexity;
exports.calculateWeightedCompositeComplexity = calculateWeightedCompositeComplexity;

// Complexity Controller Methods
exports.analyzeComplexity = async (req, res) => {
  try {
    const { moduleName, sourceCode } = req.body;

    const cyclomaticComplexity = calculateCyclomaticComplexity(sourceCode);
    const weightedCompositeComplexity = calculateWeightedCompositeComplexity(sourceCode);

    let complexityLevel = "Low";

    if (cyclomaticComplexity > 10) {
      complexityLevel = "Complex";
    } else {
      complexityLevel = "Low";
    }

    if (weightedCompositeComplexity <= 46.74) {
      complexityLevel = "Low";
    } else if (weightedCompositeComplexity <= 182.58) {
      complexityLevel = "Moderate";
    } else if (weightedCompositeComplexity <= 466) {
      complexityLevel = "Complex";
    } else {
      complexityLevel = "High Complex";
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
