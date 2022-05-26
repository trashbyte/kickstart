declare global {
  function jsxHandler(tagName: string, attrs: any, ...children: any[]): any
  function renderTemplate(name: string, options: any): Array<Node>
}
declare interface Window {
  jsxHandler: (tagName: string, attrs: any, ...children: any[]) => any
  renderTemplate: (name: string, options: any) => Array<Node>
}


export class Ok<V> {
    value: V
    constructor(value: V) { this.value = value }
    unwrap() { return this.value }
}
export class Err<E> {
    error: E
    constructor(error: E) { this.error = error }
    unwrap() { throw this.error }
}
export type Result<V,E> = Ok<V> | Err<E>


export const SVGNS = "http://www.w3.org/2000/svg"
export const SVG_TAGS = [
  "animate", "animateMotion", "animateTransform", "circle", "clipPath", "defs", "desc", "discard", "ellipse", "feBlend", "feColorMatrix",
  "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow",
  "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset",
  "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "foreignObject", "g", "hatch", "hatchpath",
  "image", "line", "marker", "mask", "mesh", "meshgradient", "meshpatch", "meshrow", "metadata", "path", "pattern", "polygon",
  "radialGradient", "rect", "set", "stop", "svg", "switch", "symbol", "text", "textPath", "title", "tspan", "use", "view"
]

function jsxHandler(tagName: string, attrs: any = {}, ...children: any[]): any {
  if (tagName.toLowerCase() === 'fragment') { return children }
  let isSVG = SVG_TAGS.includes(tagName.toLowerCase())
  let elem = (isSVG ?
    document.createElementNS(SVGNS, tagName) :
    document.createElement(tagName))
  for (let attrKey in attrs) {
    if (!attrs.hasOwnProperty(attrKey)) { continue }
    if (attrKey === "class") {
      elem.classList.add(attrs[attrKey])
    }
    else {
      elem.setAttribute(attrKey, attrs[attrKey])
    }
  }
  for (const child of children) {
    if (Array.isArray(child)) { elem.append(...child) }
    else if (typeof child === "string") { elem.innerHTML += child }
    else { elem.append(child) }
  }
  return elem
}
window.jsxHandler = jsxHandler

declare const TEMPLATES: any;
function renderTemplate(name: string, options: any): Array<Node> {
  if (!Object.keys(TEMPLATES).includes(name)) {
    throw new Error(`Template '${name}' not found`)
  }
  return Array.from((new DOMParser()).parseFromString(Eta.render(TEMPLATES[name], options) as string, "text/html").body.childNodes)
}
window.renderTemplate = renderTemplate
