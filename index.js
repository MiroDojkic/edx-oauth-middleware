const Promise = require('bluebird');

class EdxOAuthMiddleware {
  constructor({loginUrl, redirectOnLoginUrl, lmsUrl, edxLogoutUrl, client, auth}) {
    this.loginUrl = loginUrl || 'http://localhost:3000/login';
    this.redirectOnLoginUrl = redirectOnLoginUrl || 'http://localhost:3000';
    this.lmsUrl = lmsUrl || 'http://localhost:8000';
    this.edxLogoutUrl = edxLogoutUrl || `${this.lmsUrl}/logout`;

    this.credentials = {
      client: client || {
        'id': 'id',
        'secret': 'secret'
      },
      auth: auth || {
        'tokenHost': this.lmsUrl,
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
      redirect_uri: this.loginUrl,
      scope: 'openid profile email'
    });
    res.redirect(authorizationUri);
  };

  storeAccessToken(req, res, next) {
    const tokenConfig = {
      code: req.query.code,
      redirect_uri: this.redirectOnLoginUrl
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
      res.redirect(this.edxLogoutUrl);
    }
  };
}

module.exports.init = (config) => { return new EdxOAuthMiddleware(config) };
