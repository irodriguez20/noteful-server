require('dotenv').config
const knex = require('knex')
const FoldersService = require('./folders-service')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

console.log(FoldersService.getAllFolders())