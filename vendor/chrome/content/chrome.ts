import {AjaxRequest} from 'src/core/IAjax'

import * as Msg from 'vendor/chrome/messages'
import Config from 'vendor/chrome/config'
import {default as Mailman, defineImplementation} from 'vendor/chrome/mailman'
import {ExecBroker} from 'vendor/chrome/execBroker'
import {getSetting} from 'vendor/chrome/userSettings'

import * as Dependencies from 'src/deps'

let broker = new ExecBroker();

let deps: Dependencies.IDependencyContainer = {
	config: new Config(),
	openInTab: (url: string) => Mailman.Background.newTab({url}),
	execOnPixiv: (func:(pixiv:any, props:any) => any, props?:any) => broker.queueExecution(func, props),
	ajaxCall: (req: AjaxRequest<any>) => Mailman.Background.ajax(req),
	getSetting,
	isPageBookmarked: url => Mailman.Background.isPageBookmarked({url}),
	download: (url, filename) => Mailman.Background.download({url, filename}),
}

Dependencies.load(deps);

import {dispatch} from 'src/dispatch'
let page = dispatch(document.location.href);

defineImplementation<Msg.ContentScriptProtocol>("CONTENT_SCRIPT", {
	getActions: () => Promise.resolve({actions: page.actionCache}),
	getName: () => Promise.resolve(page.constructor.name),
	performAction: msg => {
		let item = page.actionCache.find(action => action.id == msg.actionId);
		if (item) {
			item.execute.call(page);
			return Promise.resolve();
		} else {
			return Promise.reject("Action not found");
		}
	}
});

