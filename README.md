# kickstart

A starter template for web projects that I kept recreating manually every time so I figured I might as well make a prepared version.

### Features

* [Gulp](https://gulpjs.com/) for building/processing.
* [TypeScript](https://typescriptlang.org/) with [JSX](https://reactjs.org/docs/introducing-jsx.html), but without React (although you can add it back trivially if you want).
	* It uses a custom JSX handler function instead, so you don't have to include all of React just to use JSX.
* [Stylus](https://stylus-lang.com/) CSS preprocessor
* [Eta](https://eta.js.org/) HTML templates, set up for both build-time and client-side runtime use.
	* Put templates in `/web/templates`. You can include them at build time by referencing them from HTML files in `/web/static` using `<%~ include("mypartial", { options... }) %>`.
	* Templates are collected into `templates.js` and accessible at runtime under the global variable `TEMPLATES`. You can use `Eta.render` to render out an HTML string or use the global `renderTemplate` helper function to get HTML elements directly.
* [wasm-pack](https://github.com/rustwasm/wasm-pack) for including native [Rust](https://www.rust-lang.org/) code in the form of a WebAssembly module
	* Install Rust and wasm-pack and make sure they're available in your PATH. Then use `yarn gulp buildNative` to compile and package the module.
	* The module is initialized at page load with `await wasm_bindgen("/js/native_bg.wasm")`, then `new App()` launches the entry point for the rest of the stuff.
	* Everywhere else, `wasm_bindgen` is a global object that includes all of the functions defined in the Rust code.

### Building

* Use [yarn](https://yarnpkg.com/) to install the prerequisites: `yarn install`.
* Since yarn 2.0 no longer supports global packages, you have to run gulp using `yarn gulp`. Not a big deal, but kind of annoying.
* `yarn gulp` will build the TypeScript, Stylus and Eta templates, copy over the static files, and build the Rust module.
* `yarn gulp watch` will do everything the default task does, and then watches the TS and Stylus files, templates, and static files, running the appropriate tasks when something changes.
	* `watch` doesn't watch the rust code because recompiling after every save probably wouldn't be great. Run `yarn gulp buildNative` to compile the module after making changes, or set up a shell script or build command in your IDE of choice to run `wasm-pack build --target no-modules` in the crate root (`/native`) and then copy `/native/pkg/native.js` and `native_bg.wasm` to `/build/js`.
* The single tasks are `buildTS`, `buildStyles`, `buildNative`, `copyStatic`, `compileTemplates`, `watchTS`, `watchStyles`, `watchStatic`, and `watchTemplates`.