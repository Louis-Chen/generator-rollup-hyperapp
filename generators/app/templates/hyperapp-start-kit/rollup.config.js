import babel from 'rollup-plugin-babel'
import builtins from 'rollup-plugin-node-builtins'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { uglify } from 'rollup-plugin-uglify'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import postcss from 'rollup-plugin-postcss'
import url from 'postcss-url'

export default {
	input: 'src/app.js',
	output: {
		name: 'bundle.js',
		file: 'public/bundle.js',
		sourcemap: 'inline',
		format: 'umd'
	},
	plugins: [
		resolve(),
		commonjs({
			exclude: 'src/**',
			include: ['node_modules/**']
		}),
		postcss({
			plugins: [
				url({
					url: 'inline'
				})
			],
			minimize: true,
			sourceMap: 'inline'
		}),
		babel({
			exclude: 'node_modules/**',
			extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
			presets: [['@babel/preset-env']],
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
		builtins(),
		uglify(),
		livereload(),
		serve({
			contentBase: ['public'],
			historyApiFallback: true,
			port: 3000,
			open: true
		})
	]
}
