const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require("path");

const authRoutes = require('./Routes/authRoutes');
const sosRoutes = require('./Routes/sos'); //
const updatedUserRoutes = require('./Routes/auth');
const communityRoutes = require('./Routes/community');
const locationRoutes = require('./Routes/location');
const profileRoutes = require('./routes/profilePic');
const documentRoutes = require('./Routes/documents');
const adminDocumentsRouter = require("./Routes/adminDocuments");


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/auth', updatedUserRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/location', locationRoutes);
app.use('/uploads', express.static('uploads')); ///
app.use("/api/admin-documents", adminDocumentsRouter);

app.use('/api/documents', documentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use('/api/auth', authRoutes);
app.use('/api/auth', profileRoutes);



mongoose
 // .connect(process.env.MONGO_URI)
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server started on port 5000"));
  })
  .catch(err => console.error(err));
