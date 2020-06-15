const gulp = require('gulp')
const copy = require('gulp-copy')

let path = require('path')

let paths = {
    es6: ['dev/**/*.js'],
    es5: 'build',

    sourceRoot: path.join(__dirname, 'build'),

    pugSrc: {
        source: ['dev/src/**/*.pug'],
        dest: './build/src/'
    },

    pugTemplate: {
        source: ['dev/templates/**/*.pug'],
        dest: './build/templates/'
    },

    pugTemplateEmails: {
        source: ['dev/templates-email/**/*.pug'],
        dest: './build/templates-email/'
    },


    pathConfig: ['./dev/config/**/*.json', './dev/config/**/*.yml'],

    pugPaths: [
        './dev/src/**/*.pug',
        './dev/templates/**/*.pug'
    ],

    start: './build/bootstrap/index.js'
}

const copyView = (cb) => {
    return gulp.src(paths.pugPaths)
        .pipe(copy('./build', { prefix: 1 }))
}

const copyConfig = (cb) => {
    return gulp.src(paths.pathConfig)
        .pipe(copy('./build', { prefix: 1 }))
}


gulp.task('build', gulp.parallel(copyView, copyConfig))


process.env.NODE_ENV = 'production'

gulp.task('default',  gulp.series('build'))
