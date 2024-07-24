// File: calculator.test.js
import { expect } from 'chai';
import { Calculator } from './calculator.js';

describe('Calculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new Calculator();
    });

    it('should add two numbers', () => {
        const result = calculator.performOperation('add', 5, 3);
        expect(result).to.equal(8);
    });

    it('should subtract two numbers', () => {
        const result = calculator.performOperation('subtract', 5, 3);
        expect(result).to.equal(2);
    });

    it('should multiply two numbers', () => {
        const result = calculator.performOperation('multiply', 5, 3);
        expect(result).to.equal(15);
    });

    it('should divide two numbers', () => {
        const result = calculator.performOperation('divide', 6, 3);
        expect(result).to.equal(2);
    });

    it('should perform modulus of two numbers', () => {
        const result = calculator.performOperation('modulus', 5, 3);
        expect(result).to.equal(2);
    });

    it('should exponentiate two numbers', () => {
        const result = calculator.performOperation('exponent', 2, 3);
        expect(result).to.equal(8);
    });

    it('should calculate square root of a number', () => {
        const result = calculator.performOperation('sqrt', 9);
        expect(result).to.equal(3);
    });

    it('should throw an error for invalid operation', () => {
        expect(() => calculator.performOperation('invalid', 5, 3)).to.throw('Invalid operation');
    });

    it('should throw an error for division by zero', () => {
        expect(() => calculator.performOperation('divide', 5, 0)).to.throw('Division by zero');
    });

    it('should throw an error for square root of negative number', () => {
        expect(() => calculator.performOperation('sqrt', -1)).to.throw('Square root of negative number');
    });
});
