const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroSequelize = require('admin-bro-sequelizejs')
var Sequelize = require('sequelize');
var models = require('./models');


AdminBro.registerAdapter(AdminBroSequelize)

const adminBro = new AdminBro({

  databases: [models],
  rootPath: '/admin',
})

const router = AdminBroExpress.buildRouter(adminBro)

module.exports = router

