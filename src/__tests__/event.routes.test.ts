import request from 'supertest';
import { app } from '../app.js';
import Event from '../models/Event.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

describe('Event Routes', () => {
  let adminToken: string;
  let studentToken: string;
  let testEventId: string;
  

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI!);

    // Create test users and get tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });
    adminToken = adminRes.body.token;
    console.log(adminToken)

    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@example.com',
        password: 'student123'
      });
    studentToken = studentRes.body.token;
    console.log(studentToken)
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clear the events collection after each test
    await User.deleteMany({
        email: {
          $nin: ['superadmin@example.com', 'student@example.com', 'admin@example.com'],
        },
      });      
  });

  describe('POST /api/event', () => {
    it('should create a new event (as admin)', async () => {
      const res = await request(app)
        .post('/api/event')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            "title": "Blockchain Essentials Workshop",
            "description": "A beginner-friendly workshop on understanding blockchain technology and smart contracts.",
            "date": "2025-06-01",
            "time": "02:00 PM",
            "location": "Online - Zoom",
            "category": "workshop",
            "organizer": "65fabc1234ef56789abcd123"
          });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Blockchain Essentials Workshop');
      testEventId = res.body._id; // Store for later tests
    });

    it('should not allow event creation without admin role', async () => {
      const res = await request(app)
        .post('/api/event')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Event'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/event/:id', () => {
    beforeEach(async () => {
      // Create a test event
      const event = new Event({
        "title": "Blockchain Essentials Workshop",
        "description": "A beginner-friendly workshop on understanding blockchain technology and smart contracts.",
        "date": "2025-06-01",
        "time": "02:00 PM",
        "location": "Online - Zoom",
        "category": "workshop",
        "organizer": "65fabc1234ef56789abcd123"
      });
      await event.save();
      testEventId = (event._id as mongoose.Types.ObjectId).toString();
    }); 

    afterAll(async () => {
      // Clear the events collection after each test
      await Event.deleteMany({});      
    });

    it('should update an event (as admin)', async () => {
      const res = await request(app)
        .put(`/api/event/${testEventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Event Title'
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Event Title');
    });

    it('should not allow updates by non-admin', async () => {
      const res = await request(app)
        .put(`/api/event/${testEventId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Update'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/event/:id', () => {
    beforeEach(async () => {
      // Create a test event
      const event: InstanceType<typeof Event> = new Event({
        "title": "Blockchain Essentials Workshop1",
        "description": "A beginner-friendly workshop on understanding blockchain technology and smart contracts.sas",
        "date": "2025-06-02",
        "time": "02:00 PM",
        "location": "Online - Zoom",
        "category": "workshop",
        "organizer": "65fabc1234ef56789abcd123"
      });
      await event.save();
      testEventId = (event._id as mongoose.Types.ObjectId).toString();
    }); 

    afterAll(async () => {
      await Event.deleteMany({});      
    });

    it('should delete an event (as admin)', async () => {
      const res = await request(app)
        .delete(`/api/event/${testEventId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');

      // Verify the event was actually deleted
      const deletedEvent = await Event.findById(testEventId);
      expect(deletedEvent).toBeNull();
    });

    it('should not allow deletion by non-admin', async () => {
      const res = await request(app)
        .delete(`/api/event/${testEventId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/event', () => {
    beforeEach(async () => {
      // Create test event
      await Event.create([
        {
          title: 'Web Development Workshop',
          description: 'Learn modern web dev',
          date: new Date('2023-11-20'),
          time: '10:00',
          location: 'Online',
          category: 'workshop',
          organizer: '67e67ff07a8d8afc0f94c931',
          thumbnail: 'webdev.jpg'
        },
        {
          title: 'Cultural Festival',
          description: 'Celebrate diversity',
          date: new Date('2023-12-05'),
          time: '16:00',
          location: 'workshop',
          category: 'cultural',
          organizer: '67e67ff07a8d8afc0f94c931',
          thumbnail: 'culture.jpg'
        }
      ]);
    });

    afterAll(async () => {
      // Clear the events collection after each test
      await Event.deleteMany({});      
    });

    it('should list all event', async () => {
      const res = await request(app)
        .get('/api/event');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should filter event by category', async () => {
      const res = await request(app)
        .get('/api/event?category=workshop');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].category).toBe('workshop');
    });
  });

  describe('POST /api/event/:id/register', () => {
    beforeEach(async () => {
      // Create a test event
      const event = new Event( {
        title: 'Cultural Festival',
        description: 'Celebrate diversity',
        date: new Date('2023-12-05'),
        time: '16:00',
        location: 'workshop',
        category: 'cultural',
        organizer: '67e67ff07a8d8afc0f94c931',
        thumbnail: 'culture.jpg'
      });
      await event.save();
      testEventId = (event._id as mongoose.Types.ObjectId).toString();
    });

    afterAll(async () => {
      await Event.deleteMany({});      
    });

    it('should allow student to register for event', async () => {
      const res = await request(app)
        .post(`/api/event/${testEventId}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      // expect(res.body.attendees.length).toBe(1);

      // Verify registration
      const updatedEvent = await Event.findById(testEventId).populate('registeredUsers');
      expect(updatedEvent?.toObject().registeredUsers.length).toBe(1);
    });

    it('should not allow duplicate registrations', async () => {
      // First registration
      await request(app)
        .post(`/api/event/${testEventId}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Second attempt
      const res = await request(app)
        .post(`/api/event/${testEventId}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already registered/i);
    });
  });
});