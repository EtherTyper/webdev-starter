"use strict";
let gulp = require('gulp'),
    cache = require('gulp-cached'),
    connect = require('gulp-connect'),
    del = require('del'),
    copy = require('gulp-copy'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('rollup-plugin-uglify'),
    rollupIncludePaths = require('rollup-plugin-includepaths'),
    syncDir = require('gulp-sync-dir'),
    plumber = require('gulp-plumber'),
    typescript = require('rollup-plugin-typescript'),
    babel = require('rollup-plugin-babel'),
    fs = require('fs'),
    rollup = require('rollup').rollup,
    rCache;

gulp.task('js', () => {
    return rollup({
        entry: 'src/js/entry.ts',
        plugins: [
            rollupIncludePaths({
                paths: ['src/js'],
                include: {},
                external: [],
                extensions: ['.ts']
            }),
            typescript({
                typescript: require('typescript')
            }),
            babel({
                presets: [
                    ["es2015", {"modules": false}]
                ],
                plugins: [
                    "external-helpers"
                ]
            }),
            uglify()
        ],
        cache: rCache
    }).then((bundle) => {
        let result = bundle.generate({
            format: 'iife',
            moduleName: 'app',
            sourceMap: true,
            sourceMapFile: 'dist/js/app.js'
        });
        rCache = bundle;
        fs.mkdir('dist', () => {
            fs.mkdir('dist/js', () => {
                fs.writeFileSync('dist/js/app.js', result.code + '\n//# sourceMappingURL=app.js.map\n');
                fs.writeFileSync('dist/js/app.js.map', result.map.toString() + '\n');
            });
        });
    }).catch(() => {});
});

gulp.task('css', (done) => {
    gulp.src(['src/css/**/*.scss'])
        .pipe(plumber())
        .pipe(cache('css'))
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(plumber.stop())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'));
    done();
});

gulp.task('unused', (done) => {
    syncDir({
        src: 'src',
        target: 'dist',
        extensions: {
            'map': '',
            'js': 'ts',
            'css': 'scss'
        }
    });
    done();
});

gulp.task('copy', (done) => {
    gulp.src(['src/**/*', '!src/css/**/*.scss', '!src/js/**/*.ts'])
        .pipe(plumber())
        .pipe(copy('dist', {prefix: 1}))
        .pipe(plumber.stop());
    done();
});

gulp.task('process', gulp.parallel('unused', 'copy', 'js', 'css'));

gulp.task('reload', (done) => {
    gulp.src('dist/**/*')
        .pipe(plumber())
        .pipe(connect.reload())
        .pipe(plumber.stop());
    done();
});

gulp.task('server', () => {
    connect.server({
        root: 'dist',
        livereload: true
    });
});

gulp.task('clean', () => {
   return del(['dist/**']).catch(() => {});
});

gulp.task('watch', () => {
    gulp.watch('src/**/*', gulp.series('process', 'reload'));
});

gulp.task('launch', gulp.parallel('server', 'watch'));

gulp.task('default', gulp.series('clean', 'process', 'launch'));
