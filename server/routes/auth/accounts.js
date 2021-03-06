var request = require('request-promise');
var Syno = require('syno');

exports.authT411 = function (req, username, password) {
    return new Promise(function(resolve, reject) {
        username = username ? username : req.settings.account.t411.username;
        password = password ? password : req.settings.account.t411.password;

        if (!(req.settings.account && req.settings.account.t411 && req.settings.account.t411.token && req.settings.account.t411.expires_at) || Date.now() > req.settings.account.t411.expires_at || username) {
            request({
                method: 'POST',
                uri: 'http://api.t411.ch/auth',
                form: {
                    username: username,
                    password: password
                },
                json: true
            }).then(function (response) {
                if (response.token) {
                    var expirationDate = new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000);

                    req.settings.account.t411.token = response.token;
                    req.settings.account.t411.expires_at = expirationDate;
                    req.settings.save(function (err) {
                        if (!err) {
                            resolve(response.token);
                        }
                        else {
                            reject();
                        }
                    });
                }
                else {
                    reject();
                }           
            }).catch(function (err) {
                reject();
            });
        }
        else {
            resolve(req.settings.account.t411.token);
        }
    });
};

exports.authMovieDB = function(req, key) {
    return new Promise(function(resolve, reject) {
        key = key ? key : req.settings.account.movieDB.key;

        if (!(req.settings.account && req.settings.account.movieDB && req.settings.account.movieDB.token && req.settings.account.movieDB.expires_at) || Date.now() > req.settings.account.movieDB.expires_at || key) {
            request({
                method: 'GET',
                uri: 'https://api.themoviedb.org/3/authentication/token/new',
                qs: {
                  api_key: key
                },
                json: true
            }).then(function (response) {
                if (response.success) {
                    req.settings.account.movieDB.token = response.request_token;
                    req.settings.account.movieDB.expires_at = response.expires_at;
                    req.settings.save(function (err) {
                        if (!err) {
                            resolve(req.settings.account.movieDB.key);
                        }
                        else {
                            reject();
                        }
                    });
                }
                else {
                    reject();
                }           
            }).catch(function (err) {
                reject();
            });
        }
        else {
            resolve(req.settings.account.movieDB.token);
        }
    });
};

exports.authSynology = function (req, protocol, host, port,username, password) {
    return new Promise(function(resolve, reject) {
        protocol = protocol ? protocol : req.settings.account.synology.protocol;
        host = host ? host : req.settings.account.synology.host;
        port = port ? port : req.settings.account.synology.port;
        username = username ? username : req.settings.account.synology.username;
        password = password ? password : req.settings.account.synology.password;
            
        var syno = new Syno({
            protocol: protocol,
            host: host,
            port: port,
            account: username,
            passwd: password
        });

        syno.auth.login(function(error, response) {
            if (response && response.sid) {
                resolve(syno);
            }
            else {
                reject();
            }
        })
    });
};

exports.authRealDebrid = function(req, key) {
    return new Promise(function(resolve, reject) {
        key = key ? key : req.settings.account.realDebrid.key;

        if (!(req.settings.account && req.settings.account.realDebrid && req.settings.account.realDebrid.key)) {
            request({
                method: 'GET',
                uri: 'https://api.real-debrid.com/rest/1.0/user',
                qs: {
                  auth_token: key
                },
                json: true
            }).then(function (response) {
                if (!response.error) {
                    resolve(key);
                }
                else {
                    reject();
                }           
            }).catch(function (err) {
                reject();
            });
        }
        else {
            resolve(req.settings.account.realDebrid.key);
        }
    });
};
