import gulp from 'gulp';
import gulpHelpers from 'gulp-helpers';
import gettext from 'gulp-angular-gettext';
import sass from 'gulp-sass';
import {Builder} from 'jspm';
import sassResolver from 'gulp-systemjs-resolver';
import ts from 'gulp-typescript';
import debug from 'gulp-debug';
import autoprefixer from 'gulp-autoprefixer';

let taskMaker = gulpHelpers.taskMaker(gulp);
let  situation = gulpHelpers.situation();
let _ = gulpHelpers.framework('_');
let runSequence = gulpHelpers.framework('run-sequence');

var path = {
	source: 'src/**/*.js',
	e2e: 'test-e2e/**/*.js',
	e2eOutput: 'test-e2e-compile/',
	react: 'src/**/*.jsx',
	html: '**/*.html',
	templates: ['src/**/*.tpl.html', '!src/index.tpl.html'],
	tstemplatesout: 'src/',
	tstemplates: ['src/app/**/*.tpl.ts', 'typings/**/*.d.ts'],
	less: ['src/**/*.less', '!src/assets/**/*.less'],
	sass: ['src/**/*.sass', '!src/assets/**/*.sass'],
	scss: ['src/application.scss'],
	themes: 'src/assets/themes/*.less',
	themesOutput: 'dist/assets/themes/',
	output: 'dist/',
	indexHtmlOutput: 'dist/index.html',
	routes: './src/app/routes.json',
	minify: 'dist/**/*.js',
	assets: ['./src/**/*.css', './src/**/*.svg', './src/**/*.eot', './src/**/*.woff', './src/**/*.woff2', './src/**/*.ttf', './src/**/*.png', './src/**/*.ico', './src/**/*.gif', './src/**/*.jpg', './src/**/*.mp4', './src/**/*.webm', './src/**/*.eot', './src/**/*.json'],
	json: './src/**/*.json',
	index: './src/index.tpl.html',
	watch: ['./src/**', '!./src/**/*.d.ts'],
	packages: 'jspm_packages/**/*',
	packagesOutput: 'dist/jspm_packages',
	karmaConfig: __dirname + '/karma.conf.js',
	systemConfig: './system.config.js',
	i18nExtractSrc:  ['./src/app/**/*.html', './src/app/**/*.js'],
	i18nPoDir: './src/assets/po/',
	i18nPoTemplate: 'template.pot',
	i18nPoSrc: './src/assets/po/*.po',
	i18nJsonDest: './src/assets/translations/'
};

var routes = require(path.routes);
var routesSrc = routes.map(function(r) { return r.src; });

let bundler = () => {
    let builder = new Builder();
    return builder.buildSFX('src/app/app', 'dist/js/app/app-bundle.js',
        {minify: situation.isProduction() || situation.isDevelopment(), sourceMaps: false});
};

var serverOptions = {
	open: false,
	ui: false,
	notify: false,
	ghostMode: false,
	port: process.env.PORT || 9000,
	server: {
		baseDir: [path.output],
		routes: {
			'/system.config.js': './system.config.js',
			'/jspm_packages': './jspm_packages'
		}
	}
};

if (situation.isProduction()) {
	serverOptions = _.merge(serverOptions, {
		codeSync: false,
		reloadOnRestart: false,
		server: {
			snippetOptions: {
				rule: {
					match: /qqqqqqqqqqq/
				}
			}
		}
	});
}

var cacheBustConfig = {
	usePrefix: false,
	patterns: [
		{
			match: '<!-- PROD',
			replacement: ''
		}, {
			match: 'END -->',
			replacement: ''
		}, {
			match: '{{hash}}',
			replacement: Math.round(new Date() / 1000)
		}
	]
};

var routeBundleConfig = {
	baseURL: path.output,
	main: 'app/app',
	routes: routesSrc,
	bundleThreshold: 0.6,
	config: path.systemConfig,
	sourceMaps: true,
	minify: false,
	dest: 'dist/app',
	destJs: 'dist/app/app.js'
};

var babelCompilerOptions = {
	modules: 'system'
};

// typescript template stuff
import merge from 'merge2';
var tsProject = ts.createProject(__dirname + '/tsconfig.json', {
    declaration: true
});
gulp.task('tstemplates', function() {
	var tsResult = gulp.src(path.tstemplates)
		.pipe(ts(tsProject));

	return merge([
      tsResult.dts.pipe(gulp.dest(path.tstemplatesout + '/app')),
      tsResult.js.pipe(gulp.dest(path.tstemplatesout + '/app'))
  ]);
});

