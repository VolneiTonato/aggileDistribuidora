const localStrategy = require('passport-local').Strategy
const usuarioModel = require('../../../../models/aggile-admin/includes/usuarioModel')
const utils = require('../../../../helpers/_utils/utils')
const _ = require('lodash')
const aggileSessionIncludeModel = require('../../../../models/aggile-session/aggileSessionIncludeModel')


//https://scotch.io/tutorials/easy-node-authentication-setup-and-local

module.exports = (app, passport) => {

    let User = new usuarioModel()._model

    //let redis = app.get('redis')


    passport.serializeUser((user, done) => {
        done(null, user.id)
    })


    passport.deserializeUser((id, done) => {
        User.findByPk(id)
            .then( (user) => {
                done(null, user)
            }).catch( (err) => {
                done(err)
            })
    })


    passport.use('local-create-usuario', new localStrategy({

        usernameField: 'login',
        passwordField: 'password',
        passReqToCallback: true
    },
        (req, login, password, done) => {


            process.nextTick(() => {


                User.findOne({ 'login': login }, (err, user) => {

                    if (err)
                        return done(err)


                    if (user) {
                        return done(null, false, req.flash('messsageCreateUsuario', 'Login inválido!'));
                    } else {


                        var newUser = new usuarioModel()._model;


                        newUser.login = login;
                        newUser.password = newUser.generateHash(password)


                        newUser.save((err) => {
                            if (err)
                                throw err
                            return done(null, newUser)
                        })
                    }

                })

            })

        }))

    passport.use('local-login', new localStrategy({

        usernameField: 'login',
        passwordField: 'password',
        passReqToCallback: true
    },
        (req, login, password, done) => {

            try {


                User.findOne({ where: { login: login}}).then( (user) => {

                    let messageError = 'Ooops! Usuário inválido e/ou senha inválida.'


                    if (!user)
                        return done(null, false, req.flash('loginMessage', messageError))

                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', messageError))


                    let objClone = _.clone(JSON.parse(JSON.stringify(user)))

                    let data = new Date()

                    delete objClone.password

                    objClone.dataRegisterSession = data


                    req.session.adminAggile = {}
                    objClone.tokenAccess = utils.CryptUtil.encryptDadosBase64(`${user.id}${utils.CryptUtil.uniqueId()}${data.toString()}` , utils.CryptUtil.KeysCrypt().JWT)

                    req.session.adminAggile.tokenAccess = objClone.tokenAccess

                    new aggileSessionIncludeModel.SessionAdminModel().save(objClone).then( (data) => {
                        return done(null, user)
                    }).catch( (err) => {
                        return done(err)
                    })
                    /*
                    redis.set(objClone.tokenAccess, JSON.stringify(objClone), (err, body) => {
                        if(err)
                            return done(err)
                        return done(null, user)
                    })*/

                    //return  done(null, user)
                    
                }).catch( (err) => {
                    let error = err.toString()
                    if(/ECONNREFUSED/ig.test(error))
                        error = 'Problemas com acesso ao banco de dados'
                    return done(null, false, req.flash('loginMessage', error))
                })
            } catch (err) {
               
                return done(null, false, req.flash('loginMessage', err))
            }

        }))

}