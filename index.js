const Promise = require('bluebird');

class EdxOAuthMiddleware {
  constructor(...config) {
    if(config){
      this.serverBaseUrl = config.baseUrl || 'http://localhost';
      this.appPort = config.appPort || 3000;
      this.lmsPort = config.lmsPort || 8000;

      this.credentials = {
        client: config.client || {
          'id': 'id',
          'secret': 'secret'
        },
        auth: config.auth || {
          'tokenHost': `${this.serverBaseUrl}:${this.lmsPort}`,
          'authorizePath': '/oauth2/authorize',
          'tokenPath': '/oauth2/access_token/'
        }
      };
    }
    else {
      this.serverBaseUrl = 'http://localhost';
      this.appPort = 3000;
      this.lmsPort = 8000;

      let credentials = {
        client: {
          'id': 'id',
          'secret': 'secret'
        },
        auth: {
          'tokenHost': `${this.serverBaseUrl}:${this.lmsPort}`,
          'authorizePath': '/oauth2/authorize',
          'tokenPath': '/oauth2/access_token/'
        }
      };
    }

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
      const tokenHolder = this.oauth2.accessToken.create(result);
      req.session.token = tokenHolder.token;

      next();
    })
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

module.exports.init = (...config) => {return new EdxOAuthMiddleware(...config)};
