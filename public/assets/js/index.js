let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

// get all stored notes
const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // save a new note (will create an id)
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  // remove a note from storage
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

// function to update a note that already exists
const updateNote = (id,note) =>
  fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note)
  });
// *^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*

// display note list on page
const renderActiveNote = () => {
  hide(saveNoteBtn);

  if (activeNote.id) {
    // noteTitle.setAttribute('readonly', true);
    // noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    // noteTitle.removeAttribute('readonly');
    // noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

// save a new note and display in note list
const handleNoteSave = (e) => {
   // Prevents the click listener for the list from being called when the button inside of it is clicked
   e.stopPropagation();

   // get the note from the click event target
   const note = e.target;
  //  console.log(activeNote.id.length)
  //  console.log(activeNote.id)
  //  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;
  
  if (activeNote.id) {
      console.log(activeNote.id)
      // update the active note
      const updNote = {
        title: noteTitle.value.trim(),
        text: noteText.value.trim(),
        id: activeNote.id
      };
      updateNote(activeNote.id,updNote).then(() => {
        activeNote = updNote;
        getAndRenderNotes();
        renderActiveNote();
      });
    } else {
      const newNote = {
        title: noteTitle.value.trim(),
        text: noteText.value.trim(),
      };
      saveNote(newNote).then(() => {
        getAndRenderNotes();
        renderActiveNote();
      });
    };
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Render the list of note titles
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    // adds an "onclick" event listener to each note in list
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      // perform the delete function if the del button is clicked
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  // for each note in the json file, 
  // create an <li> element 
  // and add it onto the note li array
  jsonNotes.forEach((note) => {
    // creates a list item with the note title
    const li = createLi(note.title);
    // store the entire note in the data element(really?)
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  // >*> Why is a location needed for this?
  if (window.location.pathname === '/notes') {
    // for each <li> note in the note li array, 
    // append them to the parent <ul>
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

// add event listeners to:
//   click events:     the save button, add new note button,
//   keystroke event:  the note title area, and the note text area
if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderNotes();
