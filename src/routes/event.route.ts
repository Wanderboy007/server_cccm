import express from 'express';
import { requireRoles } from '../middleware/role.middleware.js';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations,
  addEventImages,
  myCreatedEvents,
  myRegisteredEvents,
  getScrapbook
} from '../controllers/event.controller.js';
import { protect} from '../middleware/authMiddleware.js';
import { getUser } from '../controllers/authController.js';

const router = express.Router();

// routes/event.routes.ts

// Event routes
router.post(
  '/', 
  protect, 
  requireRoles('admin', 'super_admin', 'event_manager'), // Add any allowed roles
  createEvent
);

router.put('/:id', protect,requireRoles('admin','super_admin', 'event_manager'), updateEvent); // Update event
router.delete('/:id', protect, requireRoles('admin','super_admin', 'event_manager'), deleteEvent); // Delete event
router.get('/', listEvents); // List all events
router.get('/:id', getEventById); // Get event details
router.post('/:id/register',protect,requireRoles('student', 'alumni'), registerForEvent); // Register for event
router.post('/:id/unregister', protect,requireRoles('student', 'alumni'), unregisterFromEvent); // Unregister from event
router.get('/:id/registrations', protect, requireRoles('student', 'alumni'), getEventRegistrations);
router.patch('/:id/images', protect, requireRoles('admin','super_admin', 'event_manager'), addEventImages);
//Get registered users

router.get('/:id/mycreatedevents', protect, requireRoles('admin','super_admin', 'event_manager'), myCreatedEvents);
router.get('/:id/myregisteredevents', protect, requireRoles('student', 'alumni'), myRegisteredEvents);

router.get('/:id/getscrapbook', protect, requireRoles('student', 'alumni'), getScrapbook);

router.get('/:id/getuser',getUser);


export default router;
