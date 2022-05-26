class App {
  constructor() {
  }
}

window.addEventListener("load", () => {
    (async () => {
        await wasm_bindgen("/js/native_bg.wasm") // absolute path
        new App()
    })()
}, false)
