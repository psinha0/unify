/**
 * Centralized topic definitions for behavior tracking
 * This file contains the mapping between topics and their related keywords
 * Import this file anywhere topic analysis is needed to ensure consistency
 */

const topicDefinitions = {
  // Entertainment
  'music': ['music', 'song', 'band', 'concert', 'playlist', 'album', 'singer', 'guitar', 'piano', 'melody', 'lyrics'],
  'movies': ['movie', 'film', 'cinema', 'watch', 'actor', 'actress', 'director', 'scene', 'series', 'show', 'hollywood'],
  'gaming': ['game', 'gaming', 'play', 'player', 'console', 'xbox', 'playstation', 'nintendo', 'steam', 'pc gaming'],
  
  // Lifestyle
  'travel': ['travel', 'trip', 'vacation', 'visit', 'flight', 'hotel', 'destination', 'city', 'country', 'tour', 'backpacking'],
  'food': ['food', 'restaurant', 'eat', 'dinner', 'lunch', 'recipe', 'cook', 'meal', 'delicious', 'taste', 'cuisine'],
  'sports': ['sport', 'team', 'match', 'win', 'workout', 'exercise', 'athlete', 'competition', 'fitness', 'football', 'basketball'],
  
  // Professional
  'tech': ['tech', 'technology', 'computer', 'phone', 'app', 'software', 'device', 'internet', 'digital', 'online', 'code'],
  'education': ['learn', 'study', 'school', 'college', 'university', 'degree', 'class', 'course', 'teacher', 'student', 'knowledge'],
  'work': ['work', 'job', 'career', 'office', 'business', 'meeting', 'project', 'company', 'manager', 'deadline', 'presentation'],
  
  // Arts & Culture
  'art': ['art', 'painting', 'drawing', 'design', 'creative', 'artist', 'gallery', 'museum', 'exhibit', 'sculpture', 'aesthetic'],
  'books': ['book', 'read', 'author', 'novel', 'story', 'literature', 'chapter', 'character', 'fiction', 'nonfiction', 'genre'],
  'fashion': ['fashion', 'clothes', 'style', 'wear', 'outfit', 'dress', 'designer', 'trend', 'shopping', 'brand', 'accessory'],
  
  // Personal
  'health': ['health', 'doctor', 'medical', 'wellness', 'diet', 'sleep', 'healthy', 'hospital', 'medicine', 'therapy', 'mental health'],
  'family': ['family', 'parent', 'child', 'mom', 'dad', 'brother', 'sister', 'relative', 'grandparent', 'kid', 'home'],
  'pets': ['pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'walk', 'vet', 'veterinarian', 'adopt', 'rescue']
};

/**
 * Get a list of all available topics
 * @returns {string[]} Array of all topic names
 */
const getAllTopics = () => {
  return Object.keys(topicDefinitions);
};

/**
 * Get keywords for a specific topic
 * @param {string} topic - The topic to get keywords for
 * @returns {string[]} Array of keywords or empty array if topic doesn't exist
 */
const getKeywordsForTopic = (topic) => {
  return topicDefinitions[topic] || [];
};

/**
 * Check if a text contains keywords related to a specific topic
 * @param {string} text - The text to analyze
 * @param {string} topic - The topic to check for
 * @returns {boolean} True if the text contains keywords related to the topic
 */
const textContainsTopic = (text, topic) => {
  if (!text || !topic || !topicDefinitions[topic]) return false;
  
  const lowerText = text.toLowerCase();
  return topicDefinitions[topic].some(keyword => lowerText.includes(keyword));
};

/**
 * Analyze text to find all matching topics
 * @param {string} text - The text to analyze
 * @returns {Object} Map of topic names to boolean (true if topic was found)
 */
const analyzeTextForTopics = (text) => {
  if (!text) return {};
  
  const lowerText = text.toLowerCase();
  const matches = {};
  
  Object.keys(topicDefinitions).forEach(topic => {
    if (topicDefinitions[topic].some(keyword => lowerText.includes(keyword))) {
      matches[topic] = true;
    }
  });
  
  return matches;
};

export {
  topicDefinitions,
  getAllTopics,
  getKeywordsForTopic,
  textContainsTopic,
  analyzeTextForTopics
};