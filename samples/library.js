// File: library.js
class LibraryItem {
    constructor(title, year) {
        this.title = title;
        this.year = year;
    }

    getInfo() {
        return `${this.title} (${this.year})`;
    }
}

class Book extends LibraryItem {
    constructor(title, year, author, pages) {
        super(title, year);
        this.author = author;
        this.pages = pages;
    }

    getInfo() {
        return `${super.getInfo()} by ${this.author}, ${this.pages} pages`;
    }
}

class Magazine extends LibraryItem {
    constructor(title, year, issueNumber) {
        super(title, year);
        this.issueNumber = issueNumber;
    }

    getInfo() {
        return `${super.getInfo()}, Issue ${this.issueNumber}`;
    }
}

class DVD extends LibraryItem {
    constructor(title, year, duration) {
        super(title, year);
        this.duration = duration; // duration in minutes
    }

    getInfo() {
        return `${super.getInfo()}, ${this.duration} minutes`;
    }
}

class EBook extends Book {
    constructor(title, year, author, pages, fileSize) {
        super(title, year, author, pages);
        this.fileSize = fileSize; // fileSize in MB
    }

    getInfo() {
        return `${super.getInfo()}, File Size: ${this.fileSize} MB`;
    }
}

class PrintedBook extends Book {
    constructor(title, year, author, pages, weight) {
        super(title, year, author, pages);
        this.weight = weight; // weight in grams
    }

    getInfo() {
        return `${super.getInfo()}, Weight: ${this.weight} grams`;
    }
}

export { LibraryItem, Book, Magazine, DVD, EBook, PrintedBook };
