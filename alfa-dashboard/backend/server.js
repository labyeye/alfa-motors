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
const reviewRoutes = require('./routes/reviewRoutes');
const path = require("path");
const fs = require("fs");
const { protect } = require('./middleware/auth');
const cors = require('cors');

const app = express();

// Connect to database

connectDB();

// CORS configuration
const corsOptions = {
  origin: ['http://127.0.0.1:5500','http://localhost:3000','https://www.alfamotorworld.com','https://alfa-motors-o5cm.vercel.app','https://https://alfa-motors-5yfh.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use((req, res, next) => {
  const origin = req.get('origin');
  if (Array.isArray(corsOptions.origin) && origin && corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use("/api/rc", rcRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sell-letters', sellLetterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/service-bills', serviceBillRoutes);
app.use('/api/sell-requests', sellRoutes);
app.use('/api/reviews', reviewRoutes);

const carImagesPath = path.join(__dirname, "utils/carimages");
app.use(
  "/carimages",
  (req, res, next) => {
    const origin = req.get("origin");
    if (Array.isArray(corsOptions.origin) && origin && corsOptions.origin.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      if (corsOptions.credentials) {
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    }
    try {
      const requestedPath = decodeURIComponent(req.path || "");
      const fullPath = path.join(carImagesPath, requestedPath);
      if (!fs.existsSync(fullPath)) {
        // 1x1 transparent PNG
        const placeholderBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
        const placeholderBuffer = Buffer.from(placeholderBase64, "base64");
        res.setHeader("Content-Type", "image/png");
        return res.status(200).send(placeholderBuffer);
      }
    } catch (err) {
      // If something goes wrong checking the file, continue to static handler
      console.error("Error checking carimages file existence:", err);
    }

    next();
  },
  express.static(carImagesPath, {
    setHeaders: (res, filePath) => {
      // Ensure PDFs are served with the correct MIME and disposition
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=" + path.basename(filePath));
      }
    },
  })
);

// Serve uploaded PDFs/files used by RC entries and service bills
const utilsUploadsPath = path.join(__dirname, "utils/uploads");
app.use(
  "/utils/uploads",
  (req, res, next) => {
    const origin = req.get("origin");
    if (Array.isArray(corsOptions.origin) && origin && corsOptions.origin.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      if (corsOptions.credentials) {
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    }
    next();
  },
  express.static(utilsUploadsPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=" + path.basename(filePath));
      }
    },
  })
);

// Also serve general uploads (service-bills etc.)
const uploadsPath = path.join(__dirname, "uploads");
app.use(
  "/uploads",
  (req, res, next) => {
    const origin = req.get("origin");
    if (Array.isArray(corsOptions.origin) && origin && corsOptions.origin.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      if (corsOptions.credentials) {
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    }
    next();
  },
  express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=" + path.basename(filePath));
      }
    },
  })
);


const PORT = process.env.PORT || 2500;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));