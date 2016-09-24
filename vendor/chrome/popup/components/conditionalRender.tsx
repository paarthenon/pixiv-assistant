import * as React from 'react'
import * as log4js from 'log4js'

/**
 * Wrapper component that evaluates a predicate to judge whether or not to render.
 */

interface ConditionalRenderProps {
	predicate: () => boolean | Promise<boolean>
	default?: boolean
}
export class ConditionalRender extends React.Component<ConditionalRenderProps, {render:boolean}> {
	state = {render: this.props.default}

	componentDidMount() {
		Promise.resolve(this.props.predicate()).then(render => this.setState({render}));
	}

	public render() {
		return (this.state.render)? <div>{this.props.children}</div> : null
	}
}