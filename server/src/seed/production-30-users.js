const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model.extended');
const Message = require('../models/message.model');
require('dotenv').config();

// 30 users organized in clusters for 95%+ match compatibility
const users = [
  // ===== CLUSTER 1: Outdoor Adventure Enthusiasts (6 users) =====
  {
    username: 'alex_example',
    email: 'alex@example.com',
    password: 'password123',
    interests: ['Hiking', 'Photography', 'Travel', 'Camping', 'Nature', 'Rock Climbing'],
    bio: 'Adventure seeker and photography enthusiast. Love exploring new trails and capturing beautiful moments in nature.',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Casual'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Outdoor adventures', 'Sports', 'Social gatherings'],
      availability: 'Weekend days'
    },
    values: ['Adventure', 'Health', 'Authenticity', 'Similar interests'],
    profileCompleteness: 95,
    lastQuestionnaireDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    username: 'sarah_summit',
    email: 'sarah@example.com',
    password: 'password123',
    interests: ['Hiking', 'Photography', 'Travel', 'Camping', 'Nature', 'Rock Climbing'],
    bio: 'Mountain lover and weekend warrior. Always planning the next adventure with my camera in hand.',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/45.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Casual'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Outdoor adventures', 'Sports', 'Social gatherings'],
      availability: 'Weekend days'
    },
    values: ['Adventure', 'Health', 'Authenticity', 'Similar interests'],
    profileCompleteness: 95,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'mike_mountains',
    email: 'mike@example.com',
    password: 'password123',
    interests: ['Hiking', 'Photography', 'Travel', 'Camping', 'Nature', 'Rock Climbing'],
    bio: 'Explorer at heart. Nothing beats the feeling of reaching a summit and taking in the view.',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/54.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Casual'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Outdoor adventures', 'Sports', 'Social gatherings'],
      availability: 'Weekend days'
    },
    values: ['Adventure', 'Health', 'Authenticity', 'Similar interests'],
    profileCompleteness: 94,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'emma_explorer',
    email: 'emma@example.com',
    password: 'password123',
    interests: ['Hiking', 'Photography', 'Travel', 'Camping', 'Nature', 'Rock Climbing'],
    bio: 'Adventure photographer capturing the beauty of Australian wilderness. Always seeking new trails!',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/62.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Casual'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Outdoor adventures', 'Sports', 'Social gatherings'],
      availability: 'Weekend days'
    },
    values: ['Adventure', 'Health', 'Authenticity', 'Similar interests'],
    profileCompleteness: 96,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'josh_journey',
    email: 'josh@example.com',
    password: 'password123',
    interests: ['Hiking', 'Photography', 'Travel', 'Camping', 'Nature', 'Rock Climbing'],
    bio: 'Trail runner and nature photographer. Living for those sunrise hikes and golden hour shots.',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/71.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Casual'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Outdoor adventures', 'Sports', 'Social gatherings'],
      availability: 'Weekend days'
    },
    values: ['Adventure', 'Health', 'Authenticity', 'Similar interests'],
    profileCompleteness: 93,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'lisa_peaks',
    email: 'lisa@example.com',
    password: 'password123',
    interests: ['Hiking', 'Photography', 'Travel', 'Camping', 'Nature', 'Rock Climbing'],
    bio: 'Weekend adventurer and climbing enthusiast. Nothing beats camping under the stars!',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/28.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Casual'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Outdoor adventures', 'Sports', 'Social gatherings'],
      availability: 'Weekend days'
    },
    values: ['Adventure', 'Health', 'Authenticity', 'Similar interests'],
    profileCompleteness: 95,
    lastQuestionnaireDate: new Date()
  },

  // ===== CLUSTER 2: Fitness & Wellness (5 users) =====
  {
    username: 'ryan_runner',
    email: 'ryan@example.com',
    password: 'password123',
    interests: ['Running', 'Fitness', 'Yoga', 'Nutrition', 'Wellness', 'Marathon Training'],
    bio: 'Marathon runner and fitness coach. Passionate about health, wellness, and helping others reach their goals.',
    location: 'Melbourne, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Deep conversations'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Personal growth'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Sports', 'Outdoor adventures'],
      availability: 'Weekday evenings'
    },
    values: ['Health', 'Discipline', 'Personal growth', 'Emotional support'],
    profileCompleteness: 94,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'mia_marathon',
    email: 'mia@example.com',
    password: 'password123',
    interests: ['Running', 'Fitness', 'Yoga', 'Nutrition', 'Wellness', 'Marathon Training'],
    bio: 'Running is my therapy. Training for my 10th marathon and loving every mile!',
    location: 'Melbourne, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/33.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Deep conversations'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Personal growth'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Sports', 'Outdoor adventures'],
      availability: 'Weekday evenings'
    },
    values: ['Health', 'Discipline', 'Personal growth', 'Emotional support'],
    profileCompleteness: 96,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'tom_triathlon',
    email: 'tom@example.com',
    password: 'password123',
    interests: ['Running', 'Fitness', 'Yoga', 'Nutrition', 'Wellness', 'Swimming'],
    bio: 'Triathlete and nutrition enthusiast. Always up for an early morning training session!',
    location: 'Melbourne, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/41.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Deep conversations'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Personal growth'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Sports', 'Outdoor adventures'],
      availability: 'Weekday evenings'
    },
    values: ['Health', 'Discipline', 'Personal growth', 'Emotional support'],
    profileCompleteness: 95,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'jade_gym',
    email: 'jade@example.com',
    password: 'password123',
    interests: ['Fitness', 'Yoga', 'Nutrition', 'Wellness', 'Weight Training', 'Crossfit'],
    bio: 'Personal trainer and wellness advocate. Helping people transform their lives one workout at a time.',
    location: 'Melbourne, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/55.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Deep conversations'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Personal growth'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Sports', 'Outdoor adventures'],
      availability: 'Weekday evenings'
    },
    values: ['Health', 'Motivation', 'Personal growth', 'Emotional support'],
    profileCompleteness: 97,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'kevin_kettlebell',
    email: 'kevin@example.com',
    password: 'password123',
    interests: ['Fitness', 'Weight Training', 'Nutrition', 'Wellness', 'Bodybuilding', 'Sports'],
    bio: 'Strength coach and fitness enthusiast. Living that gym life and loving every rep!',
    location: 'Melbourne, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/68.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Activity partners', 'Deep conversations'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Activity partners',
      conversationTopics: 'Personal growth'
    },
    lifestyle: {
      schedule: 'Morning person',
      activityLevel: 'Very active',
      weekendPlans: ['Sports', 'Outdoor adventures'],
      availability: 'Weekday evenings'
    },
    values: ['Health', 'Discipline', 'Personal growth', 'Emotional support'],
    profileCompleteness: 94,
    lastQuestionnaireDate: new Date()
  },

  // ===== CLUSTER 3: Creative Arts (5 users) =====
  {
    username: 'sophia_artist',
    email: 'sophia@example.com',
    password: 'password123',
    interests: ['Art', 'Painting', 'Museums', 'Photography', 'Design', 'Sculpture'],
    bio: 'Visual artist and gallery enthusiast. Love exploring new exhibitions and creative spaces.',
    location: 'Brisbane, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/50.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Ambivert',
      friendshipType: ['Deep conversations', 'Casual'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Cultural events', 'Relaxing at home', 'Social gatherings'],
      availability: 'Flexible schedule'
    },
    values: ['Creativity', 'Authenticity', 'Open-mindedness', 'Good conversation'],
    profileCompleteness: 93,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'oliver_creative',
    email: 'oliver@example.com',
    password: 'password123',
    interests: ['Art', 'Painting', 'Design', 'Photography', 'Museums', 'Digital Art'],
    bio: 'Graphic designer and art lover. Weekends are for gallery hopping and creative inspiration.',
    location: 'Brisbane, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/58.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Ambivert',
      friendshipType: ['Deep conversations', 'Casual'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Cultural events', 'Relaxing at home', 'Social gatherings'],
      availability: 'Flexible schedule'
    },
    values: ['Creativity', 'Authenticity', 'Open-mindedness', 'Good conversation'],
    profileCompleteness: 94,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'ava_artsy',
    email: 'ava@example.com',
    password: 'password123',
    interests: ['Photography', 'Art', 'Museums', 'Design', 'Fashion', 'Architecture'],
    bio: 'Photographer and museum curator. Always seeking beauty in unexpected places.',
    location: 'Brisbane, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/65.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Ambivert',
      friendshipType: ['Deep conversations', 'Casual'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Cultural events', 'Relaxing at home', 'Social gatherings'],
      availability: 'Flexible schedule'
    },
    values: ['Creativity', 'Authenticity', 'Open-mindedness', 'Good conversation'],
    profileCompleteness: 95,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'nina_canvas',
    email: 'nina@example.com',
    password: 'password123',
    interests: ['Painting', 'Art', 'Design', 'Museums', 'Sculpture', 'Drawing'],
    bio: 'Abstract painter and creative soul. Finding inspiration in colors, textures, and emotions.',
    location: 'Brisbane, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/78.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Ambivert',
      friendshipType: ['Deep conversations', 'Casual'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Cultural events', 'Relaxing at home', 'Relaxing at home'],
      availability: 'Flexible schedule'
    },
    values: ['Creativity', 'Self-expression', 'Authenticity', 'Good conversation'],
    profileCompleteness: 92,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'marco_modern',
    email: 'marco@example.com',
    password: 'password123',
    interests: ['Design', 'Art', 'Architecture', 'Photography', 'Museums', 'Fashion'],
    bio: 'Interior designer with a passion for modern art and architecture. Beauty is everywhere!',
    location: 'Brisbane, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/85.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Ambivert',
      friendshipType: ['Deep conversations', 'Casual'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Cultural events', 'Social gatherings', 'Relaxing at home'],
      availability: 'Flexible schedule'
    },
    values: ['Creativity', 'Aesthetics', 'Innovation', 'Good conversation'],
    profileCompleteness: 93,
    lastQuestionnaireDate: new Date()
  },

  // ===== CLUSTER 4: Tech & Gaming (5 users) =====
  {
    username: 'daniel_dev',
    email: 'daniel@example.com',
    password: 'password123',
    interests: ['Programming', 'Gaming', 'Technology', 'AI', 'Machine Learning', 'Web Development'],
    bio: 'Software engineer and gaming enthusiast. Always down for a coding session or multiplayer game night!',
    location: 'Perth, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/67.jpg',
    socialPreferences: {
      communicationStyle: 'Text-heavy',
      socialEnergy: 'Introvert',
      friendshipType: ['Online gaming buddies', 'Professional networking'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Professional networking',
      conversationTopics: 'Work & career'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Low activity',
      weekendPlans: ['Relaxing at home'],
      availability: 'Weekday evenings'
    },
    values: ['Innovation', 'Knowledge', 'Efficiency', 'Similar interests'],
    profileCompleteness: 92,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'chloe_coder',
    email: 'chloe@example.com',
    password: 'password123',
    interests: ['Programming', 'Gaming', 'Technology', 'AI', 'Virtual Reality', 'Cybersecurity'],
    bio: 'Full-stack developer and VR enthusiast. Building the future, one line of code at a time.',
    location: 'Perth, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/72.jpg',
    socialPreferences: {
      communicationStyle: 'Text-heavy',
      socialEnergy: 'Introvert',
      friendshipType: ['Online gaming buddies', 'Professional networking'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Professional networking',
      conversationTopics: 'Work & career'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Low activity',
      weekendPlans: ['Relaxing at home'],
      availability: 'Weekday evenings'
    },
    values: ['Innovation', 'Knowledge', 'Efficiency', 'Similar interests'],
    profileCompleteness: 94,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'ethan_engineer',
    email: 'ethan@example.com',
    password: 'password123',
    interests: ['Machine Learning', 'Programming', 'Gaming', 'Technology', 'AI', 'Data Science'],
    bio: 'Machine learning engineer by day, competitive gamer by night. Let\'s debug together!',
    location: 'Perth, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/75.jpg',
    socialPreferences: {
      communicationStyle: 'Text-heavy',
      socialEnergy: 'Introvert',
      friendshipType: ['Online gaming buddies', 'Professional networking'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Professional networking',
      conversationTopics: 'Work & career'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Low activity',
      weekendPlans: ['Relaxing at home'],
      availability: 'Weekday evenings'
    },
    values: ['Innovation', 'Knowledge', 'Logic', 'Similar interests'],
    profileCompleteness: 93,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'zara_zero',
    email: 'zara@example.com',
    password: 'password123',
    interests: ['Gaming', 'Technology', 'Programming', 'Esports', 'Streaming', 'Animation'],
    bio: 'Game developer and streamer. Living the dream creating and playing games all day!',
    location: 'Perth, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/89.jpg',
    socialPreferences: {
      communicationStyle: 'Text-heavy',
      socialEnergy: 'Introvert',
      friendshipType: ['Online gaming buddies', 'Professional networking'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Professional networking',
      conversationTopics: 'Work & career'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Low activity',
      weekendPlans: ['Relaxing at home'],
      availability: 'Weekday evenings'
    },
    values: ['Creativity', 'Innovation', 'Fun', 'Similar interests'],
    profileCompleteness: 91,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'victor_vr',
    email: 'victor@example.com',
    password: 'password123',
    interests: ['Virtual Reality', 'Gaming', 'Technology', 'Programming', '3D Design', 'AI'],
    bio: 'VR developer pushing the boundaries of immersive experiences. The future is virtual!',
    location: 'Perth, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/92.jpg',
    socialPreferences: {
      communicationStyle: 'Text-heavy',
      socialEnergy: 'Introvert',
      friendshipType: ['Online gaming buddies', 'Professional networking'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Daily check-ins',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Professional networking',
      conversationTopics: 'Work & career'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Low activity',
      weekendPlans: ['Relaxing at home'],
      availability: 'Weekday evenings'
    },
    values: ['Innovation', 'Technology', 'Future-thinking', 'Similar interests'],
    profileCompleteness: 90,
    lastQuestionnaireDate: new Date()
  },

  // ===== CLUSTER 5: Food & Culinary (4 users) =====
  {
    username: 'grace_gourmet',
    email: 'grace@example.com',
    password: 'password123',
    interests: ['Cooking', 'Food', 'Wine', 'Restaurants', 'Baking', 'Travel'],
    bio: 'Professional chef and food blogger. Love exploring new cuisines and hosting dinner parties!',
    location: 'Adelaide, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/80.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Activity partners'],
      responseTime: 'Regular communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Medium groups (5-8 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Social gatherings'],
      availability: 'Weekday evenings'
    },
    values: ['Creativity', 'Experiences', 'Generosity', 'Similar interests'],
    profileCompleteness: 94,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'henry_homecook',
    email: 'henry@example.com',
    password: 'password123',
    interests: ['Cooking', 'Food', 'Wine', 'Restaurants', 'Baking', 'BBQ'],
    bio: 'Home cook and wine enthusiast. Always experimenting with new recipes and flavors!',
    location: 'Adelaide, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/82.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Activity partners'],
      responseTime: 'Regular communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Medium groups (5-8 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Social gatherings'],
      availability: 'Weekday evenings'
    },
    values: ['Creativity', 'Experiences', 'Hospitality', 'Similar interests'],
    profileCompleteness: 93,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'isabella_ingredients',
    email: 'isabella@example.com',
    password: 'password123',
    interests: ['Baking', 'Cooking', 'Food', 'Photography', 'Restaurants', 'Desserts'],
    bio: 'Pastry chef and food photographer. Creating delicious memories, one dish at a time!',
    location: 'Adelaide, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/88.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Activity partners'],
      responseTime: 'Regular communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Medium groups (5-8 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Social gatherings', 'Relaxing at home'],
      availability: 'Weekday evenings'
    },
    values: ['Creativity', 'Sharing', 'Joy', 'Similar interests'],
    profileCompleteness: 95,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'felix_foodie',
    email: 'felix@example.com',
    password: 'password123',
    interests: ['Restaurants', 'Food', 'Cooking', 'Wine', 'Travel', 'Coffee'],
    bio: 'Food critic and restaurant explorer. Always on the hunt for the next great meal!',
    location: 'Adelaide, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/94.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Activity partners'],
      responseTime: 'Regular communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Medium groups (5-8 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Social gatherings'],
      availability: 'Weekday evenings'
    },
    values: ['Experiences', 'Adventure', 'Enjoyment', 'Similar interests'],
    profileCompleteness: 92,
    lastQuestionnaireDate: new Date()
  },

  // ===== CLUSTER 6: Music Lovers (5 users) =====
  {
    username: 'jack_jazz',
    email: 'jack@example.com',
    password: 'password123',
    interests: ['Music', 'Concerts', 'Festivals', 'Guitar', 'Vinyl Records', 'Jazz'],
    bio: 'Music producer and festival junkie. Life is better with a good soundtrack!',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/90.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Activity partners'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Large groups (9+ people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Pop culture'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Moderately active',
      weekendPlans: ['Social gatherings'],
      availability: 'Weekday evenings'
    },
    values: ['Creativity', 'Fun', 'Passion', 'Similar interests'],
    profileCompleteness: 92,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'kate_karaoke',
    email: 'kate@example.com',
    password: 'password123',
    interests: ['Music', 'Concerts', 'Singing', 'Festivals', 'Dancing', 'Karaoke'],
    bio: 'Singer and concert-goer. Music is my passion and concerts are my happy place!',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/92.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Activity partners'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Large groups (9+ people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Pop culture'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Moderately active',
      weekendPlans: ['Social gatherings'],
      availability: 'Weekday evenings'
    },
    values: ['Joy', 'Expression', 'Fun', 'Similar interests'],
    profileCompleteness: 94,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'liam_live',
    email: 'liam@example.com',
    password: 'password123',
    interests: ['Music', 'DJ', 'Festivals', 'Electronic Music', 'Vinyl Records', 'Concerts'],
    bio: 'DJ and vinyl collector. Spinning records and making memories at every festival!',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/95.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Activity partners'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Large groups (9+ people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Pop culture'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Moderately active',
      weekendPlans: ['Social gatherings'],
      availability: 'Weekday evenings'
    },
    values: ['Creativity', 'Energy', 'Community', 'Similar interests'],
    profileCompleteness: 93,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'penny_piano',
    email: 'penny@example.com',
    password: 'password123',
    interests: ['Music', 'Piano', 'Classical Music', 'Concerts', 'Composing', 'Teaching'],
    bio: 'Classical pianist and music teacher. Finding beauty in every note and melody.',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/women/15.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Deep conversations'],
      responseTime: 'Thoughtful communicator',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Small groups (2-4 people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Hobbies & interests'
    },
    lifestyle: {
      schedule: 'Flexible',
      activityLevel: 'Moderately active',
      weekendPlans: ['Cultural events', 'Social gatherings'],
      availability: 'Flexible schedule'
    },
    values: ['Art', 'Discipline', 'Beauty', 'Similar interests'],
    profileCompleteness: 95,
    lastQuestionnaireDate: new Date()
  },
  {
    username: 'randy_rock',
    email: 'randy@example.com',
    password: 'password123',
    interests: ['Music', 'Guitar', 'Rock Music', 'Concerts', 'Festivals', 'Bands'],
    bio: 'Rock guitarist and band member. Living for the next gig and the roar of the crowd!',
    location: 'Sydney, Australia',
    profilePicture: 'https://randomuser.me/api/portraits/men/38.jpg',
    socialPreferences: {
      communicationStyle: 'In-person meetups',
      socialEnergy: 'Extrovert',
      friendshipType: ['Casual', 'Activity partners'],
      responseTime: 'Quick responder',
      communicationFrequency: 'Few times a week',
      groupSizePreference: 'Large groups (9+ people)',
      friendshipGoals: 'Casual hangouts',
      conversationTopics: 'Pop culture'
    },
    lifestyle: {
      schedule: 'Night owl',
      activityLevel: 'Moderately active',
      weekendPlans: ['Social gatherings'],
      availability: 'Weekday evenings'
    },
    values: ['Passion', 'Freedom', 'Expression', 'Similar interests'],
    profileCompleteness: 91,
    lastQuestionnaireDate: new Date()
  }
];

