declare namespace Eta {
	export type trimConfig = "nl" | "slurp" | false
	export type TagType = "r" | "e" | "i" | ""
	export type AstObject = string | TemplateObject
	export type TemplateFunction = (data: object, config: EtaConfig, cb?: CallbackFn) => string
	export type CallbackFn = (err: Error | null, str?: undefined | string) => void

	export class Cacher<T> {
		constructor(cache: Record<string, T>)
	}

	export interface EtaConfig {
		/** Whether or not to automatically XML-escape interpolations. Default true */
		autoEscape: boolean

		/** Configure automatic whitespace trimming. Default `[false, 'nl']` */
		autoTrim: trimConfig | [trimConfig, trimConfig]

		/** Compile to async function */
		async: boolean

		/** Whether or not to cache templates if `name` or `filename` is passed */
		cache: boolean

		/** XML-escaping function */
		e: (str: string) => string

		/** Parsing options */
		parse: {
			/** Which prefix to use for evaluation. Default `""` */
			exec: string

			/** Which prefix to use for interpolation. Default `"="` */
			interpolate: string

			/** Which prefix to use for raw interpolation. Default `"~"` */
			raw: string
		}

		/** Array of plugins */
		plugins: Array<{ processFnString?: Function; processAST?: Function; processTemplate?: Function }>

		/** Remove all safe-to-remove whitespace */
		rmWhitespace: boolean

		/** Delimiters: by default `['<%', '%>']` */
		tags: [string, string]

		/** Holds template cache */
		templates: Cacher<TemplateFunction>

		/** Name of the data object. Default `it` */
		varName: string

		/** Absolute path to template file */
		filename?: string

		/** Holds cache of resolved filepaths. Set to `false` to disable */
		filepathCache?: Record<string, string> | false

		/** Function to include templates by name */
		include?: Function

		/** Function to include templates by filepath */
		includeFile?: Function

		/** Name of template */
		name?: string

		/** Where should absolute paths begin? Default '/' */
		root?: string

		/** Make data available on the global object instead of varName */
		useWith?: boolean

		/** Whether or not to cache templates if `name` or `filename` is passed: duplicate of `cache` */
		'view cache'?: boolean

		/** Directory or directories that contain templates */
		views?: string | Array<string>

		[index: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	export interface TemplateObject {
		t: TagType;
		val: string;
	}

	export interface DataObj {
		/** Express.js settings may be stored here */
		settings?: {
			[key: string]: any
		}
		[key: string]: any
	}

	export function compile(str: string, config?: Partial<EtaConfig>): TemplateFunction
	export function compileToString(str: string, config: EtaConfig): string
	export function configure(options: Partial<EtaConfig>): Partial<EtaConfig>
	export function getConfig(e, n): EtaConfig
	export function parse(str: string, config: EtaConfig): Array<AstObject>
	export function render(template: string | TemplateFunction, data: object, config?: Partial<EtaConfig>, cb?: CallbackFn): string | Promise<string> | void
    export function renderFile(filename: string, data: DataObj, config?: Partial<EtaConfig>, cb?: CallbackFn): any
    export function renderFile(filename: string, data: DataObj, cb?: CallbackFn): any
	export function renderAsync(template: string | TemplateFunction, data: object, config?: Partial<EtaConfig>, cb?: CallbackFn): string | Promise<string> | void

	export const config: EtaConfig
	export const defaultConfig: EtaConfig
	export const templates: any
}
