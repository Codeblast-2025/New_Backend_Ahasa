const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./Routes/authRoutes');
const sosRoutes = require('./routes/sos'); //
const updatedUserRoutes = require('./Routes/auth');
const communityRoutes = require('./Routes/community');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/auth', updatedUserRoutes);
app.use('/api/community', communityRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server started on port 5000"));
  })
  .catch(err => console.error(err));
