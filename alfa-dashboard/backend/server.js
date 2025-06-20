require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sellLetterRoutes = require('./routes/selLetter');
const dashboardRoutes = require('./routes/dashboard');
const serviceBillRoutes = require('./routes/serviceBillRoutes');
const rcRoutes = require("./routes/rcRoutes");
const sellRoutes = require('./routes/sellRoutes');
const carRoutes = require('./routes/carRoutes');
const path = require("path");
const { protect } = require('./middleware/auth');
const cors = require('cors');

const app = express();

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: ['https://alfa-motors.vercel.app','https://alfa-motors-o5cm.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use("/api/rc", rcRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/sell-letters', sellLetterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/service-bills', serviceBillRoutes);
app.use('/api/sell-requests', sellRoutes);

// Static files
const uploadsPath = path.join(__dirname, "utils/uploads");
app.use(
  "/utils/uploads",  
  express.static(uploadsPath, {
    setHeaders: (res, path) => {
      if (path.endsWith(".pdf")) {
        res.set("Content-Type", "application/pdf");
        res.set("Content-Disposition", "inline; filename=" + path.basename(path));
      }
    },
  })
);


const PORT = process.env.PORT || 2500;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));