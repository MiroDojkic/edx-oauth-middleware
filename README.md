# edx-oauth-middleware
Provides Express.js middleware for Open edX oauth, based on simple-oauth2.
Package exposes commonly used middleware for basic oauth with Open edX:

- `authorize` - redirects user to Open edX LMS. After signing in, user is redirected back to the provided external app's loginUrl

- `storeAccessToken` - stores access token to session, then calls next middleware

- `logout` - destroys session and redirects to Open edX logout page, unless specified otherwise with ` req.params.query.no_redirect` set to `True`.
