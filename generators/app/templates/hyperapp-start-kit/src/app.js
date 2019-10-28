import { h, app } from 'hyperapp'

import './app.scss'
const actions = {
	down: value => state => ({ count: state.count - value })
}

const state = {
	count: 0
}

const view = (state, actions) => {
	return (
		<div>
			<div className="app">test scss</div>
			<h1>{state.count}</h1>
			<button onclick={() => actions.down(1)}>-</button>
		</div>
	)
}
export const main = app(state, actions, view, document.getElementById('root'))
