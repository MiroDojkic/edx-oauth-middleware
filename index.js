const Promise = require('bluebird');

class EdxOAuthMiddleware {
  constructor({baseUrl, appPort, lmsPort, client, auth}) {
    this.serverBaseUrl = baseUrl || 'http://localhost';
    this.appPort = appPort || 3000;
    this.lmsPort = lmsPort || 8000;

    this.credentials = {
      client: client || {
        'id': 'id',
        'secret': 'secret'
      },
      auth: auth || {
        'tokenHost': `${this.serverBaseUrl}:${this.lmsPort}`,
        'authorizePath': '/oauth2/authorize',
        'tokenPath': '/oauth2/access_token/'
      }
    };

    this.oauth2 = require('simple-oauth2').create(this.credentials);

    this.authorize = this.authorize.bind(this);
    this.storeAccessToken = this.storeAccessToken.bind(this);
    this.logout = this.logout.bind(this);
  }

  authorize(req, res) {
    const authorizationUri = this.oauth2.authorizationCode.authorizeURL({
      redirect_uri: `${this.serverBaseUrl}:${this.appPort}/users/login`,
      scope: 'openid profile email'
    });
    res.redirect(authorizationUri);
  };

  storeAccessToken(req, res, next) {
    const tokenConfig = {
      code: req.query.code,
      redirect_uri: `${this.serverBaseUrl}:${this.appPort}`
    };

    this.oauth2.authorizationCode.getToken(tokenConfig)
    .then(result => {
      req.session.token = this.oauth2.accessToken.create(result).token;

      next();
    })
    .catch(TypeError, error => res.send('Token is missing!'))
    .catch(error => res.send(`Access Token Error ${error.message}`));
  };

  logout(req, res) {
    req.session.destroy();
    if(req.params.query && req.params.query.no_redirect) {
      res.send('OK');
    }
    else {
      res.redirect(`${this.serverBaseUrl}:${this.lmsPort}/logout`);
    }
  };
}

module.exports.init = (...config) => {return new EdxOAuthMiddleware(config)};
