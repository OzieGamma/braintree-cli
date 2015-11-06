#!/usr/bin/env node

'use strict';

var cli = require('commander');

var userConfig = require('./user_config.js');
var wrapper = require('./wrapper.js');
var pkg = require('./package.json');


/* Set the version number */
cli.version(pkg.version, '-v, --version');

/* set-account */
cli.command('set-account <public key> <private key>')
    .option('--production', 'Run against the production API')
    .description('Defines what account to use to access the braintree API')
    .action(function(publicKey, privateKey, options) {
        var environment;
        if (options.production) {
            console.log('\n\n------------------------------------------');
            console.log('WARNING: This software is in alpha and untested.');
            console.log('WARNING: Use it against your production systems at your own risk !!!');
            console.log('------------------------------------------\n\n');

            environment = 'production';
        } else {
            environment = 'sandbox';
        }

        // TODO: figure out how to do this more properly
        userConfig.data = {
            "environment": environment,
            "publicKey": publicKey,
            "privateKey": privateKey,
            "merchants": []
        };

        userConfig.save();
    });

/* add-merchant */
cli.command('add-merchant <merchant id>')
    .description('Adds a merchant to the account')
    .action(function(merchantId) {
        userConfig.load();
        userConfig.data.merchants.push(merchantId);
        userConfig.save();
    });

/* summary */
cli.command('summary')
    .option('-h, --hour', 'Display on hourly basis')
    .option('-d, --day', 'Display on daily basis')
    .option('-m, --month', 'Display on monthly basis')
    .description('Shows a summary for the last transactions')
    .action(function(options) {
        userConfig.load();

        if (options.hour) {
            wrapper.showTransactionSummary(userConfig.data, 'hour');
        }
        if (options.day) {
            wrapper.showTransactionSummary(userConfig.data, 'day');
        }
        if (options.month) {
            wrapper.showTransactionSummary(userConfig.data, 'month');
        }

        if (!options.hour && !options.day && !options.month) {
            wrapper.showTransactionSummary(userConfig.data, 'day');
        }
    });


/* default to help */
cli
    .command('*')
    .action(function() {
        cli.help();
    });

if (process.argv.length === 2) {
    cli.help();
}

/* Run the cli */
cli.parse(process.argv);