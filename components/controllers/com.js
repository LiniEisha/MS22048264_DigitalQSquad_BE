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
  console.log('Cleaned Source Code:', sourceCode);
  let ast;
  try {
    ast = acorn.parse(sourceCode, { ecmaVersion: 2020, sourceType: 'module' });
  } catch (error) {
    console.error('Error parsing source code for cyclomatic complexity:', error.message);
    throw error;
  }

  let decisionPoints = 0;

  walk.simple(ast, {
    IfStatement() { decisionPoints++; console.log('IfStatement encountered.'); },
    ForStatement() { decisionPoints++; console.log('ForStatement encountered.'); },
    ForInStatement() { decisionPoints++; console.log('ForInStatement encountered.'); },
    ForOfStatement() { decisionPoints++; console.log('ForOfStatement encountered.'); },
    WhileStatement() { decisionPoints++; console.log('WhileStatement encountered.'); },
    DoWhileStatement() { decisionPoints++; console.log('DoWhileStatement encountered.'); },
    SwitchCase(node) { if (node.test !== null) decisionPoints++; console.log('SwitchCase encountered.'); },
  });

  console.log('Total Decision Points:', decisionPoints);
  return decisionPoints + 1;
}

// Weighted Composite Complexity Calculation
function tokenize(line) {
  const tokens = line.match(/(?<!\breturn\b)(?<!\btry\b)(\b(int|float|double|char|void|short|long|signed|unsigned|if|for|while|switch|case|default|break|continue|goto|sizeof|typedef|extern|register|static|auto|const|volatile|inline|restrict|else|do|catch)\b|\b[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)|\b[A-Za-z_][A-Za-z0-9_]*\[\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(\.\d+)?\b|[\+\-\*\/=<>!&|]+|\.)/g) || [];
  console.log('Tokens:', tokens);
  return tokens;
}

function calculateWt(line, nestingLevel, inheritanceLevel) {
    const controlStructureWeights = {
        'if': 1, 'else': 1, 'for': 2, 'while': 2, 'do': 2, 'switch': 1,
        'try': 0, 'catch': 1, 'finally': 1
    };
    let wc = 0;
    let wi = inheritanceLevel;
    const tokens = tokenize(line);
    for (let token of tokens) {
        if (controlStructureWeights[token] !== undefined) {
            wc += controlStructureWeights[token];
        } else if (token === 'case') {
            wc += 1;
        }
    }
    let wn = nestingLevel;
    let wt = wc + wn + wi;
    console.log('wt:', wt);
    return wt;
}

function calculateWcc(line, nestingLevel, inheritanceLevel) {
    const tokens = tokenize(line);
    const s = tokens.length;
    const wt = calculateWt(line, nestingLevel, inheritanceLevel);
    console.log('Tokens:', tokens);
    console.log('S:', s);
    console.log('Wt:', wt);
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
        console.log('Wcc for line:', wcc);
        if (strippedLine.endsWith('{')) {
            nestingLevel++;
        }
    }
    console.log('Wcc Values:', wccValues);
    return wccValues;
}

function calculateWeightedCompositeComplexity(sourceCode) {
    const wccValues = processCode(sourceCode);
    const totalWcc = wccValues.reduce((acc, val) => acc + val, 0);
    console.log('Total Wcc:', totalWcc);
    return totalWcc;
}

// Export the functions
exports.calculateCyclomaticComplexity = calculateCyclomaticComplexity;
exports.calculateWeightedCompositeComplexity = calculateWeightedCompositeComplexity;

// Complexity Controller Methods
exports.analyzeComplexity = async (req, res) => {
  try {
    const { moduleName, sourceCode } = req.body;

    console.log('Analyzing complexity for module:', moduleName);
    const cyclomaticComplexity = calculateCyclomaticComplexity(sourceCode);
    console.log('Cyclomatic Complexity:', cyclomaticComplexity);

    const weightedCompositeComplexity = calculateWeightedCompositeComplexity(sourceCode);
    console.log('Weighted Composite Complexity:', weightedCompositeComplexity);

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

    console.log('Complexity Level:', complexityLevel);

    const newResult = new ComplexityResult({
      moduleName,
      cyclomaticComplexity,
      weightedCompositeComplexity,
      complexityLevel,
      sourceCode  // Ensure the source code is stored
    });

    await newResult.save();
    console.log('Complexity analysis saved:', newResult);
    res.json({ message: 'Complexity analysis completed successfully', result: newResult });
  } catch (err) {
    console.error('Error analyzing complexity:', err.message);
    res.status(500).send('Server error');
  }
};

exports.getResults = async (req, res) => {
  try {
    const results = await ComplexityResult.find();
    console.log('Fetched results:', results);
    res.json(results);
  } catch (err) {
    console.error('Error fetching results:', err.message);
    res.status(500).send('Server error');
  }
};

exports.getComplexityById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching details for ID: ${id}`);
    const result = await ComplexityResult.findById(id);
    if (!result) {
      console.log('Module not found');
      return res.status(404).send({ error: 'Module not found' });
    }
    console.log('Module found:', result);
    res.json(result);
  } catch (err) {
    console.error('Error fetching module details:', err.message);
    res.status(500).send('Server error');
  }
};

exports.getHighComplexModules = async (req, res) => {
  try {
    const highComplexModules = await ComplexityResult.find({
      complexityLevel: { $in: ["Complex", "High Complex"] }
    });
    res.json(highComplexModules);
  } catch (err) {
    console.error('Error fetching high complexity modules:', err.message);
    res.status(500).send('Server error');
  }
};
