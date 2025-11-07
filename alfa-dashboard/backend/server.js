require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// Use Sequelize DB connection (MySQL)
const { sequelize } = require('./db');

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const sellLetterRoutes = require("./routes/selLetter");
const dashboardRoutes = require("./routes/dashboard");
const serviceBillRoutes = require("./routes/serviceBillRoutes");
const rcRoutes = require("./routes/rcRoutes");
const sellRoutes = require("./routes/sellRoutes");
// legacy Mongo routes removed. Use SQL routes (carSqlRoutes) instead.
const carSqlRoutes = require("./routes/carSqlRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const refurbishmentRoutes = require("./routes/refurbishmentRoutes");
const advancePaymentRoutes = require("./routes/advancePaymentRoutes");

const { protect } = require("./middleware/auth");

const app = express();

// Ensure Sequelize connection was initialized in db.js; no Mongo connect performed.
// sequelize.authenticate().then(() => console.log('Database connected')).catch(err => console.error('Database connection error:', err));

const ALLOWED_ORIGINS = [
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

const corsOptions = {
  // Allow any origin. The `cors` package will reflect the request origin
  // and still allow credentials when `origin: true` is used.
  // This makes the server accept requests from any domain.
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
    "Access-Control-Expose-Headers",
  ],
  credentials: true,
};

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Response normalizer: ensure objects returned by Sequelize (which use `id`)
// also include a Mongo-compatible `_id` field when `_id` is not present.
// This makes frontend/dashboard code that expects `_id` continue to work
// while the backend uses numeric `id` from SQL.
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (payload) {
    function normalize(obj) {
      if (!obj || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(normalize);
      // Convert Sequelize instance to plain object if necessary
      if (obj.dataValues && typeof obj.dataValues === "object") obj = obj.dataValues;
      if (obj.id && !Object.prototype.hasOwnProperty.call(obj, "_id")) {
        try {
          // ensure not to mutate shared prototypes
          obj._id = obj.id;
        } catch (e) {}
      }
      // recurse into object properties
      Object.keys(obj).forEach((k) => {
        try {
          if (obj[k] && typeof obj[k] === "object") obj[k] = normalize(obj[k]);
        } catch (e) {}
      });
      return obj;
    }

    try {
      payload = normalize(payload);
    } catch (e) {
      // if normalization fails, fall back to original payload
    }
    return originalJson.call(this, payload);
  };
  next();
});

// Early CORS header middleware: ensure responses (including errors)
// always include Access-Control-Allow-Origin when origin is allowed.
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && (origin.includes("localhost") || ALLOWED_ORIGINS.includes(origin))) {
    // Reflect origin to allow cookies/credentials if needed
    res.setHeader("Access-Control-Allow-Origin", origin);
    if (corsOptions.credentials) res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      (corsOptions.allowedHeaders || ["Content-Type", "Authorization"]).join(", ")
    );
    res.setHeader("Access-Control-Allow-Methods", (corsOptions.methods || ["GET", "POST"]).join(", "));
  }
  // Handle preflight quickly
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// apply cors middleware as well (keeps standard behavior for other cases)
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/rc", rcRoutes);
app.use("/api/cars", carSqlRoutes);
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
      origin &&
      (origin.includes("localhost") || ALLOWED_ORIGINS.includes(origin))
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      if (corsOptions.credentials)
        res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    }
    try {
      const requestedPath = decodeURIComponent(req.path || "");
      const fullPath = path.join(carImagesPath, requestedPath);
      if (!fs.existsSync(fullPath)) {
        const placeholderBase64 =
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
        const placeholderBuffer = Buffer.from(placeholderBase64, "base64");
        res.setHeader("Content-Type", "image/png");
        return res.status(200).send(placeholderBuffer);
      }
    } catch (err) {
      console.error("Error checking carimages file existence:", err);
    }
    next();
  },
  express.static(carImagesPath, {
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

const utilsUploadsPath = path.join(__dirname, "utils/uploads");
app.use(
  "/utils/uploads",
  (req, res, next) => {
    const origin = req.get("origin");
    if (
      origin &&
      (origin.includes("localhost") || ALLOWED_ORIGINS.includes(origin))
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      if (corsOptions.credentials)
        res.setHeader("Access-Control-Allow-Credentials", "true");
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

const uploadsPath = path.join(__dirname, "uploads");
app.use(
  "/uploads",
  (req, res, next) => {
    const origin = req.get("origin");
    if (
      origin &&
      (origin.includes("localhost") || ALLOWED_ORIGINS.includes(origin))
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      if (corsOptions.credentials)
        res.setHeader("Access-Control-Allow-Credentials", "true");
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
