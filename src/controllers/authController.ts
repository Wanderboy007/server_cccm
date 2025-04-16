import { Request, Response } from 'express';
import User from '../models/User.model.js';
import { hashPassword, comparePassword } from '../utils/auth.js'; 
import { generateToken } from '../utils/jwt.js';



export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, year } = req.body;

  try {
    console.log(email)
    if(role === 'super_admin' || role === 'admin') {
      res.status(400).json({ message: 'Invalid role for this route' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({ name, email, password: hashedPassword, role, year });
    await user.save();
     res.status(201).json({ user });
  } catch (error) {
    console.log(error)
     res.status(500).json({ message: 'Server error', error });
  }
};


export const registerAdmin = async (req: Request, res: Response) : Promise<void> => {
  const { name, email, password, role } = req.body;

  try {
    // Check if the requesting user is a super admin 

    if (role === 'super_admin') {
      res.status(403).json({ message: 'Unauthorized: Only super admins can not be created' });
      return;
    }
    console.log("wrong")

    if (req.user?.role !== 'super_admin') {
      res.status(403).json({ message: 'Unauthorized: Only super admins can create admin users' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Validate role (only allow 'admin' or 'super_admin')
    if (role !== 'admin' && role !== 'super_admin') {
      res.status(400).json({ message: 'Invalid role for admin registration' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new admin user
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};






export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email }) as { _id: string, password: string, toObject: () => any } | null;
    console.log(user)
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare passwords
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = generateToken(user._id.toString());

    // Set cookie with the token
    res.cookie('authToken', token, {
      httpOnly: true,         // Makes the cookie inaccessible to JavaScript (important for security)
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    });

    const userObj = user.toObject(); // works if user is a Mongoose document
    delete userObj.password;

res.status(200).json({ message: 'Login successful', user: userObj });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
};



