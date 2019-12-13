function makeNotesArray() {
    return [
        {
            id: 1,
            name: 'First test note',
            modified: '1919-12-22T16:28:32.615Z',
            folderid: 2,
            content: 'First test content'
        },
        {
            id: 2,
            name: 'Second test note',
            modified: '1919-12-22T16:28:32.615Z',
            folderid: 3,
            content: 'Second test content'
        },
        {
            id: 3,
            name: 'Second test note',
            modified: '1919-12-22T16:28:32.615Z',
            folderid: 1,
            content: 'Second test content'
        }
    ]
}

module.exports = {
    makeNotesArray
}