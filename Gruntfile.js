'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    if (grunt.option('region') === undefined) {
        grunt.option('region', 'us-west-2');
    }

    if (grunt.option('account-id') === undefined) {
        return grunt.fail.fatal('--account-id is required', 1);
    }

    grunt.initConfig({
        lambda_invoke: {
            default: {
                package: 'oauth2-custom-authorizer',
                options: {
                    file_name: './dist/handler.js',
                    handler: 'handler',
                    event: './test/event.json',
                },
            }
        },
        lambda_deploy: {
            default: {
                package: 'oauth2-custom-authorizer',
                options: {
                    file_name: './dist/handler.js',
                    handler: 'handler',
                },
                arn: 'arn:aws:lambda:' + grunt.option('region') + ':' + grunt.option('account-id') +
                    ':function:oauth2-custom-authorizer',
            },
        },
        lambda_package: {
            default: {
                package: 'oauth2-custom-authorizer',
            },
        },
        env: {
            prod: {
                NODE_ENV: 'production',
            },
        },

    });

    grunt.registerTask('deploy', ['env:prod', 'lambda_package', 'lambda_deploy']);
    grunt.registerTask('test', ['lambda_invoke']);
};