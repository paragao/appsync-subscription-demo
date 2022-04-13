# Working with Subscriptions to design a real-time data app using AWS AppSync and AWS Amplify

This project helps developers understand how powerful GraphQL subscriptions can be. 

I have used ReactJS to create a simple frontend that interacts with a GraphQL API. The backend consists of [AWS AppSync](https://aws.amazon.com/appsync/) and [Amazon DynamoDB](https://aws.amazon.com/dynamodb/). In order to make the whole process of developing the app simple, developer-friendly, I have used AWS Amplify. 

The project deploys both the backend and frontend using [AWS Amplify](https://aws.amazon.com/amplify/).

## Overview

The backend was designed for a simple use case: be able to create a transaction and then update that transaction and receive those updates in real-time on the frontend. In order to do that I am using AWS AppSync Subscriptions, which are a secure Websocket implementation over a GraphQL API. AWS AppSync is a managed serverless GraphQL solution that implements the best practices for scalability and performance. 

On this example I am using a generated API Key but AWS AppSync allows you to integrate with Amazon Cognito for a true OAuth2/OIDC user authentication. You can also use AWS Web Application Firewall (WAF) in order to add an extra layer of security. In order to focus on the usability of Subscriptions I will not implement neither.

AWS Amplify helps setting up the required libraries and security protocols for calling AWS Services. By leveraging AWS Amplify developers do not need to have advanced skills on AWS Services and can use code to create the backend resources. The GraphQL API, subscriptions, and the Amazon DynamoDB database are all described on the `schema.graphql` file, making it easy to design a data-driven architecture. To learn more about AWS Amplify and how it can create not only the GraphQL but also Resolvers and Data Sources automatically, check the documentation about [Data Modeling](https://docs.amplify.aws/cli/graphql/data-modeling/).

In order to create fake data I am using [Faker-JS](https://github.com/faker-js/faker).


## Technical Architecture 

The following diagram shows a component overview of the solution: 

[Image]()

## How to deploy the solution

There are some pre-requisites for this solution to work:

- an AWS Account
- AWS Amplify CLI installed
- AWS CLI installed
- AWS credentials configured
- NodeJS v16 or above
- NPM v8 or above

The other packages will be installed during the build phase of this project.

AWS Amplify helps us setup this solution easily. All you have to do is: 

1. Clone this repo and change into the directory.
2. Run `amplify init`. Chose the name for the environment (ex: dev) and configure the AWS profile (safer than using credentials).
3. Run `amplify push` to deploy the resources to your AWS Account.
4. Run `npm install`. 

You are ready to test the application (see next section).


## How to test the solution
In order to test the AWS AppSync subscriptions you should
1. Run `npm start`. The frontend will open in a new browser window.
2. If this is the first time running it, click on `CREATE a transaction` to populate the database. The newly created items will be shown on the table. 
3. Now copy the ItemID and Username of a specific item and paste on the respective form fields. Type a new Status on the form field and click `UPDATE the transaction`. You will see that nothing changes on the table since we are not subscribing to anything yet. If you click `LIST all transactions` you will see that the item has been updated.
4. Now click on `Start SUBSCRIPTION on all items` and repeat the procedure on step 4 with a different status message. You will see that the table will change automatically. You can try a few more times before clicking `Stop SUBSCRIPTION on all items`. Make sure you stop subscribing before moving to the next step.
5. Now copy and paste an Item ID on the form and click on `Start SUBSCRIPTION on specific ID`. Copy and paste the respective username on the form as well and type a new status message. You will see that the table updates because you are subscribed to that specific Item ID. If you try update another Item ID it will actually update but it will not show on the table because you are not subscribed to all items. If you hit `LIST all transactions` then you will that the other item has been updated (that's because it is getting the new values directly using a SCAN on the database). Before moving to the next step make sure you have clicked on the `Stop SUBSCRIPTION on specific ID`.
6. Now copy and paste a Username on the form and click on `Start SUBSCRIPITION on specific USER`. In order to create more transacations for the same username, type a specific username on the form and click `CREATE a transaction`. Additional items with the same username will be created. Now, copy and paste the respective Item ID and type a new Status message and click on `UPDATE the transacation`. You will see that the item will be changed. Try with another Item ID for the same username. It will also be updated because your subscribing to all updates on a speficic username. Make sure you click on `Stop SUBSCRIPTION on a specific user` before moving forward.




