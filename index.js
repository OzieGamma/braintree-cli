#!/usr/bin/env node

var CONFIG_FILE = __dirname + '/config.json';

var fs = require('fs');
var wrapper = require(__dirname + '/wrapper.js');

// Clean arguments
var args = process.argv.slice(2);
var command = args[0];

function fail(msg) {
    console.log(msg);
    process.exit();
}

if (command === 'setup-account') {
    if (args.length != 4 || (args[1] !== 'sandbox' && args[1] !== 'production')) {
        fail('Usage: setup-account <sandbox/production> <publicKey> <privateKey>');
    }

    var userData = {
        "env": args[1],
        "publicKey": args[2],
        "privateKey": args[3],
        "merchants": []
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(userData));
} else {
    // Get user data
    try {
        var userData = require(CONFIG_FILE);
    } catch (e) {
        fail('No config found !!!\nPlease use setup-account <sandbox/production> <publicKey> <privateKey>');
    }

    if (command === 'add-merchant') {
        if (args.length != 2) {
            fail('Usage: add-merchant <merchant-id>');
        }

        // Add merchant
        userData.merchants.push(args[1]);

        // Write new data to config
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(userData));
    } else if (command === 'summary') {
        if (args.length === 1) {
            wrapper.showTransactionSummary(userData, 'day');
        } else if (args.length === 2 && args[1] === 'month' || args[1] === 'day' || args[1] === 'hour') {
            wrapper.showTransactionSummary(userData, args[1]);
        } else {
            fail('Usage: summary [<month/day/hour>]');
        }
    } else {
        console.log('Usage: ');
        console.log('Setup connection: setup-account <sandbox/production> <publicKey> <privateKey>');
        console.log('Add merchant: add-merchant <merchant-id>');
        console.log('Show summary: summary [<month/day/hour>]');
    }
}