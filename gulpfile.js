'use strict';

var gulp = require('gulp');
var fs = require('fs');
var exec = require('child_process').exec;
var babel = require('gulp-babel');
var jspm = require('jspm');
var less = require('gulp-less');

function consoleCommand(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, function(error, stdout, stderr){
			if (error) {
				reject(stderr);
			} else {
				resolve();
			}
		});
	});
}
gulp.task('build', function(callback){
    consoleCommand('tsc');
});

gulp.task('es5', ['build'], function() {
	return gulp.src('build/es6/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('build/es5'));
})

let builder = new jspm.Builder();
builder.config({
	paths: { '*': 'build/es5/*' }
});

function bundleDev(source, output) {
	let bundleSettings = {
		minify: false,
	}
	return builder.buildStatic(source, output, bundleSettings);
}

function bundleRelease(source, output) {
	let bundleSettings = {
		minify: true,
		mangle: false, // terribleCache is truly terrible and uses constructor function names, which can't work if mangled
		uglify: {beautify: {ascii_only: true}}, // diacritics needs to faithfully store the unicode string map.
	}
	return builder.buildStatic(source, output, bundleSettings);
}

function bundleEntryPoint(props, release) {
	if (release) {
		return bundleRelease(props.source, props.merged)
			.then(() => fileCopy(props.merged, props.dest));
	} else {
		return bundleDev(props.source, props.merged)
			.then(() => fileCopy(props.merged, props.dest));
	}
}

function fileCopy(src, dst) {
	return new Promise(resolve => gulp.src(src)
		.pipe(gulp.dest(dst))
		.on('end', resolve))
}

const popupProps = {
	source: 'vendor/chrome/popup/bootstrap',
	merged: 'build/merged/popup.min.js',
	dest: 'dist/chrome/vendor/chrome/popup',
}
const backgroundProps = {
	source: 'vendor/chrome/background/main',
	merged: 'build/merged/background.min.js',
	dest: 'dist/chrome/vendor/chrome/',
}
const contentProps = {
	source: 'vendor/chrome/content/chrome',
	merged: 'build/merged/content.min.js',
	dest: 'dist/chrome/vendor/chrome/',
}
const optionsProps = {
	source: 'vendor/chrome/options/options',
	merged: 'build/merged/options.min.js',
	dest: 'dist/chrome/vendor/chrome/options',
}

gulp.task('bundle-popup', ['es5'], () => bundleEntryPoint(popupProps));
gulp.task('bundle-background', ['es5'], () => bundleEntryPoint(backgroundProps));
gulp.task('bundle-content', ['es5'], () => bundleEntryPoint(contentProps));
gulp.task('bundle-options', ['es5'], () => bundleEntryPoint(optionsProps));

gulp.task('bundle-popup-release', ['es5'], () => bundleEntryPoint(popupProps, true));
gulp.task('bundle-background-release', ['es5'], () => bundleEntryPoint(backgroundProps, true));
gulp.task('bundle-content-release', ['es5'], () => bundleEntryPoint(contentProps, true));
gulp.task('bundle-options-release', ['es5'], () => bundleEntryPoint(optionsProps, true));

function buildLESS(src, dest) {
	return gulp.src(src)
		.pipe(less({
			paths: [
				'.',
				'./node_modules/bootstrap-less'
			]
		}))
		.pipe(gulp.dest(dest));
}

gulp.task('build-less-popup', () => buildLESS('res/less/popup.less', 'build/css'));
gulp.task('build-less-content', () =>  buildLESS('res/less/content.less', 'build/css'));

gulp.task('build-less',['build-less-popup', 'build-less-content']);

gulp.task('chrome-resources', ['es5'], function(){
	return Promise.all([
		fileCopy('vendor/chrome/**/*.html', 'dist/chrome/vendor/chrome'),
		fileCopy('vendor/chrome/resources/**/*', 'dist/chrome/resources'),
		fileCopy('vendor/chrome/manifest.json', 'dist/chrome'),
		fileCopy('config.js', 'dist/chrome'),
	]);
});

gulp.task('chrome-css', ['build-less'], () => {
	return fileCopy('build/css/**/*.css', 'dist/chrome/css');
})

gulp.task('chrome-fonts', () => {
	return fileCopy('res/fonts/**/*', 'dist/chrome/fonts');
})

gulp.task('dev', [
	'chrome-resources',
	'bundle-popup',
	'bundle-background',
	'bundle-content',
	'bundle-options',
	'chrome-css',
	'chrome-fonts',
]);

gulp.task('release', [
	'chrome-resources',
	'bundle-popup-release',
	'bundle-background-release',
	'bundle-content-release',
	'bundle-options-release',
	'chrome-css',
	'chrome-fonts',
]);

gulp.task('default', ['dev']);
