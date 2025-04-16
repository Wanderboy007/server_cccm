import express from 'express';
import { requireRoles } from '../middleware/role.middleware';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations,
  addEventImages
} from '../controllers/event.controller';
import { protect} from '../middleware/authMiddleware';

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

export default router;
