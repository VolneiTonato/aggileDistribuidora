module.exports = (app) => {
    app.use('/', require('../controllers/home-controller')(app))
}