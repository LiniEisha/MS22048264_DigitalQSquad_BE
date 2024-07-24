// File: gradingSystem.test.js
import { expect } from 'chai';
import { GradingSystem } from './gradingSystem.js';

describe('Grading System', () => {
    let gradingSystem;

    beforeEach(() => {
        gradingSystem = new GradingSystem();
        gradingSystem.addStudent(1, 'Alice');
        gradingSystem.addStudent(2, 'Bob');
    });

    it('should add students', () => {
        expect(Object.keys(gradingSystem.students).length).to.equal(2);
    });

    it('should assign scores to students', () => {
        gradingSystem.assignScore(1, 85);
        expect(gradingSystem.students[1].scores.length).to.equal(1);
    });

    it('should calculate the average score for a student', () => {
        gradingSystem.assignScore(1, 85);
        gradingSystem.assignScore(1, 90);
        const average = gradingSystem.calculateAverageScore(1);
        expect(average).to.equal(87.5);
    });

    it('should calculate the average grade for a student', () => {
        gradingSystem.assignScore(1, 85);
        gradingSystem.assignScore(1, 90);
        const averageGrade = gradingSystem.calculateAverageGrade(1);
        expect(averageGrade).to.equal('A');
    });

    it('should determine if a student is passing', () => {
        gradingSystem.assignScore(1, 85);
        gradingSystem.assignScore(1, 90);
        const passing = gradingSystem.isPassing(1);
        expect(passing).to.be.true;
    });

    it('should generate a report for each student', () => {
        gradingSystem.assignScore(1, 85);
        gradingSystem.assignScore(2, 50);
        const report = gradingSystem.generateReport();
        expect(report.length).to.equal(2);
        expect(report[0].status).to.equal('Passing');
        expect(report[1].status).to.equal('Failing');
    });
});
