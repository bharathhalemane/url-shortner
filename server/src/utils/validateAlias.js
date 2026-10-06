const AppError = require('./AppError');

const ALIAS_REGEX = /^[A-Za-z0-9_-]+$/;

const RESERVED = new Set(['api', 'health', 'admin', 'static', 'assets', 'login', 'dashboard', 'register', 'logout', 'user', 'users', 'account', 'settings', 'profile', 'help', 'support', 'contact', 'about', 'terms', 'privacy']);

const validateAlias = (alias) => {
    if (typeof alias !== 'string' || !ALIAS_REGEX.test(alias)){
        throw new AppError(400, 'Invalid alias format. Only alphanumeric characters, hyphens, and underscores are allowed.');
    }

    if(RESERVED.has(alias.toLowerCase())){
        throw new AppError(400, 'This alias is reserved')
    }
    return alias;
}

module.exports = validateAlias;
