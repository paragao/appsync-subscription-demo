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
- [AWS Amplify CLI]() installed
- [AWS CLI]() installed
- [AWS credentials]() configured
- NodeJS v16 or above
- NPM v8 or above

The other packages will be installed during the build phase of this project.

AWS Amplify helps us setup this solution easily. All you have to do is: 

1. Clone this repo and change into the cloned directory;
2. Run `amplify init`. Chose the name for the environment (ex: dev) and configure the AWS profile;
3. Run `amplify push` to deploy the resources to your AWS Account;
4. Run `npm install` and then `npm start` to install the required libraries and start the development server locally.

You are ready to test the application (see next section).


## How to test the solution
Let's understand the scenario first. This demo focus on demonstrating how you can subscribe to a data source using AWS AppSync GraphQL API. Your table will start empty, so first create some items by clicking the `Create a transacation` button. This will trigger a `createTransaction` mutation and will add an item to the Amazon DynamoDB table. If you want to create items with a specific username, item ID, or status, just fill out the form on the right side before clicking the button. The new state of those variables will be shown on the middle column. After you have items created you can also update them by clicking on `Update a transaction` button. Choose an ID, copy/paste it on the `Type Unique ID` field and then type some new values on either username or status, or both. 

You can list all items on your table or find a specific item. To do so, click the `List all trnsactions` button or the `Get a specific transaction by ID/user`. In order for that to work you must have the `Type Unique ID` with an existing ID filled out.

The subscription buttons will do what their are named for. You can:

1. **Start subscribing to all items**: this will create a subscription that will be triggered whenever an item is either created or updated on the data source;

2. **Start subscribing to a specific ID**: this will create a subscription that will be triggered whenver an item with the specific ID provided is created or update on the data source. In order to start this subscription you must first copy/paste an Unique ID to the `Type Unique ID` field. It also works with non-existing unique IDs. In that case, if an item with the non-existing unique ID is created then the subscription will be triggered. An use case for that would be to start subscribing on a transaction that the client side create, with an idempotency ID, and then use that ID to store data into a data source and have the client receive the information back in real time. A state machine (ex: AWS Step Functions) could be triggered by this transaction and each state could update this control table based on the idempotency ID and the client would receive data back in real time about what was happening with the transaction. Instant payments, credit analysis, are just two use cases that would fit this scenario;

3. **Start subscribing to a specific username**: similar to the use case above, but subscription will be based on an username and not an ID. 

Although this demonstration approach subscription based on ID or username, AWS AppSync supports subscription with other kind of filters as well. You just have to add a subscription type to your GraphQL schema.

Now that you know the basics, you can start testing the solution. 

### Suggested workflow

1. Go to your browser tab where the website is running. If there are none, make sure you have run `npm start` and check which port it is using locally (usually is http://localhost:3000);

2. If this is the first time running this demo then click on `CREATE a transaction` a few times to populate the database. The newly created items will be shown on the table. If you want, you can fill out the `username` field and create transactions with a specific username.

3. Now copy the ItemID and Username of a specific item and paste on the respective form fields. Type a new Status on the form field and click `UPDATE the transaction`. You will see that nothing changes on the table since we are not subscribing to anything yet. If you click `LIST all transactions` you will see that the item has been updated accordingly. List all transactions will trigger a `listTransactions` query to get data directly from the data source and update the state locally;

4. Now click on `Start SUBSCRIPTION on all items` and repeat the procedure on step 3 with a different status message. You will see that the table will change automatically. You can try a few more times before clicking `Stop SUBSCRIPTION on all items`. Make sure you stop subscribing before moving to the next step; 

5. Now copy and paste an Item ID on the form and click on `Start SUBSCRIPTION on specific ID`. Copy and paste the respective username on the form as well and type a new status message. You will see that the table updates because you are subscribed to that specific Item ID. If you try update another Item ID it will actually update but it will not show on the table because you are not subscribed to all items. If you hit `LIST all transactions` then you will see that the other item has been updated. Before moving to the next step make sure you have clicked on the `Stop SUBSCRIPTION on specific ID`.

6. Now copy and paste a Username on the form and click on `Start SUBSCRIPITION on specific USER`. In order to create more transacations for the same username, type a specific username on the form and click `CREATE a transaction`. Additional items with the same username will be created. Now, copy and paste the respective Item ID and type a new Status message and click on `UPDATE the transacation`. You will see that the item will be changed. Try with another Item ID for the same username. It will also be updated because your subscribing to all updates on a speficic username. Make sure you click on `Stop SUBSCRIPTION on a specific user` before moving forward.

# Clean-up

In order to delete this project from your account you have to run `amplify delete` from the root of the project diretory. 

After the resources are deleted from your account, you can remove the project diretory (if desired).


