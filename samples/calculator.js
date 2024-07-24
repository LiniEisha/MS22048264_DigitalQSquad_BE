// File: calculator.js
class Calculator {
    performOperation(operation, a, b) {
        switch (operation) {
            case 'add':
                return this.add(a, b);
            case 'subtract':
                return this.subtract(a, b);
            case 'multiply':
                return this.multiply(a, b);
            case 'divide':
                return this.divide(a, b);
            case 'modulus':
                return this.modulus(a, b);
            case 'exponent':
                return this.exponent(a, b);
            case 'sqrt':
                return this.sqrt(a);
            default:
                throw new Error('Invalid operation');
        }
    }

    add(a, b) {
        return a + b;
    }

    subtract(a, b) {
        return a - b;
    }

    multiply(a, b) {
        return a * b;
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        return a / b;
    }

    modulus(a, b) {
        return a % b;
    }

    exponent(a, b) {
        return Math.pow(a, b);
    }

    sqrt(a) {
        if (a < 0) {
            throw new Error('Square root of negative number');
        }
        return Math.sqrt(a);
    }
}

export { Calculator };
