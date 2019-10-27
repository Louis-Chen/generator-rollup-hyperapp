'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const mkdirp = require('mkdirp')

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts)
		this.tmpDir = 'hyper-start-kit'
		this.name = ''
	}

	prompting() {
		this.log(yosay(`Welcome to the divine ${chalk.red('generator-hyper-kit')} generator!`))

		const prompts = [
			{
				type: 'input',
				name: 'projectName',
				message: 'Your project name',
				default: 'hyper-rollup'
			}
		]

		this.log(this.appname.replace(/\s+/g, '-') + ' is getting generated..!')

		return this.prompt(prompts).then(props => {
			this.props = props
			this.name = props.projectName.replace(/\s+/g, '-')
		})
	}

	writing() {
		this.fs.copy(this.templatePath(this.tmpDir + '/'), this.destinationPath(this.destinationRoot(this.name)), {
			globOptions: { dot: true }
		})

		this.fs.copyTpl(this.templatePath(this.tmpDir + '/_package.json'), this.destinationPath('package.json'), {
			name: this.props.projectName.replace(/\s+/g, '-')
		})

		this.fs.copy(this.templatePath(this.tmpDir + '/_gitignore'), this.destinationPath('.gitignore'))

		this.removeFiles()
	}

	removeFiles() {
		this.fs.delete(this.destinationRoot() + '/_package.json')
		this.fs.delete(this.destinationRoot() + '/_gitignore')
	}

	install() {
		this.installDependencies({
			bower: false
		})
	}
}
