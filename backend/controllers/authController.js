import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import Preferences from '../models/Preferences.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export const register = async (req, res) => {
    try {

        // get data from request
        const { email, password, username } = req.body;

        // check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists!' })
        }

        // if not, then register new user
        const newUser = await User.create({ email, username, password });

        // also create user preferences
        await Preferences.create({ user: newUser._id });

        // return status
        res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            token: generateToken(newUser._id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    try {

        // get data from req
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // check if user exists
        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials!'
            })
        }

        // check if password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials!'
            })
        }

        // if user exists and password is correct, return user
        res.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const getMe = async (req, res) => {
    try {
        res.json({
            _id: req.user._id,
            email: req.user.email,
            username: req.user.username
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserPreferences = async (req, res) => {
    try {
        const preferences = await Preferences.findOne({ user: req.user._id });
        if (!preferences) return res.status(404).json({ error: 'Preferences not found!' })
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch preferences!' })
    }
}

export const updateUserPreferences = async (req, res) => {
    const { focusTime, shortBreakTime, longBreakTime, sessionsUntilLongBreak } = req.body;

    console.log('Updating preferences for user:', req.user._id);
    console.log('Received data:', { focusTime, shortBreakTime, longBreakTime, sessionsUntilLongBreak });

    try {
        const updated = await Preferences.findOneAndUpdate(
            { user: req.user._id },
            { focusTime, shortBreakTime, longBreakTime, sessionsUntilLongBreak },
            { new: true, upsert: true }
        );

        console.log('Updated preferences:', updated);
        res.json(updated);
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences!' })
    }
}

export const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                username: name,
                password: sub
            });
            
            // Create user preferences for new Google users
            await Preferences.create({ user: user._id });
        }

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({ token: jwtToken, ...user.toObject() });
    } catch (error) {
        console.log("Error in google auth", error);
        res.status(401).json({ message: 'Invalid google token!' })
    }

}