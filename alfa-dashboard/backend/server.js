require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const sellLetterRoutes = require("./routes/selLetter");
const dashboardRoutes = require("./routes/dashboard");
const serviceBillRoutes = require("./routes/serviceBillRoutes");
const rcRoutes = require("./routes/rcRoutes");
const sellRoutes = require("./routes/sellRoutes");
const carRoutes = require("./routes/carRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const refurbishmentRoutes = require("./routes/refurbishmentRoutes");
const advancePaymentRoutes = require("./routes/advancePaymentRoutes");
const path = require("path");
const fs = require("fs");
const { protect } = require("./middleware/auth");
const cors = require("cors");

const app = express();

// Connect to database

connectDB();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or file://)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://127.0.0.1:5502",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "http://localhost:5500",
      "http://localhost:5501",
      "http://localhost:5502",
      "https://www.alfamotorworld.com",
      "https://alfa-motors-o5cm.vercel.app",
      "https://alfa-motors-5yfh.vercel.app",
    ];
    
    // Allow any localhost or 127.0.0.1 origin
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lightweight CORS header middleware to ensure preflight responses
// always include the expected headers (helps file uploads and Authorization preflight)
app.use((req, res, next) => {
  const origin = req.get('origin');

  // If no origin (curl, mobile apps), allow by default
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Use the corsOptions.origin function to check if origin is allowed
    try {
      if (typeof corsOptions.origin === 'function') {
        corsOptions.origin(origin, (err, allowed) => {
          if (!err && allowed) {
            res.setHeader('Access-Control-Allow-Origin', origin);
          }
        });
      } else if (Array.isArray(corsOptions.origin) && corsOptions.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } catch (e) {
      // swallow and continue
    }
  }

  if (corsOptions.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Allow common headers needed by our frontend (Authorization + multipart/form-data)
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');

  // Short-circuit preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Enable pre-flight for all routes and apply CORS middleware
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Serve public directory for sell request uploads
app.use(
  "/public",
  express.static(path.join(__dirname, "public"))
);

app.use("/api/auth", authRoutes);
app.use("/api/rc", rcRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sell-letters", sellLetterRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/service-bills", serviceBillRoutes);
app.use("/api/sell-requests", sellRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/refurbishments", refurbishmentRoutes);
app.use("/api/advance-payments", advancePaymentRoutes);

const carImagesPath = path.join(__dirname, "utils/carimages");
app.use(
  "/carimages",
  (req, res, next) => {
    const origin = req.get("origin");
    if (
      Array.isArray(corsOptions.origin) &&
      origin &&
      corsOptions.origin.includes(origin)
    ) {
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
        const placeholderBase64 =
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
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
        res.setHeader(
          "Content-Disposition",
          "inline; filename=" + path.basename(filePath)
        );
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
    if (
      Array.isArray(corsOptions.origin) &&
      origin &&
      corsOptions.origin.includes(origin)
    ) {
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
        res.setHeader(
          "Content-Disposition",
          "inline; filename=" + path.basename(filePath)
        );
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
    if (
      Array.isArray(corsOptions.origin) &&
      origin &&
      corsOptions.origin.includes(origin)
    ) {
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
        res.setHeader(
          "Content-Disposition",
          "inline; filename=" + path.basename(filePath)
        );
      }
    },
  })
);

const PORT = process.env.PORT || 2500;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
