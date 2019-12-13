const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('folders')
    },
    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('folders')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('folders').select('*').where('id', id).first()
    }
}

module.exports = FoldersService