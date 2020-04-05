import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import _ from 'lodash';

import { ApiOptions, AuthPolicy } from './auth-policy';

export class Authorize {

    public static validatePolicy(claims: any, event: APIGatewayTokenAuthorizerEvent) {

        var apiOptions: ApiOptions = {};
        const arnParts = event.methodArn.split(':');
        const apiGatewayArnPart = arnParts[5].split('/');
        const awsAccountId = arnParts[4];
        apiOptions.region = arnParts[3];
        apiOptions.restApiId = apiGatewayArnPart[0];
        apiOptions.stage = apiGatewayArnPart[1];

        const method = apiGatewayArnPart[2];
        let resource = '/'; // root resource

        if (apiGatewayArnPart[3]) {
            resource += apiGatewayArnPart[3];
        }

        const policy = new AuthPolicy(claims.sub, awsAccountId, apiOptions);

        /*
          check claims
    
          to allow full access:
            policy.allowAllMethods()
         */
        if (this.hasScopes(claims, process.env.SCOPES.split(' ')) &&
            this.hasClaims(claims, process.env.CLAIMS.split('|'))) {
            // policy.allowMethod(AuthPolicy.HttpVerb.GET, "*");
            // policy.allowMethod(AuthPolicy.HttpVerb.POST, "*");
            // policy.allowMethod(AuthPolicy.HttpVerb.PUT, "*");
            // policy.allowMethod(AuthPolicy.HttpVerb.PATCH, "*");
            // policy.allowMethod(AuthPolicy.HttpVerb.DELETE, "*");
            policy.allowAllMethods();
        } else {
            console.log(`User do not have specified claims ${process.env.CLAIMS}`)
            policy.denyAllMethods();
        }
        // policy.allowMethod(AuthPolicy.HttpVerb.HEAD, "*");
        // policy.allowMethod(AuthPolicy.HttpVerb.OPTIONS, "*");


        return policy.build();
    }


    private static hasScopes(claims: any, scopes: any) {
        if (scopes) {
            scopes = _.isArray(scopes) ? scopes : [scopes];
            const grantedScopes = _.intersectionBy(claims['scope'], scopes);
            return grantedScopes.length > 0;
        }
        return false;
    }

    private static hasClaims(userClaims: any, claims: any) {
        if (claims) {
            let keyValue = claims.map( (m: any) => m.split('='));
            let grantedClaims = [];

            keyValue.forEach( (item: any) => {
                let key = item[0].trim();
                let value = item[1].trim();

                var foundClaims = userClaims[key] == value;
                if (foundClaims)
                    grantedClaims.push(userClaims[key]);
            });
            return grantedClaims.length == claims.length;
        }
        return false;
    }
}