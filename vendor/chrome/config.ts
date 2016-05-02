import IConfig from '../../src/IConfig'
import * as Q from 'q'

type potentialData = boolean|string|number|Object

interface configValue {
	data: potentialData
}

function safeResolve<T>(q:Q.Deferred<T>, value: T) {
	if (!chrome.runtime.lastError) {
		q.resolve(value);
	} else {
		q.reject(chrome.runtime.lastError.message);
	}
}

export default class Config implements IConfig {
	public keys():Q.IPromise<string[]> {
		let q = Q.defer<string[]>();
		chrome.storage.local.get(null, contents => safeResolve(q, Object.keys(contents)));
		return q.promise;
	}

	public get(key:string):Q.IPromise<potentialData> {
		let q = Q.defer<potentialData>();
		chrome.storage.local.get(key, contents => safeResolve(q, JSON.parse(contents[key]).data));
		return q.promise;
	}

	public set(key:string, value:potentialData) {
		let q = Q.defer<void>();
		chrome.storage.local.set({ [key]: value }, () => safeResolve(q, undefined));
		return q.promise;
	}
}