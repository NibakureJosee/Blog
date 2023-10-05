const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for data retrieval and analysis
app.get('/api/blog-stats', async (req, res) => {
  try {
    // Fetch data from the third-party API
    const blogData = await fetchDataFromAPI();

    // Perform data analysis using Lodash
    const totalBlogs = blogData.length;
    const longestTitle = findLongestTitle(blogData);
    const privacyBlogsCount = countPrivacyBlogs(blogData);
    const uniqueTitles = getUniqueTitles(blogData);

    // Create a response object with analytics
    const response = {
      totalBlogs,
      longestTitle,
      privacyBlogsCount,
      uniqueTitles,
    };

    res.json(response);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching or analyzing blog data.' });
  }
});

// Helper function to fetch data from the API
async function fetchDataFromAPI() {
  const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';
  const adminSecret = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

  const response = await axios.get(apiUrl, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  });

  return response.data;
}

// Helper function to find the blog with the longest title
function findLongestTitle(data) {
  const longestBlog = _.maxBy(data, (blog) => blog.title.length);
  return longestBlog.title;
}

// Helper function to count blogs with "privacy" in the title
function countPrivacyBlogs(data) {
  const privacyBlogs = _.filter(data, (blog) => blog.title.toLowerCase().includes('privacy'));
  return privacyBlogs.length;
}

// Helper function to get an array of unique blog titles
function getUniqueTitles(data) {
  const uniqueTitles = _.uniqBy(data, 'title').map((blog) => blog.title);
  return uniqueTitles;
}

// Route for blog search
app.get('/api/blog-search', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "query" is required.' });
  }

  try {
    // Filter blogs based on the query (case-insensitive)
    const matchingBlogs = searchBlogsByQuery(query);

    res.json(matchingBlogs);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while searching for blogs.' });
  }
});

// Helper function to search blogs by query
function searchBlogsByQuery(query) {
  // Note: You need to fetch data from the API here or pass 'blogData' to this function

  // Use Lodash to filter blogs based on the query (case-insensitive)
  const matchingBlogs = _.filter(blogData, (blog) =>
    blog.title.toLowerCase().includes(query.toLowerCase())
  );

  return matchingBlogs;
}

const memoizeConfig = {
  maxAge: 60000, // Cache for 1 minute (adjust as needed)
};

// Memoize the data retrieval function
const memoizedFetchDataFromAPI = _.memoize(fetchDataFromAPI, memoizeConfig);

// Middleware for data retrieval and analysis (with memoization)
app.get('/api/blog-stats-memoized', async (req, res) => {
  try {
    // Fetch data from the third-party API (memoized)
    const blogData = await memoizedFetchDataFromAPI();

    // ... (rest of the analysis and response logic)
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching or analyzing blog data.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
