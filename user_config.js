'use strict';

var fs = require('fs');

var CONFIG_FILE = './user_config.json';

var UserConfig = {};

/**
 * The data of the user config.
 *
 * @api public
 */
UserConfig.data = {};

/**
 * Loads the user config.
 *
 * @api public
 */
UserConfig.load = function() {
    try {
        UserConfig.data = require(CONFIG_FILE);
    } catch (e) {
        console.log('No config found !');
        console.log('Please use set-account first.');
        process.exit();
    }
};

/**
 * Saves the user config.
 *
 * @api public
 */
UserConfig.save = function() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(UserConfig.data));
};

module.exports = UserConfig;