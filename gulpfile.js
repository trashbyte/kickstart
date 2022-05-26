const fs = require('fs')
const gulp = require('gulp')
const glob = require('glob')
const sourcemaps = require('gulp-sourcemaps')
const source = require('vinyl-source-stream')
const stylus = require('gulp-stylus')
const tap = require('gulp-tap')
const browserify = require('browserify')
const babelify = require('babelify')
const tsify = require('tsify')
const spawn = require('child_process').spawn
const Eta = require('eta')
const filter = require('gulp-filter')


const OUTPUT_DIR = "./build"


function _compile_templates_internal() {
    let templateText = {}
    for (let file of glob.sync("web/templates/**/*.@(html|template|eta)")) {
        let text = fs.readFileSync(file, { encoding: "utf8" }).replaceAll("`","\\`")
        let templateNameSegments = file.substr(14).split(".")
        templateNameSegments.pop()
        let templateName = templateNameSegments.join(".")
        templateText[templateName] = text
    }
    return templateText
}


const tsconfig = {
    "isTSX": true,
    "jsxPragma": "jsxHandler",
    "jsxPragmaFrag": "'fragment'",
    "jsx": "preserve",
    "target": "ES6",
    "sourceMap": true,
    "alwaysStrict": true,
    "noImplicitThis": true,
    "strictBindCallApply": true,
    "strictFunctionTypes": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "typeRoots": ["web/node_modules/@types", "build/native"],
    "lib": ["ES2018", "ES2020", "ES2021", "DOM"]
}

function buildTS() {
    return browserify({
        debug: true,
        entries: glob.sync('web/src/**/*.@(ts|tsx)').concat('native/pkg/native.d.ts'),
        cache: {},
        packageCache: {},
    })
    .plugin(tsify, tsconfig)
    .transform("babelify", {
        presets: ["@babel/preset-env"],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        plugins: [['transform-react-jsx', { "pragma": "jsxHandler", "pragmaFrag": "'fragment'" }]]
    })
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(gulp.dest(OUTPUT_DIR+"/js"))
}
exports.buildTS = buildTS
function watchTS() { gulp.watch('web/src/**/*.@(ts|tsx)', buildTS) }
exports.watchTS = watchTS


function copyStatic() {
    let templateText = _compile_templates_internal()
    for (let key of Object.keys(templateText)) {
        Eta.templates.define(key, Eta.compile(templateText[key]))
    }
    let data = fs.readFileSync("web/template-data.json", { encoding: "utf8" })

    const f = filter(['**/*.@(html|template|eta)'], {restore: true});
    return gulp.src('web/static/**/*', {base: 'web/static/'})
        .pipe(f)
        .pipe(tap((file) => {
            file.contents = Buffer.from(Eta.render(file.contents.toString(), JSON.parse(data)).replaceAll("\\`", "`"), "utf8")
        }))
        .pipe(f.restore)
        .pipe(gulp.dest(OUTPUT_DIR))
}
exports.copyStatic = copyStatic
function watchStatic() { gulp.watch('web/static/**/*', copyStatic) }
exports.watchStatic = watchStatic


function compileTemplates() {
    let output = ""
    let templateText = _compile_templates_internal()
    for (let key of Object.keys(templateText)) {
        output += `"${key}": \`${templateText[key]}\`\n`
    }
    fs.writeFileSync(OUTPUT_DIR + "/js/templates.js", "const TEMPLATES = {\n" + output + "}\nwindow.addEventListener('load', () => {\n    for (let key of Object.keys(TEMPLATES)) {\n        Eta.templates.define(key, Eta.compile(TEMPLATES[key]))\n    }\n})")
    for (let file of glob.sync("web/templates/**/*.@(html|template|eta)")) {
        let text = fs.readFileSync(file, { encoding: "utf8" }).replaceAll("`","\\`")
        let templateNameSegments = file.substr(14).split(".")
        templateNameSegments.pop()
        let templateName = templateNameSegments.join(".")

        output += `"${templateName}": \`${text}\`\n`

        Eta.templates.define(templateName, Eta.compile(text))
    }
    return Promise.resolve()
}
exports.compileTemplates = compileTemplates
function watchTemplates() { gulp.watch('web/templates/**/*', copyStatic) }
exports.watchTemplates = watchTemplates


function buildStyles() {
    return gulp.src('web/styles/**/*.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({ compress: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(OUTPUT_DIR+'/css'))
}
exports.buildStyles = buildStyles
function watchStyles() { gulp.watch('web/styles/**/*.styl', buildStyles) }
exports.watchStyles = watchStyles


function buildNative() {
    return new Promise((resolve, reject) => {
        let build = spawn('wasm-pack', ['build', '--target', 'no-modules'], { cwd: './native' })

        build.stdout.on('data', data => process.stdout.write(data.toString()))
        build.stderr.on('data', data => process.stderr.write(data.toString()))
        build.on('exit', function (code) {
            console.log('wasm-pack exited with code ' + code.toString());
            if (code !== 0) {
                reject("wasm-pack build failed")
            }
            else {
                for (let file of ['native.js', 'native_bg.wasm']) {
                    console.log(`copying /native/pkg/${file} -> /build/js/${file}`)
                    fs.copyFileSync(`native/pkg/${file}`, `build/js/${file}`)
                }
                resolve()
            }
        })
    })
    
}
exports.buildNative = buildNative


exports.default = gulp.series(copyStatic, buildStyles, compileTemplates, buildNative, buildTS)
exports.watch = gulp.series(exports.default, gulp.parallel(watchStyles, watchStatic, watchTS, watchTemplates))
