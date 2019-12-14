require('dotenv').config
const knex = require('knex')
const FoldersService = require('./folders-service')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

FoldersService.getAllFolders(knexInstance)
    .then(folders => console.log(notes))
    .then(() =>
        FoldersService.insertFolder(knexInstance, {
            folder_name: 'new folder name,'
        })
    )
    .then(newFolder => {
        console.log(newFolder)
        return FoldersService.updateFolder(
            knexInstance,
            newFolder.id,
            { name: 'Updated name' }
        ).then(() => FoldersService.getById(knexInstance, newFolder.id))
    })
    .then(folder => {
        console.log(folder)
        return FoldersService.deleteFolder(knexInstance, folder.id)
    })