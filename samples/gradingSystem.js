// File: gradingSystem.js
class GradingSystem {
    constructor() {
        this.students = {};
    }

    addStudent(studentId, name) {
        if (!this.students[studentId]) {
            this.students[studentId] = { name, scores: [] };
        }
    }

    assignScore(studentId, score) {
        if (this.students[studentId]) {
            const grade = this.calculateGrade(score);
            this.students[studentId].scores.push({ score, grade });
        }
    }

    calculateGrade(score) {
        if (score > 85) return 'A';
        if (score > 75) return 'B';
        if (score > 65) return 'C';
        if (score > 50) return 'D';
        return 'F';
    }

    calculateAverageScore(studentId) {
        if (this.students[studentId] && this.students[studentId].scores.length > 0) {
            const scores = this.students[studentId].scores.map(s => s.score);
            const total = scores.reduce((acc, score) => acc + score, 0);
            return total / scores.length;
        }
        return 0;
    }

    calculateAverageGrade(studentId) {
        if (this.students[studentId] && this.students[studentId].scores.length > 0) {
            const grades = this.students[studentId].scores.map(s => s.grade);
            const gradePoints = grades.map(grade => this.gradeToPoints(grade));
            const total = gradePoints.reduce((acc, points) => acc + points, 0);
            const averagePoints = total / gradePoints.length;
            return this.pointsToGrade(averagePoints);
        }
        return 'F';
    }

    gradeToPoints(grade) {
        const gradeMap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
        return gradeMap[grade];
    }

    pointsToGrade(points) {
        if (points >= 3.85) return 'A';
        if (points >= 2.85) return 'B';
        if (points >= 1.85) return 'C';
        if (points >= 0.85) return 'D';
        return 'F';
    }

    isPassing(studentId) {
        const averageScore = this.calculateAverageScore(studentId);
        return averageScore >= 60;
    }

    generateReport() {
        const report = [];
        for (const studentId in this.students) {
            const student = this.students[studentId];
            const averageScore = this.calculateAverageScore(studentId);
            const averageGrade = this.calculateAverageGrade(studentId);
            const passing = this.isPassing(studentId) ? 'Passing' : 'Failing';
            report.push({
                studentId,
                name: student.name,
                averageScore,
                averageGrade,
                status: passing
            });
        }
        return report;
    }
}

module.exports = GradingSystem;
