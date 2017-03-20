# edx-oauth-middleware
Provides Express.js middleware for Open edX oauth, based on simple-oauth2.
Package exposes commonly used middleware for basic oauth with Open edX:

- `authorize` - redirects user to Open edX LMS. After signing in, user is redirected back to the provided external app's loginUrl

- `storeAccessToken` - stores access token to session, then calls next middleware

- `logout` - destroys session and redirects to Open edX logout page, unless specified otherwise with ` req.params.query.no_redirect` set to `True`.

# Install
```
npm install --save edx-oauth-middleware
```

# Example
## Importing and initializing module
This is default config, which is also set with calling init method with empty object: 
```javascript
require('edx-oauth-middleware').init({});
```
It is up to developer to provide custom config if required
```javascript
const config = {
  loginUrl: 'http://localhost:3000/users/login',
  redirectOnLoginUrl: 'http://localhost:3000',
  lmsUrl: 'http://localhost:8000',
  edxLogoutUrl: 'http://localhost:8000/logout',
  client: {
    id: 'id',
    secret: 'secret'
  },
  auth: {
    tokenHost: 'http://localhost:8000',
    authorizePath: "/oauth2/authorize",
    tokenPath: "/oauth2/access_token/"
  }
};

const { authorize, storeAccessToken, logout } = require('edx-oauth-middleware').init(config);
```

## Usage in custom application
```javascript
const axios = require('axios');

router.get('/auth', authorize);
router.get('/login', storeAccessToken, (req, res) => {
  const accessToken = req.session.token.access_token;
  const options = {
    method: 'GET',
    url: 'localhost:8000/oauth2/user_info`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  axios(options)
  .then(response => {
    req.session.user = response.data; // eslint-disable-line
    res.redirect('/');
  })
  .catch(error => res.send(`Access Token Error ${error.message}`));
});
router.get('/logout', logout);
```
