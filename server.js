// npm packages needed
const express = require('express');
const path = require('path');
const fs = require('fs');

// Sets the assigned PORT for the environment
const PORT = process.env.PORT || 3001;

// Creates an "express" node server called app
const app = express();

// Sets up the MIDDLEWARE that handle data parsing for POSTs and PUTs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// localtion of static (unchanging) files
app.use(express.static('public'));

// GET Route for notes html page
app.get('/notes', (req, res) =>
res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// GET (Wildcard) route for html homepage
//  connects to this route if no other route matches
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// defines router to API server code
const notes = require("./routes/notes");
//  defines the path to the endpoint for API server code
app.use("/api/notes", notes);

// opens the LISTENER to the port defined above
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);