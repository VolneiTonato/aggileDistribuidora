module.exports.isLoggedIn = (req, res, next) => {

    
    //if('adminAggile' in req.session && ('tokenAccess' in req.session.adminAggile))
    //    return next()
   

    if (req.isAuthenticated())
        return next()


    res.redirect('/admin/auth')
}