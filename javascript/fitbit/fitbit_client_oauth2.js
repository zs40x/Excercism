var express = require('express');
var app     = express();
var config  = require( './config/app.json' );
var fs      = require( 'fs' );

var Fitbit  = require( 'fitbit-oauth2' );

// Simple token persist functions.
//
var tfile = 'fb-token.json';
var persist = {
    read: function( filename, cb ) {
        fs.readFile( filename, { encoding: 'utf8', flag: 'r' }, function( err, data ) {
            if ( err ) return cb( err );
            try {
                var token = JSON.parse( data );
                cb( null, token );
            } catch( err ) {
                cb( err );
            }
        });
    },
    write: function( filename, token, cb ) {
        console.log( 'persisting new token:', JSON.stringify( token ) );
        fs.writeFile( filename, JSON.stringify( token ), cb );
    }
};

// Instanciate a fitbit client.  See example config below.
//
var fitbit = new Fitbit( config.fitbit ); 

// In a browser, http://localhost:4000/fitbit to authorize a user for the first time.
//
app.get('/fitbit', function (req, res) {
    res.redirect( fitbit.authorizeURL() );
});

// Callback service parsing the authorization token and asking for the access token.  This
// endpoint is refered to in config.fitbit.authorization_uri.redirect_uri.  See example
// config below.
//
app.get('/fitbit_auth_callback', function (req, res, next) {
    var code = req.query.code;
    fitbit.fetchToken( code, function( err, token ) {
        if ( err ) return next( err );
        
        // persist the token
        persist.write( tfile, token, function( err ) {
            if ( err ) return next( err );
            res.redirect( '/fb-profile' );
        });
    });
});

// Call an API.  fitbit.request() mimics nodejs request() library, automatically
// adding the required oauth2 headers.  The callback is a bit different, called
// with ( err, body, token ).  If token is non-null, this means a refresh has happened
// and you should persist the new token.
//
app.get( '/fb-profile', function( req, res, next ) {
    fitbit.request({
        uri: "https://api.fitbit.com/1/user/-/profile.json",
        method: 'GET',
    }, function( err, body, token ) {
        if ( err ) return next( err );
        var profile = JSON.parse( body );
        // if token is not null, a refesh has happened and we need to persist the new token
        if ( token )
            persist.write( tfile, token, function( err ) {
                if ( err ) return next( err );
                    res.send( '<pre>' + JSON.stringify( profile, null, 2 ) + '</pre>' );
            });
        else
            res.send( '<pre>' + JSON.stringify( profile, null, 2 ) + '</pre>' );
    });
});

app.listen(4000);