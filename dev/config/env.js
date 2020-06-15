import { config} from 'dotenv'

config({
    path: process.env.NODE_ENV === 'development' ?  '.env.development.local' : '.env.local'
})