import { APIGatewayTokenAuthorizerEvent, Callback, Context, Handler } from 'aws-lambda';
import { AccessTokenHandler } from 'node-accesstoken-validation';

import { Authorize } from './authorize';

require('dotenv').config();

const accessTokenValidation = new AccessTokenHandler({
    authority: `${process.env.AUTHSERVER}`,
    supportedTokens: `${process.env.SUPPORTEDTOKENS}`,
    checkAudience: false
});


export const handler: Handler = (
    event: APIGatewayTokenAuthorizerEvent,
    context: Context
) => {

    accessTokenValidation.Handle(event.authorizationToken).then(token => {

        console.log(`Got valid token introspection response: ${JSON.stringify(token)}`);
        return context.succeed(Authorize.validatePolicy(token, event));

    }).catch(err => {

        if (err.name === "JWTExpired") {
            return context.fail('Unauthorized'); // Return a 401 Unauthorized response
        }

        console.log(`Token introspection failed: ${err.description} - ${err.token}`);
        context.fail(`Error: Invalid token - ${err.authority}-${err.description}`); // Return a 500 Invalid token response
    });

}
