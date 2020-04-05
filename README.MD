# OAuth 2.0 - AWS Api Gateway Custom Authorizer - Bearer Token validation

This project is sample implementation of an AWS Lambda custom authorizer for [AWS API Gateway](https://aws.amazon.com/api-gateway/) that works with a JWT bearer token (`id_token` or `access_token`) and References Tokens as well. It checks OAuth 2.0 Authorization Server JWKSet public keys to validate JWT. For reference tokens it make a token Introspection at Auth Server.  

It can be used to secure access to APIs managed by [AWS API Gateway](https://aws.amazon.com/api-gateway/).

It uses `jose` component, allowing validation of HMAC, RSA and ECDsa. 

Supported algorithms:

* HS256
* HS384
* HS512
* RS256
* RS384
* RS512
* ES256
* ES384
* ES512
* PS256
* PS384
* PS512
* EdDSA

## Configuration

### Environment Variables (.env)

Update the `AUTHSERVER`, `CLAIMS` and other options variables in the `.env` file

```
AUTHSERVER=https://example.oktapreview.com/oauth2/aus8o56xh1qncrlwT0h7
SCOPES=my_api.read|my_api.write
CLAIMS=aud:my_api|username:bruno
```

Then `authorize.ts` only returns `200 OK` if JWT has theses claims and SCOPE.

### JSON Web Key Set (jwks_uri)

This package use `node-accesstoken-validation`. By default will get discovery document of your issuer by fetching the `.well-known/openid-configuration` published in your issuer's metadata. Then will load you `jwks_uri` to get public keys and validate JWS (JWT).

### Custom validations

Update `src/authorizer.ts` with your authorization requirements and return the resulting AWS IAM Policy for the request.

# Deployment

### Install Dependencies

Run `npm install` to download all of the authorizer's dependent modules. This is a prerequisite for deployment as AWS Lambda requires these files to be included in the uploaded bundle.


### Create Bundle

Option 1:

For linux users you can create the bundle using `npm run zip`. This creates a oauth2-jwt-authorizer.zip deployment package in the `dist` folder with all the source, configuration and node modules AWS Lambda needs.
If you are under Windows Environment you can use WSDL. Type `Bash` to execute linux terminal, then `npm run zip`.

Option 2:
Certify that [grunt-cli](https://gruntjs.com/getting-started) is installed. After `npm install` run:

```
$ grunt lambda_package --account-id=<your aws account id>
```

To get aws account Id go to [Find your Amazon account identifier](https://enterprise.arcgis.com/en/server/10.3/cloud/amazon/find-your-amazon-account-number.htm)

### Create Lambda function

From the [AWS Lambda console](https://console.aws.amazon.com/lambda/home#/create?step=2)

* **Name:** oauth2-access-token-authorizer
* **Description:** OAuth2 Bearer Token authorizer for API Gateway
* **Runtime:** Node.js 4.3
* **Code entry type:** Upload a .ZIP file
* **Upload:** *select `dist\oauth2-bearer-token-authorizer.zip` we created in the previous step*
* **Handler:** index.handler
* **Role:**  *select an existing role with `lambda:InvokeFunction` action*

  > If you don't have an existing role, you will need to create a new role as outlined below

* **Memory (MB):** 128
* **Timeout:** 30 seconds
* **VPC:** No VPC

Click **Next** and **Create**

### Create IAM Role

You will need to create an IAM Role that has permissions to invoke the Lambda function we created above.

That Role will need to have a Policy similar to the following:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Resource": [
                "*"
            ],
            "Action": [
                "lambda:InvokeFunction"
            ]
        }
    ]
}
```

### Configure API Gateway

From the [AWS API Gateway console](https://console.aws.amazon.com/apigateway/home)

Open your API, or Create a new one.

In the left panel, under your API name, click on **Custom Authorizers**. Click on **Create**

* **Name:** oauth2-jwt-authorizer
* **Lambda region:** *from previous step*
* **Execution role:** *the ARN of the Role we created in the previous step*
* **Identity token source:** `method.request.header.Authorization`
* **Token validation expression:** `^Bearer [-0-9a-zA-z\.]*$`

  > Cut-and-paste this regular expression from ^ to $ inclusive

* **Result TTL in seconds:** 300

Click **Create**

### Testing

You can test the authorizer by supplying an `id_token` or `access_token` and clicking **Test**

    Bearer <token>

A successful test will look something like:

    Latency: 1000 ms
    Principal Id: user@example.com
    Policy
    {
        "Version": "2012-10-17",
        "Statement": [
            {
            "Sid": "Stmt1459758003000",
            "Effect": "Allow",
            "Action": [
                "execute-api:Invoke"
            ],
            "Resource": [
                "arn:aws:execute-api:*"
            ]
            }
        ]
    }

### Configure API Gateway Methods to use the Authorizer

In the left panel, under your API name, click on **Resources**.
Under the Resource tree, select one of your Methods (POST, GET etc.)

Select **Method Request**. Under **Authorization Settings** change:

* Authorizer : oauth2-jwt-authorizer

Make sure that:

* API Key Required : false

Click the tick to save the changes.

### Deploy the API

You need to Deploy the API to make the changes public.

Select **Action** and **Deploy API**. Select your **Stage**.

### Test your endpoint remotely

#### With Postman

You can use Postman to test the REST API

* Method: < matching the Method in API Gateway >
* URL `https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/<resource>`
 * The base URL you can see in the Stages section of the API
 * Append the Resource name to get the full URL
* Header - add an Authorization key
 * Authorization : Bearer <token>

#### With curl from the command line

    $ curl -X POST <url> -H 'Authorization: Bearer <token>'

#### In (modern) browsers console with fetch

    fetch( '<url>', { method: 'POST', headers: { Authorization : 'Bearer <token>' }}).then(response => { console.log( response );});

# Why ?

This blueprint is base on [Okta version](https://github.com/mcguinness/node-lambda-oauth2-jwt-authorizer). But that on doesn't support ECDsa tokens. Also doesn't support JWT's that is generated by [IdentityServer4](https://github.com/IdentityServer/IdentityServer4), with many SCOPES. Resulting in a bug. 

I've opened a PR's and it's open by 1 year now. So this version is in Typescript. Uses `jose` for JWT Token validation. Support reference tokens. This blueprint is able to work with any AuthServer: 

* [IdentityServer4](https://github.com/IdentityServer/IdentityServer4)
* KeyCloak
* Okta
* Auth0

## Wanna help?

I just started developing with node few days ago. If there is any change to help with better code, tests. I'll be grateful.