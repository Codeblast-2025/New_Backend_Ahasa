const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { fullName, country, location, number1, number2, email, password } = req.body;
    
    // Validation
    if (!fullName || !country || !location || !number1 || !email || !password) {
      return res.status(400).json({ 
        msg: 'Please provide all required fields: fullName, country, location, number1, email, and password' 
      });
    }

    // Check if user already exists by email or primary mobile number
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { number1 }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        msg: 'User already exists with this email or mobile number' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with all fields
    const user = await User.create({ 
      fullName, 
      country,
      location,
      number1,
      number2: number2 || null, // Optional second number
      email, 
      password: hashedPassword 
    });

    // Return success response (don't send password back)
    res.status(201).json({ 
      msg: 'User registered successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        country: user.country,
        location: user.location
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
