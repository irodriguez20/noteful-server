require("dotenv").config();
const { expect } = require("chai");
const app = require("../src/app");
const knex = require("knex");
const { makeNotesArray } = require("./notes-fixtures");
const { makeFoldersArray } = require("./folders-fixtures");

describe(`Notes Endpoints`, function () {
    let db;

    before("make knex instance", () => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DB_URL
        });
        app.set("db", db);
    });

    after("disconnect from db", () => db.destroy());

    before("clean the table", () =>
        db.raw("TRUNCATE notes, folders RESTART IDENTITY CASCADE")
    );

    afterEach("cleanup", () =>
        db.raw("TRUNCATE notes, folders RESTART IDENTITY CASCADE")
    );

    describe("GET /notes", () => {
        context(`Given no notes`, () => {
            it(`Returns 200 and an empty list`, () => {
                return supertest(app)
                    .get('/notes')
                    .expect(200, [])
            })
        })

        context(`Given there are notes in the database`, () => {
            const testNotes = makeNotesArray();
            const testFolders = makeFoldersArray();

            beforeEach("insert folders and notes", () => {
                return db
                    .into("folders")
                    .insert(testFolders)
                    .then(() => {
                        return db.into("notes").insert(testNotes);
                    });
            });

            it(`GET /notes responds with 200 and all of the notes`, () => {
                return supertest(app)
                    .get("/notes")
                    .expect(200, testNotes);
            });

        });
        context(`Given no notes`, () => {
            const testFolders = makeFoldersArray();

            beforeEach(() => {
                return db.into("folders").insert(testFolders);
            });
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get("/notes")
                    .expect(200, []);
            });
        });
    });

    describe('GET /notes/:note_id', () => {

        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .get(`/notes/${noteId}`)
                    .expect(404, { error: { message: `Note doesn't exist` } })
            })
        })

        context('Given there are notes in the database', () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray();

            beforeEach("insert folders and notes", () => {
                return db
                    .into("folders")
                    .insert(testFolders)
                    .then(() => {
                        return db.into("notes").insert(testNotes);
                    });
            });
            it("GET /note/:note_id responds with 200 and the specified note", () => {
                const noteId = 2;
                const expectedNote = testNotes[noteId - 1];
                return supertest(app)
                    .get(`/notes/${noteId}`)
                    .expect(200, expectedNote);
            });
        })
    })

    describe.only(`POST /notes`, () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray();

        beforeEach("insert folders and notes", () => {
            return db
                .into("folders")
                .insert(testFolders)
                .then(() => {
                    return db.into("notes").insert(testNotes);
                });
        });

        it(`creates a note, responding with 201 and the new note`, function () {
            this.retries(3)
            const newNote = {
                name: 'Test new note',
                folderid: 2,
                content: 'Test new content',
            }
            return supertest(app)
                .post('/notes')
                .send(newNote)
                .expect(res => {
                    expect(res.body.name).to.eql(newNote.name)
                    // expect(res.body.modified).to.eql(newNote.modified)
                    expect(res.body.folderid).to.eql(newNote.folderid)
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/notes/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.modified).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/notes/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
    })


});
