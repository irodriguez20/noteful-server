require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require('./config')
const NotesService = require('./notes/notes-service')
const FoldersService = require('./folders/folders-service')

const app = express()
const jsonParser = express.json()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.get('/notes', (req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
        .then(notes => {
            res.json(notes.map(note => ({
                id: note.id,
                name: note.name,
                modified: note.modified,
                folderid: note.folderid,
                content: note.content,
            })))
        })
        .catch(next)
})

app.get('/notes/:note_id', (req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getById(knexInstance, req.params.note_id)
        .then(note => {
            if (!note) {
                return res.status(404).json({
                    error: { message: `Note doesn't exist` }
                })
            }
            res.json(note)
        })
        .catch(next)
})

app.post('/notes', jsonParser, (req, res, next) => {
    const { name, folderid, content } = req.body
    const newNote = { name, folderid, content }
    NotesService.insertNote(
        req.app.get('db'),
        newNote
    )
        .then(note => {
            res
                .status(201)
                .location(`/notes/${note.id}`)
                .json(note)
        })
        .catch(next)
})

app.get('/folders', (req, res, next) => {
    const knexInstance = req.app.get('db')
    FoldersService.getAllFolders(knexInstance)
        .then(folders => {
            res.json(folders.map(folder => ({
                id: folder.id,
                folder_name: folder.folder_name,
            })))
        })
})

app.get('/folders/:folder_id', (req, res, next) => {
    const knexInstance = req.app.get('db')
    FoldersService.getById(knexInstance, req.params.folder_id)
        .then(folder => {
            if (!folder) {
                return res.status(404).json({
                    error: { message: `Folder doesn't exist` }
                })
            }
            res.json(folder)
        })
        .catch(next)
})

app.post('/folders', jsonParser, (req, res, next) => {
    const { folder_name } = req.body
    const newFolder = { folder_name }
    FoldersService.insertFolder(
        req.app.get('db'),
        newFolder
    )
        .then(folder => {
            res
                .status(201)
                .json(folder)
        })
        .catch(next)
})

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app