import * as React from 'react'

import Mailman from '../mailman'

export class ConfigPanel extends React.Component<any,{items: {key:string, value:string}[]}> {
	protected style = {
		width: '700px',
		height: '500px',
		background: '#eeee',
		zIndex: 100
	};

	constructor() {
		super();
		this.state = { items: [] };
		// Mailman.listConfig()
		// 	.then(configKeys => Promise.all<{key:string;value:string}>(configKeys.map(key =>
		// 		Mailman.getConfig({ key })
		// 			.then(resp => resp.value.toString())
		// 			.then(value => ({ key, value }))
		// 	)))
		// 	.then(entries => {
		// 		console.log(entries);
		// 		this.setState({ items: entries })
		// 	});
		Mailman.ContentScript.getActions()
			.then(actionMsg => {
				this.setState( { items: actionMsg.actions.map(action => ({key:action.id, value: action.icon}))});
			})
			.catch(error => console.log(error));

	}
	public render() {
		return (
			<div style={this.style}>
				<p> Config keys: {this.state.items.length}</p>
				{this.state.items.map(item => <ConfigEntry key={item.key} configKey={item.key} configValue={item.value} />)}
			</div>
			);
	}
}

export class ConfigEntry extends React.Component<{configKey:string, configValue:string}, void> {
	public render() {
		return <div>
				<span>{this.props.configKey}|</span>
				<span>{this.props.configValue.toString()}</span>
			</div>;
	}
}