// minify javascript
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
gulp.task('minify', function() {
	return gulp.src(path.minify)
		.pipe(plumber())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(uglify({mangle: false}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(path.output))
});

// translation templates
gulp.task('pot', function () {
    return gulp.src(path.i18nExtractSrc)
        .pipe(gettext.extract(path.i18nPoTemplate, {
            // options to pass to angular-gettext-tools...
        }))
        .pipe(gulp.dest(path.i18nPoDir));
});

gulp.task('translations', function () {
    return gulp.src(path.i18nPoSrc)
        .pipe(gettext.compile({
            // options to pass to angular-gettext-tools...
            format: 'json'
        }))
        .pipe(gulp.dest(path.i18nJsonDest));
});


var includePaths = [];

gulp.task('sass', function () {
	gulp.src(path.sass)
		.pipe(plumber())
    .pipe(sass({}).on('error', sass.logError))
    .pipe(gulp.dest(path.output));
});

gulp.task('scss', function () {
  gulp.src(path.scss)
		.pipe(plumber())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sassResolver({systemConfig: './system.config.js', includePaths: includePaths}))
		.pipe(sass({includePaths: includePaths, errLogToConsole: true}))
    .pipe(autoprefixer({browsers: ['Chrome >= 34', 'iOS 8', 'last 2 versions'], cascade: false}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.output));
});

taskMaker.defineTask('clean', {taskName: 'clean', src: path.output, taskDeps: ['clean-e2e']});
taskMaker.defineTask('clean', {taskName: 'clean-e2e', src: path.e2eOutput});
taskMaker.defineTask('less', {taskName: 'less', src: path.less, dest: path.output});
taskMaker.defineTask('less', {taskName: 'less-themes', src: path.themes, dest: path.themesOutput});
taskMaker.defineTask('babel', {taskName: 'babel', src: [path.source, path.react], dest: path.output, ngAnnotate: true, compilerOptions: babelCompilerOptions});
taskMaker.defineTask('babel', {taskName: 'babel-e2e', src: path.e2e, dest: path.e2eOutput, compilerOptions: {externalHelpers: false}, taskDeps: ['clean-e2e']});
taskMaker.defineTask('ngHtml2Js', {taskName: 'html', src: path.templates, dest: path.tstemplatesout, compilerOptions: babelCompilerOptions, ngHtml2Js: { extension: '.ts'}});
taskMaker.defineTask('copy', {taskName: 'js', src: path.source, dest: path.output, changed: {extension: '.js'}});
taskMaker.defineTask('copy', {taskName: 'systemConfig', src: path.systemConfig, dest: path.output});
taskMaker.defineTask('copy', {taskName: 'assets', src: path.assets, dest: path.output});
taskMaker.defineTask('copy', {taskName: 'json', src: path.json, dest: path.output, changed: {extension: '.json'}});
taskMaker.defineTask('copy', {taskName: 'index.html', src: path.index, dest: path.output, rename: 'index.html'});
taskMaker.defineTask('copy', {taskName: 'cache-bust-index.html', src: path.index, dest: path.output, rename: 'index.html', replace: cacheBustConfig});
taskMaker.defineTask('copy', {taskName: 'packages', src: path.packages, dest: path.packagesOutput});
taskMaker.defineTask('htmlMinify', {taskName: 'htmlMinify-index.html', taskDeps: ['cache-bust-index.html'], src: path.indexHtmlOutput, dest: path.output});
taskMaker.defineTask('watch', {taskName: 'watch', src: path.watch, tasks: ['compile', 'lint', 'index.html']});
taskMaker.defineTask('jshint', {taskName: 'lint', src: path.source});
taskMaker.defineTask('karma', {taskName: 'karma', configFile: path.karmaConfig});
taskMaker.defineTask('browserSync', {taskName: 'serve', config: serverOptions, historyApiFallback: true});

gulp.task('compile', function(callback) {
	return runSequence('templatesgen', ['less', 'sass', 'scss', 'less-themes', 'translations', 'babel', 'json', 'assets'], callback);
});

gulp.task('templatesgen', function(callback) {
	return runSequence('html', 'tstemplates', callback);
})

gulp.task('recompile', function(callback) {
	return runSequence('clean', ['compile'], callback);
});

gulp.task('test', function(callback) {
	return runSequence('recompile', 'karma', callback);
});

gulp.task('run', function(callback) {
	if (situation.isProduction()) {
		return runSequence('recompile', 'cache-bust-index.html', 'htmlMinify-index.html', 'minify', 'serve', callback);
	} else if (situation.isDevelopment()) {
		return runSequence('recompile', 'lint', 'index.html', 'serve', 'watch', callback);
	}
});

gulp.task('default', ['run']);
