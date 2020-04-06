const gulp = require('gulp');
const clean = require('gulp-clean');
const install = require('gulp-install');
const { zip } = require('zip-a-folder');

gulp.task('js', function() {
    return gulp.src(['dist/**/*.js'])
        .pipe(gulp.dest('publish/'));
});

gulp.task('zip', async function() {
    await zip('publish/', './custom-authorizer.zip');

});

gulp.task('clean', function() {
    return gulp.src('publish/', { read: false, allowEmpty: true })
        .pipe(clean());
});

gulp.task('env', function() {
    return gulp.src('./.env')
        .pipe(gulp.dest('./publish'))
});

// Here we want to install npm packages to dist, ignoring devDependencies.
gulp.task('npm', function() {
    return gulp.src('./package.json')
        .pipe(gulp.dest('./publish/'))
        .pipe(install({ production: true }));
});


gulp.task('publish', gulp.series('clean', 'js', 'npm', 'env', 'zip'));