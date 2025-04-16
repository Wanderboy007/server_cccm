import request from 'supertest';
import {app} from '../app.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

describe('Auth Routes', () => {
  beforeAll(async () => { 
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI!);
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clear the users collection after each test
    await User.deleteMany({
      email: {
        $nin: ['superadmin@example.com', 'student@example.com', 'admin@example.com'],
      },
    });
    
  });

  describe('POST /api/auth/register', () => {
    it('should create a new student', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'student',
          year: 'first_year',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.role).toBe('student');
    });

    it('should not create a student if they already exist', async () => {
      const studentData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
        year: 'first_year',
      };

      // Step 1: Create a student
      await request(app)
        .post('/api/auth/register')
        .send(studentData);

      // Step 2: Attempt to create the same student again
      const res = await request(app)
        .post('/api/auth/register')
        .send(studentData);

      // Assertions
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('should create a new alumni', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'alumni',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.role).toBe('alumni');
    });

    it('should not allow creating an admin or super admin via the open register route', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin3@example.com',
          password: 'password123',
          role: 'admin',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid role for this route');
    });
  
  });

  describe('POST /api/auth/register/admin', () => {
    let superAdminToken: string;
  
    beforeAll(async () => {
      // Create a super admin for testing
      // const superAdmin = new User({
      //   name: 'Super Admin',
      //   email: 'superadmin@example.com',
      //   password: 'hashed_password',
      //   role: 'super_admin',
      // });
      // await superAdmin.save();
  
      // Log in as super admin to get a token
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'superadmin123',
        });
  
      superAdminToken = res.body.token;
    });
  
    it('should create a new admin (as super admin)', async () => {
      const res = await request(app)
        .post('/api/auth/register/admin')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Admin User',
          email: 'admin78@example.com',
          password: 'password123',
          role: 'admin',
        });
      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.role).toBe('admin');
    });
  
    it('should not allow creating an admin without super admin privileges', async () => {
      const res = await request(app)
        .post('/api/auth/register/admin')
        .send({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin',
        });
  
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token, authorization denied');
    });
  
    it('should not allow creating a super admin', async () => {
      const res = await request(app)
        .post('/api/auth/register/admin')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Another Super Admin',
          email: 'anothersuperadmin@example.com',
          password: 'password123',
          role: 'super_admin',
        });
  
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Unauthorized: Only super admins can not be created');
    });
  });
});