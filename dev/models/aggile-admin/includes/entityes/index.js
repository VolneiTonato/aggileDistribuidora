let fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize'),
    basename = path.basename(module.filename)

let db = {}


let sequelize = {}

try {



    sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PWD, {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        dialectOptions: {
            insecureAuth: true
        },
        logging: false,
        pool: {
            dle: 10000,
            min: 0,
            max: 5
        }
    })


} catch (err) {
    throw err
}

fs.readdirSync(__dirname)
    .filter(file => {
        if (file != 'index.js')
            return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(file => {
        let model = sequelize['import'](path.join(__dirname, file))

        if (model)
            db[model.name] = model
    })

Object.keys(db).forEach(modelName => {

    if (db[modelName].associate)
        db[modelName].associate(db)


})

sequelize
    .authenticate()
    .then(async () => {
        //await db.Pessoa.sync({force: true})
        //await db.MotivoDevolucaoCheque.sync({force: true})
        // await db.HistoricoCheque.drop()
        //await db.Cheque.sync({force: true})

        //await db.HistoricoCheque.sync({force: true})


    })
    .catch(err => {
        console.log(err)
    })




//db.Cedente.sync({force: true})
//db.MotivoDevolucaoCheque.sync({force: true})
//db.HistoricoCheque.drop()
//db.Cheque.sync({force: true})
//db.HistoricoCheque.sync({force: true})


//ALTER TABLE `enderecos` CHANGE ADD `tipo_pessoa` `tipo_pessoa` ENUM('cliente','fabrica','vendedor','agencia') NOT NULL;
//ALTER TABLE `enderecos` ADD `tipo_pessoa` ENUM('cliente','fabrica','vendedor','agencia') NOT NULL;


//sequelize.queryInterface.addColumn('cheques','bancoId', {type: Sequelize.INTEGER, allowNull: false})
//sequelize.queryInterface.addColumn('grupos_ecommerce','breadCrumbLink', {type: Sequelize.STRING, allowNull: true})
//sequelize.queryInterface.addColumn('produtos_ecommerce','isEcommerce', {type: Sequelize.BOOLEAN, allowNull: true, defaulValue: false })

module.exports = {
    sequelize: sequelize,
    Sequelize: Sequelize,
    Op: Sequelize.Op,
    entity: db,
    conexao: sequelize,
    QueryTypes: sequelize.QueryTypes,
    SQ: sequelize
}