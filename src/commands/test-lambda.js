/*global module, require*/
var Promise = require('bluebird'),
	path = require('path'),
	readjson = require('../util/readjson'),
	shell = require('shelljs'),
	aws = require('aws-sdk');
module.exports = function testLambda(options) {
	'use strict';
	if (!shell.test('-e', path.join(options.source, 'claudia.json'))) {
		return Promise.reject('claudia.json does not exist in the source folder');
	}
	return readjson(path.join(options.source, 'claudia.json')).then(function (config) {
		var name = config && config.lambda && config.lambda.name,
			region = config && config.lambda && config.lambda.region;
		if (!name) {
			return Promise.reject('invalid configuration -- lambda.name missing from claudia.json');
		}
		if (!region) {
			return Promise.reject('invalid configuration -- lambda.region missing from claudia.json');
		}
		return Promise.resolve(config.lambda);
	}).then(function (lambdaConfig) {
		var lambda = new aws.Lambda({region: lambdaConfig.region}),
			invokeLambda = Promise.promisify(lambda.invoke.bind(lambda));
		return invokeLambda({FunctionName: lambdaConfig.name});
	});
};
