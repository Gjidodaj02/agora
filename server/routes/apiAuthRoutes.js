/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();

// import util Models
const ApiMessage = require( '../model/util/ApiMessage' );

// import controllers
const authController = require( '../controller/authController' );

// check that the user is logged in!
// Currently by being here all APIs should require an athenicated user to work
router.use(function (req, res, next) {

    const authHeader = req.headers.authorization;
    if(!authHeader){
        // authentication token missing

        res.set("x-agora-message-title", "Unauthorized");
        res.set("x-agora-message-detail", "API requires authentication");
        res.status(401);
        next( 'Authentication not provided!' );
        
    }
    else {
        // we have a auth token, get the username and password from it.
        const auth = new Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(':');
        const userEmail = auth[0];
        const password = auth[1];

        // verify the credentials are valid
        authController.basicAuth( userEmail, password, req ).then( ( user ) => {
            if ( user ) {
                // user is authorized!
                req.user = user;

                // TODO future role specific verification can go here.

                // Middleware complete back to called route.
                next( );

            }
            else {
                res.set("x-agora-message-title", "Unauthorized");
                res.set("x-agora-message-detail", "API requires authentication");
                res.status(401);
                next( 'Authentication Failed!' );
            }
        });
    }

    
    


    /**
     * Old auth mechanism that relied on server session (stateful)
     * Keeping around until Basic auth mechanism is inplace and tested
     * with browser and other clients
     
    if(!req.session.authUser) {
        // create the ApiMessage
        const apiRes = ApiMessage.createApiMessage( 401, "Unauthorized", "API requires authentication");
        
        res.set("x-agora-message-title", "Unauthorized");
        res.set("x-agora-message-detail", "API requires authentication");
        res.status(401).json(apiRes);
        //res.send();
    }
    else {
        next();
    }
    */
    
});


/**
 * Tag APIs
 */
 const tagRoutes = require( './apis/tagRoutes' );
 router.use( '/tags', tagRoutes );

/**
 * Goal APIs
 */
const goalRoutes = require('./apis/goalRoutes')
router.use('/goals', goalRoutes);

/**
 * Topic APIs
 */
// const topicRoutes = require('./apis/topicRoutes')
// router.use('/topic', topicRoutes);

/**
 * Resource APIs
 */
const resourceRoutes = require('./apis/resourceRoutes')
router.use('/resources', resourceRoutes);
 
/**
 * User APIs
 */
const userRoutes = require('./apis/userRoutes')
router.use('/user', userRoutes);


/**
 * Stripe APIs
 */
const stripeRoutes = require('./apis/stripeRoutes')
router.use('/stripe', stripeRoutes);

module.exports = router;