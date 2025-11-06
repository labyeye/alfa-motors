require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

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

const { protect } = require("./middleware/auth");

const app = express();

connectDB();

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

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use("/public", express.static(path.join(__dirname, "public")));

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
