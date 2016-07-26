import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as log4js from 'log4js'

import {MainPanel} from './mainPanel'
import {ConfigPanel} from './configPanel'
import {Tabs} from './tabs'
import {DictViewer} from './dict'
import {ReadOnlyDictViewer} from './readOnlyDict'
import {ActionPanel} from './actionPanel'
// import {SettingsPanel} from './settingsPanel'

import configKeys from '../../../src/configKeys'

let logger = log4js.getLogger('Bootstrap');

let official_dict :any = {};

class DictContainer extends React.Component<{dictKey:string},{dict: { [id:string]:string }}> {
	constructor(props:{dictKey:string}) {
		super(props);
		this.state = { dict: {} };
		this.updateDict();
	}
	updateDict() :void {
		Mailman.Background.getConfig({ key: this.props.dictKey})
			.then(response => {
				this.setState({dict: response.value as { [id:string]:string }});
			})
			.catch(error => logger.error(error));
	}

	handleUpdate(key:string, value:string) :void {
		console.log('test');
		this.state.dict[key] = value;
		Mailman.Background.setConfig({key: this.props.dictKey, value: this.state.dict})
			.then(() => this.updateDict());
	}
	handleDelete(key:string) {
		console.log('test1');
		delete this.state.dict[key];
		Mailman.Background.setConfig({key: this.props.dictKey, value: this.state.dict})
			.then(() => this.updateDict());
	}
	public render() {
		return <DictViewer
			dict={this.state.dict}
			onAdd={this.handleUpdate.bind(this)}
			onUpdate={this.handleUpdate.bind(this)}
			onDelete={this.handleDelete.bind(this)}
			/>
	}
}

import Mailman from '../mailman'
Mailman.Background.getConfig({ key: configKeys.official_dict })
	.then(dict => { official_dict = dict.value; render(); });

function render() {
	let tabInfo: { [id: string]: JSX.Element } = {
		actions: <ActionPanel />,
		config: <ConfigPanel />,
		dictionary: <DictContainer dictKey={configKeys.user_dict} />,
		officialDict: <ReadOnlyDictViewer dict={official_dict}/>
		// settings: <SettingsPanel />
	}

	ReactDOM.render(<Tabs tabs={tabInfo} initialTab="actions" />, document.getElementById('content'));
}

render();

