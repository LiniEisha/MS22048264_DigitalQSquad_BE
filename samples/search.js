// File: search.js
async function searchArticles(keyword) {
    // Mock search function for articles
    return [
        { id: 1, title: 'Article 1', content: 'Content of article 1' },
        { id: 2, title: 'Article 2', content: 'Content of article 2' }
    ];
}

async function searchBlogs(keyword) {
    // Mock search function for blogs
    return [
        { id: 1, title: 'Blog 1', content: 'Content of blog 1' },
        { id: 2, title: 'Blog 2', content: 'Content of blog 2' }
    ];
}

async function searchForums(keyword) {
    // Mock search function for forums
    return [
        { id: 1, title: 'Forum Post 1', content: 'Content of forum post 1' },
        { id: 2, title: 'Forum Post 2', content: 'Content of forum post 2' }
    ];
}

module.exports = {
    searchArticles,
    searchBlogs,
    searchForums
};
