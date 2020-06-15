import './config/env'
import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import passport from 'passport'
import helmet from 'helmet'
import {randomBytes} from 'crypto'
import compression from 'compression'
import cors from 'cors'
import { EventEmitter} from 'events'
import { toString} from 'lodash'

try {

	EventEmitter.defaultMaxListeners = 20
	EventEmitter.prototype._maxListeners = 20

	process.setMaxListeners(20)


	let port = process.env.PORT || 3000


	let app = new express()

	app.use(cors())
	app.use(helmet())
	app.use(compression())


	app.disable('x-powered-by')

	app.use(bodyParser.json({ limit: '1mb' }))
	app.use(bodyParser.urlencoded({ extended: true, limit: '1mb', parameterLimit: 10000}))


	app.use('/public', express.static(path.join(__dirname, '..', 'app', 'public'), {
		maxAge: '1d',
		etag:false,
		dotfiles:'deny',
		index:false,
		setHeaders: function(res, path, stat){
			res.set('Authtentication', `Bear ${randomBytes(30).toString('hex')}`)
		}

	}))

	require('./bootstrap/middleware-app')(app)

	app.use(passport.initialize())


	app.use(passport.session())

	app.set('passport', passport)

	require('./routers/routes')(app, passport)




	app.use((err, req, res, next) => {
		try {

			let status = err?.status || 500
			let message = err?.message || toString(err) || 'Request Aborted.'
			
			if (status && status < 500)
				return res.status(status).send(message)

			if (req.xhr)
				return res.partial(status, { error: message })
			else
				return res.render(status, { error: message })

		} catch (e) {
			return res.status(500).send('Request Aborted.')
		}

	})



	let server = app.listen(port)



	server.maxConnections = 500




	server.on('error', (err) => {
		console.debug(`error server listen -> ${err}`)
	})

	server.on('listening', () => {
		console.debug(`Listen server on PORT -> ${port}`)
	})


} catch (err) {
	console.debug('Error app -> ' + typeof err == 'object' ? err.toString() : err)
}
