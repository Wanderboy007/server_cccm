import { Request, Response } from 'express';
import Event from '../models/Event.model';
import mongoose, { Types } from 'mongoose';

// ==========================
// 🎉 Create Event
// ==========================
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, time, location, category , thumbnail} = req.body;

    const newEvent = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      thumbnail:thumbnail==undefined?null:thumbnail,
      organizer: req.user ? req.user.userId : null,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error });
  }
};

// ==========================
// 🔄 Update Event
// ==========================
export const updateEvent = async (req: Request, res: Response):Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }


    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
};

// ==========================
// 🗑️ Delete Event
// ==========================
export const deleteEvent = async (req: Request, res: Response):Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    const Responseevent = event;


    await event.deleteOne();
    res.status(200).json(Responseevent);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
};

// ==========================
// 📚 List All Events
// ==========================
export const listEvents = async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const {
      title,
      organizer,
      category,
      dateFrom,
      dateTo,
      location,
      sortBy,
      sortOrder = 'asc',
      limit,
      page = 1, // Default to page 1 if not specified
    } = req.query;

    // Build the filter object
    const filter: any = {};

    if (title) filter.title = { $regex: title as string, $options: 'i' };
    if (organizer) {
      if (mongoose.Types.ObjectId.isValid(organizer as string)) {
        filter.organizer = organizer;
      }
    }
    if (category) filter.category = { $regex: category as string, $options: 'i' };
    if (location) filter.location = { $regex: location as string, $options: 'i' };

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
      if (dateTo) filter.date.$lte = new Date(dateTo as string);
    }

    // Count total documents matching the filter (for pagination info)
    const totalEvents = await Event.countDocuments(filter);

    // Build the query
    let query = Event.find(filter).populate('organizer', 'name email');

    // Sorting
    if (sortBy) {
      const sortCriteria: any = {};
      sortCriteria[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
      query = query.sort(sortCriteria);
    } else {
      // Default sorting by date (newest first)
      query = query.sort({ date: -1 });
    }

    // Pagination
    const pageSize = limit ? parseInt(limit as string, 10) : 10; // Default to 10 items per page if limit not specified
    const currentPage = parseInt(page as string, 10);
    const skip = (currentPage - 1) * pageSize;

    query = query.skip(skip).limit(pageSize);

    // Execute the query
    const events = await query.exec();

    // Calculate total pages
    const totalPages = Math.ceil(totalEvents / pageSize);

    res.status(200).json({
      events,
      pagination: {
        totalEvents,
        totalPages,
        currentPage,
        pageSize,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: (error instanceof Error) ? error.message : 'Unknown error' });
  }
};

// ==========================
// 📄 Get Event by ID
// ==========================
export const getEventById = async (req: Request, res: Response):Promise<void> => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error });
  }
};

// ==========================
// 🎟️ Register for Event
// ==========================
export const registerForEvent = async (req: Request, res: Response):Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    console.log(req.user)

    if (req.user && req.user.userId && event.registeredUsers.some(userId => userId.toString() === req.user?.userId)) {
      res.status(400).json({ message: 'Already registered for this event' });
      return;
    }

    if (req.user?.userId) {
      event.registeredUsers.push(new Types.ObjectId(req.user.userId));
    } else {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    await event.save();

    res.status(200).json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error });
  }
};

// ==========================
// 🚫 Unregister from Event
// ==========================
export const unregisterFromEvent = async (req: Request, res: Response):Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (!req.user || !event.registeredUsers.includes(new Types.ObjectId(req.user?.userId))) {
      res.status(400).json({ message: 'Not registered for this event' });
      return;
    }

    event.registeredUsers = event.registeredUsers.filter(
      (userId) => req.user && userId.toString() !== req.user.userId.toString()
    );
    await event.save();

    res.status(200).json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unregistering from event', error });
  }
};

// ==========================
// 📊 Get Users Registered for Event
// ==========================
export const getEventRegistrations = async (req: Request, res: Response):Promise<void> => {
  try {
    const event = await Event.findById(req.params.id).populate('registeredUsers', 'name email');

    if (!event) {
       res.status(404).json({ message: 'Event not found' });
       return;
    }

    res.status(200).json({"registeredUsers": event.registeredUsers});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event registrations', error });
  }
};

// ==========================
// 📊 Update images array in events
// ==========================

// Add this new controller function
export const addEventImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { images }: { images: string[] } = req.body;

    if (!images || !Array.isArray(images)) {
       res.status(400).json({
        success: false,
        message: 'Invalid images data'
      });
      return;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $push: { eventimages: { $each: images } } },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

      res.status(200).json({
      success: true,
      data: updatedEvent
    });
    

  } catch (error: unknown) {
    const err = error as Error;
     res.status(500).json({
      success: false,
      message: 'Failed to add images',
      error: err.message
    });
    return;
  }
};