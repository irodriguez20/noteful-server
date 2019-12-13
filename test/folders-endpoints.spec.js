require('dotenv').config()
const app = require('../src/app')
const FoldersService = require('../src/folders/folders-service')
const knex = require('knex')
const { makeFoldersArray } = require('./folders-fixtures')

describe(`Folders Endpoints`, function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

    context(`Given there are folders in the database`, () => {
        const testFolders = makeFoldersArray()

        beforeEach(() => {
            return db
                .into('folders')
                .insert(testFolders)
        })

        it(`GET /folders responds with 200 and all of the folders`, () => {
            //test the FoldersService.getAllFolders getsd data from table
            return supertest(app)
                .get('/folders')
                .expect(200, testFolders)
        })

        it(`GET /folders/:folder_id responds with 200 and the specified folder`, () => {
            const folderId = 3
            const expectedFolder = testFolders[folderId - 1]

            return supertest(app)
                .get(`/folders/${folderId}`)
                .expect(200, expectedFolder)
        })
    })

    context(`Given 'folders' has no data`, () => {
        it(`getAllFolders() resolves an empty array`, () => {
            return FoldersService.getAllFolders(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it(`insertFolders() inserts a new folder and resolves the new folder with an 'id'`, () => {
            const newFolder = {
                folder_name: 'Test new folder name',
            }
            return FoldersService.insertFolder(db, newFolder)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        folder_name: newFolder.folder_name,
                    })
                })
        })
    })
})