let gulp = require('gulp');
let gutil = require('gulp-util');
let mocha = require('gulp-mocha');
let istanbul = require('gulp-istanbul');
let ts = require('gulp-typescript');
let tsProject = ts.createProject('tsconfig.json');
let typedoc = require('gulp-typedoc');

let coverage = (opts = {}) => {

    let coverageTask = (cb) => {
        gulp.src(['src/*.js'])
            .pipe(istanbul()) // Covering files
            .pipe(istanbul.hookRequire()) // Force `require` to return covered files
            .on('error', logMochaError)
            .on('finish', () => {
                gulp.src(['test/*.js'])
                    .pipe(mocha(opts))
                    .on('error', (err) => {
                        logMochaError(err);
                        if (cb) cb(err);
                    })
                    .pipe(istanbul.writeReports()) // Creating the reports after tests run
                    .on('end', () => {
                        if (cb) cb();
                    });
            });
    }

    return coverageTask;
}

let mochaTask = () => {
    return gulp.src(['test/*.js'], { read: false })
        .pipe(mocha({
            growl: true
        }))
        .on('error', logMochaError);
}

let logMochaError = (err) => {
    if (err && err.message) {
        gutil.log(err.message);
    } else {
        gutil.log.apply(gutil, arguments);
    }
}
let buildIndex = () => {
    return gulp.src(['index.ts'], { read: true })
        .pipe(tsProject())
        .js.pipe(gulp.dest('build'));
}

let buildBinary = () => {
    return gulp.src(['bin/sceptre.ts'], { read: true })
        .pipe(tsProject())
        .js.pipe(gulp.dest('build/bin'));
}
gulp.task('typedoc', () => {
    return gulp.src(['src/**/*.ts'])
        .pipe(typedoc({
            module: 'commonjs',
            target: 'es6',
            out: 'docs/',
            name: 'Sceptre',
            theme: 'minimal',
            version: true
        }));
});

gulp.task('default', () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('build'));
});

gulp.task('index', buildIndex);
gulp.task('binary', buildBinary);
gulp.task('test', mochaTask);
gulp.task('coverage', coverage());
gulp.task('watch-test', () => {
    gulp.watch(['test/**', 'src/**'], ['test']);
    mochaTask();
});
