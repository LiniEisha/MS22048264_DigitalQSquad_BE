// File: search.test.js
(async () => {
    const { expect } = await import('chai');
    const { searchArticles, searchBlogs, searchForums } = require('./search');

    describe('Search Function', () => {
        it('should return articles matching the keyword', async () => {
            const results = await searchArticles('keyword');
            expect(results).to.be.an('array');
            expect(results.length).to.be.above(0);
        });

        it('should return blogs matching the keyword', async () => {
            const results = await searchBlogs('keyword');
            expect(results).to.be.an('array');
            expect(results.length).to.be.above(0);
        });

        it('should return forums matching the keyword', async () => {
            const results = await searchForums('keyword');
            expect(results).to.be.an('array');
            expect(results.length).to.be.above(0);
        });
    });
})();
