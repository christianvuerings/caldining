var gulp = require('gulp');
var filter = require('gulp-filter');
var browserSync = require('browser-sync');
var mainBowerFiles = require('main-bower-files');

var paths = {
  src: {
    css: ['src/css/**/*.css'],
    fonts: 'src/fonts/**/*.*',
    img: 'src/img/**/*.*',
    js: mainBowerFiles({
      base: './bower_components',
      filter: /.*\.js$/i
    }).concat(['src/js/lib-base/**/*.js', 'src/js/lib/**/*.js', 'src/js/**/*.js']),
    html: 'src/index.html'
  },
  build: {
    css: 'public/**/*.css',
    js: 'public/**/*.js',
    main: 'public'
  }
};

gulp.task('nodemon', function(cb) {
  var nodemon = require('gulp-nodemon');
  var called = false;
  return nodemon({
    script: 'server.js',
    watch: ['server.js', 'server/**/*.*']
  })
  .on('start', function onStart() {
    if (!called) {
      cb();
    }
    called = true;
  })
  .on('restart', function onRestart() {
    setTimeout(function reload() {
      browserSync.reload({
        stream: false
      });
    }, 500);
  });
});

gulp.task('browser-sync', ['index', 'nodemon'], function() {
  var port = process.env.PORT || 5000;
  browserSync.init({
    files: ['public/**/*.*'],
    proxy: 'http://localhost:' + port,
    port: 4000,
    browser: ['google chrome']
  });
});

gulp.task('images', function() {
  var imagemin = require('gulp-imagemin');
  var pngcrush = require('imagemin-pngcrush');
  return gulp.src(paths.src.img)
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngcrush()]
  }))
  .pipe(gulp.dest('public/img'));
});

gulp.task('css', function() {
  var concat = require('gulp-concat');
  var autoprefixer = require('gulp-autoprefixer');

  return gulp.src(paths.src.css)
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(concat('app.css'))
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts', function() {
  return gulp.src(paths.src.fonts)
    .pipe(gulp.dest('public/fonts'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('js', function() {
  var uglify = require('gulp-uglify');
  var concat = require('gulp-concat');

  return gulp.src(paths.src.js)
    .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('index', ['images', 'js', 'css', 'fonts'], function() {
  var inject = require('gulp-inject');
  var vulcanize = require('gulp-vulcanize');
  var target = gulp.src('./src/index.html');
  var sources = gulp.src([paths.build.js, paths.build.css], {
    read: false
  });

  return target.pipe(vulcanize({
    dest: 'public'
  }))
  .pipe(inject(sources, {
    addRootSlash: false,
    ignorePath: 'public'
  }))
  .pipe(gulp.dest('public'));
});

gulp.task('build-clean', function(cb) {
  var del = require('del');
  del([
    'public/'
  ], cb);
});

gulp.task('build', ['images', 'js', 'css', 'fonts', 'index', 'browser-sync']);

gulp.task('lint', function() {
  gulp.src([
    'index.js',
    'gulpfile.js',
    'test/**/*.js'
  ])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['build'], function() {
  gulp.watch(paths.src.html, ['index', browserSync.reload]);
  gulp.watch(paths.src.css, ['css']);
  gulp.watch(paths.src.fonts, ['fonts', browserSync.reload]);
  gulp.watch(paths.src.js, ['js', browserSync.reload]);
  gulp.watch(paths.src.img, ['images', browserSync.reload]);
});
