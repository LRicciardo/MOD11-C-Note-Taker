// npm packages needed
const notes = require('express').Router(); // Defines and "express" Router function
const { v4: uuidv4 } = require('uuid'); // gereates a unique id 
const {
  readFromFile,
  readAndAppend,
  writeToFile,
} = require('../helpers/fsUtils');

notes.use(logger);

// GET Route for retrieving all the notes
notes.get('/', (req, res) => {
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// POST Route for a new UX/UI note
notes.post('/', (req, res) => {
  console.log(req.body);
    // Log that a POST request was received
    console.info(`${req.method} request received to add a note`);

// Destructuring assignment for the items in req.body
const { title, text, } = req.body;

// If all the required properties are present
if (title && text) {
  console.log("inside if")
  // Variable for the object we will save
  const newNote = {
    title,
    text,
    id: uuidv4(),
  };

    readAndAppend(newNote, './db/db.json');
  //   res.json(`note added successfully 🚀`);
  // } else {
  //   res.error('Error in adding note');
  // }
    const response = {
      status: 'success',
      body: `New Note was added to db! 
      Title: ${JSON.stringify(newNote.title)}, 
      Text: ${JSON.stringify(newNote.text)}, 
      ID: ${newNote.id}`,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting notes');
  }
});

// all requests for route ("/:note_id")
notes
  .route("/:note_id")
  // GET Route for a specific note
  .get((req, res) => {
    console.log("GET :note_id=>", req.params.note_id );
    const note_id = req.params.note_id;
    readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((json) => {
        const result = json.filter((note) => note.id === note_id);
        return result.length > 0
          ? res.json(result)
          : res.json(`No note with ID ${note_id} `);
      });
  })
  // PUT Route for a specific note
  .put((req, res) => {
    console.log("PUT :note_id=>", req.params.note_id );
    const note_id = req.params.note_id;
    readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((json) => {
        const index = json.findIndex(note_id);
        return index > -1
          ? writeToFile('./db/db.json', res.json(updateNote(json, index)))
          : res.json(`No note with ID ${note_id} `);
      });
  })
  // DELETE Route for a specific note
  .delete((req, res) => {
    console.log("DELETE :note_id=>", req.params.note_id );
    const note_id = req.params.note_id;
    readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((json) => {
        // Make a new array of all notes except the one with the ID provided in the URL
        const result = json.filter((note) => note.id !== note_id);

        // Save that array to the filesystem
        writeToFile('./db/db.json', result);

        // Respond to the DELETE request
        res.json(`Item ${note_id} has been deleted 🗑️`);
      });
  });

  notes.param("id", (req, res, next, note_id) => {
    req.note = notes[note_id];
    next();
  })

function updateNote (note, index) {
    console.log("updating note")
    note(index).title = req.body.title;
    note(index).text = req.body.text;
    // id stays the same
    return note;
  }

function logger (req, res, next) {
    console.log("log route url", req.originalUrl)
    next()
  }

module.exports = notes;