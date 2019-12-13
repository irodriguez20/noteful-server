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

        context('Given there are articles in the database', () => {
            const testNotes = makeNotesArray();
            it("GET /note/:note_id responds with 200 and the specified note", () => {
                const noteId = 2;
                const expectedNote = testNotes[noteId - 1];
                return supertest(app)
                    .get(`/notes/${noteId}`)
                    .expect(200, expectedNote);
            });
        })
    })


});
