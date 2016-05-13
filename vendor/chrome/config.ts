import IConfig from '../../src/IConfig'
import Mailman from './mailman'
import * as Msg from './messages'

import * as log4js from 'log4js'

type potentialData = boolean|string|number|Object

interface configValue {
	data: potentialData
}

let logger = log4js.getLogger('Config');

function handleError<T>(value: T) {
	return new Promise((resolve, reject) => {
		if (!chrome.runtime.lastError) {
			resolve(value);
		} else {
			reject(chrome.runtime.lastError.message);
		}
	});
}
export default class ContentConfig implements IConfig {
	public keys(): Promise<string[]> {
		return new Promise(resolve => {
			chrome.storage.local.get(null, contents => resolve(handleError(Object.keys(contents))));
		});
	}

	public get(key: string): Promise<potentialData> {
		logger.error('getttting', key);
		return Mailman.send<Msg.ConfigGetMessage, Msg.ConfigGetResponse>
			(new Msg.ConfigGetMessage({ key }))
			.then(msg => {
				logger.fatal('msssssssg', msg); 
				return msg.data.value;
			})
			.catch(error => {
				logger.fatal('mssssssgerror', error);
			})
	}

	public set(key: string, value: potentialData) {
		return Mailman.send<Msg.ConfigSetMessage, Msg.ConfigSetResponse>
			(new Msg.ConfigSetMessage({ key, value }))
			.then(msg => {
				if (!msg.data) {
					return Promise.reject(undefined)
				}else{
					return Promise.resolve();
				}
			});
	}
}

// export default class BackgroundConfig implements IConfig {
// 	public keys():Promise<string[]> {
// 		return new Promise(resolve => {
// 			chrome.storage.local.get(null, contents => resolve(handleError(Object.keys(contents))));
// 		});
// 	}

// 	public get(key:string):Promise<potentialData> {
// 		return new Promise(resolve => 
// 			chrome.storage.local.get(key, contents => resolve(handleError(JSON.parse(contents[key]).data)))
// 		);
// 	}

// 	public set(key:string, value:potentialData) {
// 		return new Promise<void>(resolve => 
// 			chrome.storage.local.set({ [key]: value }, () => resolve(
// 				handleError(undefined).then(()=>Promise.resolve())) // necessary to return Promise<void>
// 			)
// 		);
// 	}
// }
