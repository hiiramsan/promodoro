import jwt from 'jsonwebtoken'
import User from '../models/User.js';

// method to genrate token w JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// register new  user
export const register = async(req, res) => {
    try {

        // get data from request
        const {email, password, username} = req.body;
        
        // check if user already exists
        const userExists = await User.findOne({ email });
        if(userExists){
            return res.status(400).json({message: 'User already exists!'})
        }

        // if not, then register new user
        const newUser = await User.create({email, username, password});

        // return status
        res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            token: generateToken(newUser._id),
        });

    } catch(error) {
        res.status(500).json({ message: error.message })
    }
}

// log user
export const login = async(req, res) => {
    try {
        
        // get data from req
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        // check if user exists
        if(!user) { 
            return res.status(400).json({
                message: 'Invalid credentials!'
            })
        }

        // check if password is correct
        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
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
        res.status(500).json({ message: error.message})
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

// Get current user profile
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