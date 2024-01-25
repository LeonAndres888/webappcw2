const express = require("express");
const { MongoClient } = require("mongodb");
const PropertiesReader = require("properties-reader");
const loggerMiddleware = require("./middlewares/logger");
const lessonsRoutes = require("./routes/lessons");
const ordersRoutes = require("./routes/orders");
const path = require("path");

// Construct the path to the properties file
const propertiesPath = path.join(__dirname, "conf", "db.properties");

// Use the path with the properties reader
const properties = PropertiesReader(propertiesPath);

// Now, construct the dbUri using the properties
const dbUri = `${properties.get("db.prefix")}${properties.get(
  "db.user"
)}:${encodeURIComponent(properties.get("db.pwd"))}@${properties.get(
  "db.url"
)}/${properties.get("db.name")}${properties.get("db.params")}`;

// Ensure dbUri is logged after it's defined
console.log(dbUri);

// MongoDB client
const client = new MongoClient(dbUri);

// Express application setup
const app = express();
const port = 8888;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(loggerMiddleware); // Logger middleware
app.use("/images", express.static(path.join(__dirname, "images"))); // Static files middleware

app.use("/api", lessonsRoutes); // Lessons routes
app.use("/api", ordersRoutes); // Orders routes

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    return client.db(properties.get("db.name")); // returns the specific database instance
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!", error);
    process.exit(1);
  }
}

// Middleware for MongoDB connection
app.use(async (req, res, next) => {
  if (!client) {
    console.log("MongoDB client is not initialized. Trying to reconnect...");
    await connectToDatabase();
  }
  req.db = client.db(properties.get("db.name"));
  next();
});

app.use("/images", express.static("/images"));

// ... after setting up the express app ...
app.use(loggerMiddleware);
app.use("/api", lessonsRoutes);
app.use("/api", ordersRoutes);

// Define routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  // Connect to the database when the server starts
  await connectToDatabase();
});
