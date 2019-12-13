require('dotenv').config
const knex = require('knex')
const NotesService = require('./notes-service')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

NotesService.getAllNotes(knexInstance)
    .then(notes => console.log(notes))
    .then(() =>
        NotesService.insertNote(knexInstance, {
            name: 'New name',
            modified: new Date(),
            folderid: 2,
            content: 'New content',
        })
    )
    .then(newNote => {
        console.log(newNote)
        return NotesService.updateNote(
            knexInstance,
            newNote.id,
            { name: 'Updated name' }
        ).then(() => NotesService.getById(knexInstance, newNote.id))
    })
    .then(note => {
        console.log(note)
        return NotesService.deleteNote(knexInstance, note.id)
    })