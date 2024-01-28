const express = require("express");
const { MongoClient } = require("mongodb");
const PropertiesReader = require("properties-reader");
const loggerMiddleware = require("./backend/middlewares/logger");
const lessonsRoutes = require("./backend/routes/lessons");
const ordersRoutes = require("./backend/routes/orders");
const path = require("path");
const cors = require("cors");

// Load database properties from file or environment variable
const propertiesPath =
  process.env.DB_PROPERTIES_PATH ||
  path.join(__dirname, "backend", "conf", "db.properties");
const properties = PropertiesReader(propertiesPath);

// Construct MongoDB URI using properties file credentials
const dbUri = `${properties.get("db.prefix")}${properties.get(
  "db.user"
)}:${encodeURIComponent(properties.get("db.pwd"))}@${properties.get(
  "db.url"
)}/${properties.get("db.name")}${properties.get("db.params")}`;

// Initialize MongoDB client
const client = new MongoClient(dbUri);

// Initialize Express application
const app = express();
const port = process.env.PORT || 8080; // Set server port

// Configure CORS options to allow requests from github origin
const corsOptions = {
  origin: "https://leonandres888.github.io",
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions)); // Enable CORS with specified options
app.use(express.json()); // Parse JSON request bodies
app.use(loggerMiddleware); // Use logger middleware for request logging

// Connect to MongoDB
// Establish connection to MongoDB Atlas and return database instance.
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    return client.db(properties.get("db.name")); // Return database instance
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
    process.exit(1); // Exit process if connection fails
  }
}

// Middleware to ensure MongoDB connection is working
// Reconnects to MongoDB if client is disconnected and attaches db instance to request

app.use(async (req, res, next) => {
  if (!client.topology || !client.topology.isConnected()) {
    console.log("MongoDB client is not connected. Trying to reconnect...");
    await connectToDatabase();
  }
  req.db = client.db(properties.get("db.name")); // Attach db instance to request
  next(); // Continue to next middleware
});

// Register API route handlers
app.use("/api/lessons", lessonsRoutes); // Use lessons routes for '/api/lessons' path
app.use("/api/orders", ordersRoutes); // Use orders routes for '/api/orders' path

// Middleware to prevent response caching
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