// Messages between alex_example and 5 friends
const messages = [
  // Conversation 1: alex_example <-> sarah_summit
  {
    sender: 'alex_example',
    receiver: 'sarah_summit',
    content: 'Hey Sarah! I saw you\'re into hiking and photography too. Have you checked out the Blue Mountains lately?',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000)
  },
  {
    sender: 'sarah_summit',
    receiver: 'alex_example',
    content: 'Hi Alex! Yes, I was there last weekend! The views were absolutely stunning. Got some amazing shots at sunrise from Echo Point.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000),
    read: true,
    readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000)
  },
  {
    sender: 'alex_example',
    receiver: 'sarah_summit',
    content: 'That sounds incredible! I\'ve been meaning to do a sunrise hike there. Would you be up for going again sometime?',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000),
    read: true,
    readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    sender: 'sarah_summit',
    receiver: 'alex_example',
    content: 'Absolutely! I know some great trails. How about next Saturday? We could do the Grand Canyon track.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1800000)
  },
  {
    sender: 'alex_example',
    receiver: 'sarah_summit',
    content: 'Perfect! Count me in. I\'ll bring my DSLR and we can capture some great moments!',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1800000),
    read: true,
    readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },

  // Conversation 2: alex_example <-> mike_mountains
  {
    sender: 'mike_mountains',
    receiver: 'alex_example',
    content: 'Hey Alex! Saw your profile and noticed we have very similar interests. Do you do much rock climbing?',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1800000)
  },
  {
    sender: 'alex_example',
    receiver: 'mike_mountains',
    content: 'Hi Mike! Yes, I try to go climbing at least once a week. Usually hit up the indoor gym but love outdoor climbing when I can.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1800000),
    read: true,
    readAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000)
  },
  {
    sender: 'mike_mountains',
    receiver: 'alex_example',
    content: 'Same here! I\'m planning a trip to the Grampians next month. Interested in joining?',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000),
    read: true,
    readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    sender: 'alex_example',
    receiver: 'mike_mountains',
    content: 'The Grampians would be epic! Let me check my schedule and I\'ll get back to you.',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 7200000)
  },

  // Conversation 3: alex_example <-> emma_explorer
  {
    sender: 'alex_example',
    receiver: 'emma_explorer',
    content: 'Emma, your adventure photography portfolio is amazing! What camera gear do you use?',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1800000)
  },
  {
    sender: 'emma_explorer',
    receiver: 'alex_example',
    content: 'Thanks Alex! I mainly use a Canon 5D Mark IV with a 24-70mm lens for landscapes. What about you?',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1800000),
    read: true,
    readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000)
  },
  {
    sender: 'alex_example',
    receiver: 'emma_explorer',
    content: 'I have the Nikon D850. Love it for outdoor shots. We should do a photo walk sometime!',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000),
    read: true,
    readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    sender: 'emma_explorer',
    receiver: 'alex_example',
    content: 'That would be great! How about next Sunday at sunrise at Mrs Macquarie\'s Chair?',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000)
  },
  {
    sender: 'alex_example',
    receiver: 'emma_explorer',
    content: 'Perfect spot! See you then at 5:30 AM?',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000),
    read: true,
    readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },

  // Conversation 4: alex_example <-> josh_journey
  {
    sender: 'josh_journey',
    receiver: 'alex_example',
    content: 'Alex! Fellow trail runner here. Do you ever do the Bondi to Coogee coastal walk?',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 7200000)
  },
  {
    sender: 'alex_example',
    receiver: 'josh_journey',
    content: 'Hey Josh! Yes, that\'s one of my favorite routes! The views are unbeatable.',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 7200000),
    read: true,
    readAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 10800000)
  },
  {
    sender: 'josh_journey',
    receiver: 'alex_example',
    content: 'Want to join me for a morning run there this Saturday? I usually start at 6 AM.',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 10800000),
    read: true,
    readAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    sender: 'alex_example',
    receiver: 'josh_journey',
    content: 'Sounds great! I\'ll meet you at Bondi Beach at 6. Can\'t wait!',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000)
  },

  // Conversation 5: alex_example <-> lisa_peaks
  {
    sender: 'alex_example',
    receiver: 'lisa_peaks',
    content: 'Lisa, I saw you\'re into climbing! Have you ever been to Nowra for outdoor climbing?',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 5400000)
  },
  {
    sender: 'lisa_peaks',
    receiver: 'alex_example',
    content: 'Yes! Nowra is incredible. I was there last month. The sandstone cliffs are amazing!',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 5400000),
    read: true,
    readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    sender: 'alex_example',
    receiver: 'lisa_peaks',
    content: 'I\'ve been wanting to go! Would you be interested in guiding a group trip sometime?',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000)
  },
  {
    sender: 'lisa_peaks',
    receiver: 'alex_example',
    content: 'Definitely! Let\'s plan for it. I can show you some of the best routes. Maybe in a couple of weeks?',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000),
    read: true,
    readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    sender: 'alex_example',
    receiver: 'lisa_peaks',
    content: 'Perfect! I\'ll coordinate with a few other climbers and we can make it a fun weekend trip!',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    read: true,
    readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3600000)
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/friend-finder', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected successfully!');

    console.log('\nClearing existing data...');
    await User.deleteMany({});
    await Message.deleteMany({});
    console.log('✓ Existing data cleared.');

    // Hash passwords and create users
    const createdUsers = {};
    
    console.log('\nCreating 30 users...');
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        friends: [],
        friendRequests: []
      });
      createdUsers[userData.username] = user;
      console.log(`  ✓ Created user: ${userData.username}`);
    }

    console.log('\n\nEstablishing friendships...');
    const alexFriends = ['sarah_summit', 'mike_mountains', 'emma_explorer', 'josh_journey', 'lisa_peaks'];
    
    for (const friendUsername of alexFriends) {
      const alex = createdUsers['alex_example'];
      const friend = createdUsers[friendUsername];
      
      await User.findByIdAndUpdate(alex._id, {
        $push: { friends: friend._id }
      });
      
      await User.findByIdAndUpdate(friend._id, {
        $push: { friends: alex._id }
      });
      console.log(`  ✓ Connected alex_example <-> ${friendUsername}`);
    }

    console.log('\n\nCreating messages...');
    for (const messageData of messages) {
      const sender = createdUsers[messageData.sender];
      const receiver = createdUsers[messageData.receiver];
      
      if (sender && receiver) {
        await Message.create({
          ...messageData,
          sender: sender._id,
          receiver: receiver._id
        });
      }
    }
    console.log(`  ✓ Created ${messages.length} messages`);

    console.log('\n\n═══════════════════════════════════════════');
    console.log('         SEED COMPLETED SUCCESSFULLY        ');
    console.log('═══════════════════════════════════════════');
    console.log(`✓ Total users created: ${users.length}`);
    console.log(`✓ Alex friendships: ${alexFriends.length}`);
    console.log(`✓ Messages created: ${messages.length}`);
    console.log('\nUser Clusters:');
    console.log('  • Outdoor Adventure: 6 users (95%+ match)');
    console.log('  • Fitness & Wellness: 5 users (95%+ match)');
    console.log('  • Creative Arts: 5 users (95%+ match)');
    console.log('  • Tech & Gaming: 5 users (95%+ match)');
    console.log('  • Food & Culinary: 4 users (95%+ match)');
    console.log('  • Music Lovers: 5 users (95%+ match)');
    console.log('═══════════════════════════════════════════\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();










