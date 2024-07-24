// File: library.test.js
import { expect } from 'chai';
import { LibraryItem, Book, Magazine, DVD, EBook, PrintedBook } from './library.js';

describe('Library System', () => {
    it('should create a LibraryItem', () => {
        const item = new LibraryItem('Generic Item', 2022);
        expect(item.getInfo()).to.equal('Generic Item (2022)');
    });

    it('should create a Book', () => {
        const book = new Book('Book Title', 2022, 'Author Name', 300);
        expect(book.getInfo()).to.equal('Book Title (2022) by Author Name, 300 pages');
    });

    it('should create a Magazine', () => {
        const magazine = new Magazine('Magazine Title', 2022, 5);
        expect(magazine.getInfo()).to.equal('Magazine Title (2022), Issue 5');
    });

    it('should create a DVD', () => {
        const dvd = new DVD('DVD Title', 2022, 120);
        expect(dvd.getInfo()).to.equal('DVD Title (2022), 120 minutes');
    });

    it('should create an EBook', () => {
        const ebook = new EBook('EBook Title', 2022, 'Author Name', 300, 2);
        expect(ebook.getInfo()).to.equal('EBook Title (2022) by Author Name, 300 pages, File Size: 2 MB');
    });

    it('should create a PrintedBook', () => {
        const printedBook = new PrintedBook('Printed Book Title', 2022, 'Author Name', 300, 500);
        expect(printedBook.getInfo()).to.equal('Printed Book Title (2022) by Author Name, 300 pages, Weight: 500 grams');
    });
});
