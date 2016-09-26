import IConfig from './core/IConfig'
import {AjaxRequest} from './core/IAjax'

export interface IDependencyContainer {
	jQ: JQueryStatic
	config: IConfig
	openInTab: (url: string) => void
	execOnPixiv: <T> (func:(pixiv:any, props:T)=>any, props?:T) => Promise<any>
	ajaxCall: <T, V> (req: AjaxRequest<T>) => Promise<V>
	getSetting: (settingKey: string) => Promise<boolean>
	isPageBookmarked: (url:string) => Promise<boolean>
	download: (url:string, filename:string) => Promise<boolean>
}

export var Container: IDependencyContainer = {
	jQ: undefined,
	config: undefined,
	openInTab: undefined,
	execOnPixiv: undefined,
	ajaxCall: undefined,
	getSetting: undefined,
	isPageBookmarked: undefined,
	download: undefined,
}

export function load(deps:IDependencyContainer) {
	Container = deps;
}
