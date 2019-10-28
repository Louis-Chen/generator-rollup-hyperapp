import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { uglify } from 'rollup-plugin-uglify'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import postcss from 'rollup-plugin-postcss'
const prod = !process.env.ROLLUP_WATCH
const dev = !!process.env.ROLLUP_WATCH

export default {
	input: 'src/app.js',
	output: {
    name:'bundle.js',
		file: 'public/bundle.js',
		sourcemap: dev ? 'inline' : false,
		format: 'iife'
	},
	plugins: [
		resolve({ jsnext: true, browser: true }),
		commonjs({
			exclude: 'src/**'
    }),
    postcss({
			plugins: [],
			minimize: true,
			sourceMap: 'inline'
		}),
		babel({
			exclude: 'node_modules/**',
			presets: [
				[
					'@babel/preset-env',
					{
						targets: {
							node: 'current'
						}
					}
				]
			],
			plugins: [
				[
					'@babel/plugin-transform-react-jsx',
					{
						pragma: 'h',
						pragmaFrag: 'Fragment',
						useBuiltIns: true,
						throwIfNamespace: false
					}
				]
			]
		}),
		prod && uglify(),
		dev && livereload(),
		dev &&
			serve({
				contentBase: ['public'],
				historyApiFallback: true,
				port: 3000,
				open:true
			})
	]
}
