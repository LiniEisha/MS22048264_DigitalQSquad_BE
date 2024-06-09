const acorn = require("acorn");

function cleanSourceCode(sourceCode) {
  return sourceCode.replace(/`([^`]*)`/g, '""')
                   .replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '') 
                   .replace(/\/\/[^\n]*/g, '');
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

  function tokenize(node) {
    let tokens = [];
    switch (node.type) {
      case 'Literal':
        tokens.push(node.raw);
        break;
      case 'Identifier':
        tokens.push(node.name);
        break;
      case 'BinaryExpression':
      case 'LogicalExpression':
        tokens.push(...tokenize(node.left));
        tokens.push(node.operator);
        tokens.push(...tokenize(node.right));
        break;
      case 'VariableDeclaration':
        tokens.push(node.kind);
        node.declarations.forEach(decl => {
          tokens.push(...tokenize(decl.id));
          if (decl.init) {
            tokens.push('=');
            tokens.push(...tokenize(decl.init));
          }
        });
        break;
      case 'VariableDeclarator':
        tokens.push(node.id.name);
        if (node.init) {
          tokens.push('=');
          tokens.push(...tokenize(node.init));
        }
        break;
      case 'ExpressionStatement':
        tokens.push(...tokenize(node.expression));
        break;
      case 'CallExpression':
        tokens.push(node.callee.name);
        tokens.push('(');
        node.arguments.forEach(arg => {
          tokens.push(...tokenize(arg));
          tokens.push(',');
        });
        tokens.pop(); 
        tokens.push(')');
        break;
      case 'MemberExpression':
        tokens.push(...tokenize(node.object));
        tokens.push('.');
        tokens.push(node.property.name);
        break;
      case 'BlockStatement':
      case 'Program':
        node.body.forEach(innerNode => {
          tokens.push(...tokenize(innerNode));
        });
        break;
      case 'IfStatement':
        tokens.push('if');
        tokens.push('(');
        tokens.push(...tokenize(node.test));
        tokens.push(')');
        tokens.push(...tokenize(node.consequent));
        if (node.alternate) {
          tokens.push('else');
          tokens.push(...tokenize(node.alternate));
        }
        break;
      case 'ForStatement':
        tokens.push('for');
        tokens.push('(');
        tokens.push(...tokenize(node.init));
        tokens.push(';');
        tokens.push(...tokenize(node.test));
        tokens.push(';');
        tokens.push(...tokenize(node.update));
        tokens.push(')');
        tokens.push(...tokenize(node.body));
        break;
      case 'WhileStatement':
        tokens.push('while');
        tokens.push('(');
        tokens.push(...tokenize(node.test));
        tokens.push(')');
        tokens.push(...tokenize(node.body));
        break;
      // Add other node types as needed
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

module.exports = { calculateWeightedCompositeComplexity };
