import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Event from './models/Event.model'; // Adjust path to your Event model
import User from './models/User.model'; // You'll need some users to be organizers

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/your-database-name', {
      // Your connection options
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Generate mock events
const generateMockEvents = async (count: number = 50) => {
  // First get some users to be organizers
  const users = await User.find().limit(5);
  if (users.length === 0) {
    throw new Error('No users found in database. Please create some users first.');
  }

  const categories = ['seminar', 'webinar', 'coding_challenge', 'cultural', 'technical'];
  const locations = [
    'New York', 'London', 'Tokyo', 'Paris', 'Berlin', 
    'Sydney', 'Virtual', 'Bangalore', 'San Francisco', 'Toronto'
  ];

  const events = Array.from({ length: count }, () => {
    const randomDate = faker.date.future({ years: 1 });
    return {
      title: faker.lorem.words(3),
      description: faker.lorem.paragraphs(2),
      date: randomDate,
      time: randomDate.toLocaleTimeString(),
      location: faker.helpers.arrayElement(locations),
      category: faker.helpers.arrayElement(categories),
      organizer: faker.helpers.arrayElement(users)._id,
      registeredUsers: [],
      eventimages: [
        faker.image.urlLoremFlickr({ category: 'event' }),
        faker.image.urlLoremFlickr({ category: 'concert' })
      ],
      thumbnail: faker.image.urlLoremFlickr({ category: 'event' })
    };
  });

  return events;
};

// Main function
const main = async () => {
  await connectDB();
  
  try {
    console.log('Generating mock events...');
    const mockEvents = await generateMockEvents(50);
    
    console.log('Inserting events into database...');
    const result = await Event.insertMany(mockEvents);
    
    console.log(`Successfully inserted ${result.length} events`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating mock events:', error);
    process.exit(1);
  }
};

main();