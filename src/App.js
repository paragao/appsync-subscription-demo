import { faker } from '@faker-js/faker';
import React, { useState, useEffect } from 'react'; 
import { v4 as uuidv4 } from 'uuid';
import { Button, Flex, Card, SwitchField, Menu, MenuItem, Grid, Text, View, TextField, SelectField, Divider, Table, TableBody, TableRow, TableCell, TableHead, Alert, Heading } from '@aws-amplify/ui-react'; 
import '@aws-amplify/ui-react/styles.css';
import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import * as subscriptions from './graphql/subscriptions';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig)

function App({ signOut, user }) {
  //info got from Amazon Cognito integration via Amplify Auth
  const username = user.attributes.email

  const [uuid, setUuid] = useState(''); //TODO: can remove and let it be created automatically - recover from getTransaction and use in updateTransaction later
  const [status, setStatus] = useState(''); 
  const [loadStatus, setLoadStatus] = useState('');
  const [receiver, setReceiver] = useState('');
  const [cash, setCash] = useState();
  const [balance, setBalance] = useState();
  const [account, setAccount] = useState(user.attributes.sub);
  const [accountState, setAccountState] = useState();
  const [accountDeleted, setAccountDeleted] = useState(false);
  const [balanceSubscription, setBalanceSubscription] = useState();
  const [transactionSubscription, setTransactionSubscription] = useState();
  const [updateTransactionSubscription, setUpdateSubscription] = useState();
  const [tickPrice, setTickPrice] = useState([]);
  const [isChecked, setIsChecked] = useState({'AMZN': false, 'TSLA': false, 'APPL': false});
  const [transactions, setTransactions] = useState([]); 

  useEffect(() => {
    // on first render, get initial balance if account exists
    API.graphql(graphqlOperation(queries.getAccountBalance, { id: account, email: username }))
        .then((response) => {
          if (response.data.getAccountBalance === null) {
            createAccount();
          } else { 
            setBalance(response.data.getAccountBalance.balance);
          }
        })
        .catch((err) => {
          console.log('error getting initial balance or account does not exist ', err)
        })
    
    // on first render, get all transactions related to the actual user if they exist
    const filterDetails = {
      or: [
        { sender: {eq: username} }, 
        { receiver: {eq: username} }
      ]
    }
    API.graphql(graphqlOperation(queries.listTransactions, {filter: filterDetails}))
      .then((response) => {
        setTransactions(response.data.listTransactions.items)
      })

    //subscribe to account balance to show any update in realtime
    const balanceSubscription = API.graphql(graphqlOperation(subscriptions.onUpdateAccountBalance)).subscribe({
      next: ({ provider, value }) => { 
        setBalance(value.data.onUpdateAccountBalance.balance)
      },
      error: (error) => console.warn(error)
    });

    const transactionSubscription = API.graphql(graphqlOperation(subscriptions.onCreateTransaction)).subscribe({
      next: ({ provider, value }) => {
        setTransactions([...transactions, value.data.onCreateTransaction]);
      },
      error: (error) => console.warn(error)
    });

    const updateTransactionSubscription = API.graphql(graphqlOperation(subscriptions.onUpdateTransaction)).subscribe({
      next: ({ provider, value }) => {
        const newTransactions = transactions.slice();
        const index = newTransactions.findIndex(el => el.id === value.data.onUpdateTransaction.id)
        
        if (index !== -1) {
          newTransactions[index].status = value.data.onUpdateTransaction.status
          setTransactions(newTransactions)
        } else {
          console.warn('no transactions found to be updated');
        }
      },
      error: (error) => console.warn(error)
    })
    setUpdateSubscription(updateTransactionSubscription);
    setTransactionSubscription(transactionSubscription);
    setBalanceSubscription(balanceSubscription);
  }, []);
  
  useEffect(() => {
    setTimeout(() => {
      setTickPrice([Math.floor(Math.random() * 251), Math.floor(Math.random() * 251), Math.floor(Math.random() * 251)]);  
    }, 2000);
  }, [tickPrice])

  const updateReceivers = async () => {
    let query = 'AdminQueries'
    let path = '/listUsers'
    let init = { 
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
      }
    }
    const users = await API.post(query, path, init)
    console.log('users', users)
  }

  ////
  // Transactions related functions
  ////

  const createTransaction = async () => {
    setLoadStatus('create')

    const createDetails = {
      accountId: account,
      id: uuid || uuidv4(),
      status: status || 'NEW',
      sender: username || faker.internet.email(),
      receiver: receiver,
      amount: Number(cash),
      originIP: faker.internet.ipv4(),
      type: "PIX"
    }

    await API.graphql(graphqlOperation(mutations.createTransaction, { input: createDetails }))
      .then((data) => {
        API.graphql(graphqlOperation(queries.listAccountBalances, { filter: { email: { eq: receiver }}})) //TODO: change to query (getAccountBalance)
          .then((receiverAccount) => {
            // transfer money to receiver - update receiver balance
            API.graphql(graphqlOperation(mutations.updateAccountBalance, { input: { id: receiverAccount.data.listAccountBalances.items[0].id, email: receiver, balance: (receiverAccount.data.listAccountBalances.items[0].balance + Number(cash)) }})) 
              .then(() => {
                // remove money from sender account
                API.graphql(graphqlOperation(queries.getAccountBalance, { id: account, email: username }))
                  .then((response) => {
                    API.graphql(graphqlOperation(mutations.updateAccountBalance, { input: { id: account, email: username, balance: (response.data.getAccountBalance.balance - Number(cash)) }})) 
                  })
              })
          })
          .catch((err) => {
            console.warn('error updating the account balance')
          })
      })
      .catch((err) => {
        console.warn('create items error', err)
      });
    
      setLoadStatus('')
  }

  const updateTransaction = async () => {
    setLoadStatus('update')

    const updateDetails = { 
      id: uuid, 
      sender: username,
      status: status
    }

    await API.graphql(graphqlOperation(mutations.updateTransaction, { input: updateDetails }))
      .catch((err) => {
        if (err.errorType === "DynamoDB:ConditionalCheckFailedException") {
          console.info('DynamoDB condition has not been met - validate that the transaction belongs to the user')
        }
      });
    
    setLoadStatus('')
  }

  const listTransactions = async () => {
    setLoadStatus('list');

    await API.graphql(graphqlOperation(queries.listTransactions, { 
      filter: { or: [{sender: {eq: username} }, {receiver: {eq: username} } ] }
    }))
      .then((response) => {
        console.table(response.data.listTransactions.items)
        setTransactions(response.data.listTransactions.items);
      })
      .catch((err) => {
        console.warn('list transactions error', err);
      });
    
    setLoadStatus('');
  }

  ////
  //Account and balance related functions
  ////

  const createAccount = async () => {
    setLoadStatus('create');

    const createDetails = {
      id: account,
      email: username,
      balance: 500 
    }

    await API.graphql(graphqlOperation(queries.listAccountBalances, { filter: {email: {eq: username} }})) //TODO: change to getAccountBalance, do a query instead of a scan
      .then((response) => {
        const length = response.data.listAccountBalances.items.length;
        
        const getDetails = {
          id: account,
          email: username
        }

        //length of zero means that no account has been found and we need to create one. Otherwise, just get the balance.
        if ( length === 0) {
          createAccountBalance(createDetails)
        } else {
          getAccountBalance(getDetails);
        }
      })
      .catch((err) => {
        console.log('error processing new account', err)
      })
    
    setLoadStatus('');
  }

  const createAccountBalance = async (createDetails) => {
    await API.graphql(graphqlOperation(mutations.createAccountBalance, { input: createDetails }))
      .then((response) => {
        console.log('new account id: ', response.data.createAccountBalance.id);
        setAccountState('NEW');
        setAccount(response.data.createAccountBalance.id);
        setBalance(response.data.createAccountBalance.balance);
      })
      .catch((err) => {
        console.warn('create account error', err);
      });
  }

  const getAccountBalance = async (getDetails) => {  
    await API.graphql(graphqlOperation(queries.getAccountBalance, getDetails ))
      .then((response) => { 
        setAccountState('OLD');
        setAccount(response.data.getAccountBalance.id);
        setBalance(response.data.getAccountBalance.balance)
        setTransactions(response.data.getAccountBalance.transactions.items)
      })
  }

  const deleteAccountBalance = async () => {
    await API.graphql(graphqlOperation(mutations.deleteAccountBalance, { input: { id: account, email: username }}))
      .then(() => {
        setAccountDeleted(true);
      })
      .catch((err) => {
        console.error('could not delete the account ', err)
      })
  }

  const handleSignOut = () => {
    balanceSubscription.unsubscribe();
    transactionSubscription.unsubscribe();
    updateTransactionSubscription.unsubscribe();
    signOut();
  }

  const handleInvest = (e) => {
    const tick = e.target.value;
    const check = e.target.checked;
    const label = e.target.labels[0].textContent;
    
    switch (label) { 
      case 'AMZN':
        isChecked.AMZN = check;
        setIsChecked(isChecked)
        break; 
      case 'TSLA':
        isChecked.TSLA = check;
        setIsChecked(isChecked)
        break; 
      case 'APPL':
        isChecked.APPL = check;
        setIsChecked(isChecked)
        break; 
      default:
        console.warn('case not found')
        break;
    }
        
    API.graphql(graphqlOperation(mutations.updateAccountBalance, { input: { id: account, email: username, balance: (balance - tick) }}))
      .catch((err) => console.warn(err))

    const createDetails = {
      accountId: account,
      id: uuid || uuidv4(),
      status: status || 'NEW',
      sender: username,
      receiver: username,
      amount: Number(tick),
      originIP: faker.internet.ipv4(),
      type: "INVEST"
    }

    API.graphql(graphqlOperation(mutations.createTransaction, { input: createDetails }))
      .catch((err) => console.warn(err))
  }

  const usernameReceivers = ['paragao@amazon.com', 'paragao+user1@amazon.com', 'nobody@amazon.com']
  const statusList = ['NEW', 'WORKING', 'COMPLETE']
  const [tick1Price, tick2Price, tick3Price] = tickPrice

  return (
    <Grid 
      templateColumns="1fr 1fr 1fr"
      templateRows="1fr 1fr 1fr"
    >
      <Card 
        columnStart="1" 
        columnEnd="-1"
        rowStart="1"
        rowEnd="-11"
        maxHeight="5rem"
        variation='outlined'
        backgroundColor="#FF9900"
      >
        <Flex
          direction="row"
          justifyContent="space-between"
          wrap="nowrap"
          gap="1rem"
        >
          <View width="1rem">
            <Menu menuAlign="start"> 
              <MenuItem onClick={() => alert('to be implemented')}>Home</MenuItem>
              <MenuItem onClick={() => alert('to be implemented')}>Transactions</MenuItem>
              <MenuItem onClick={() => alert('to be implemented')}>Chats</MenuItem>
              <MenuItem onClick={updateReceivers}>Update users</MenuItem>
              <MenuItem onClick={deleteAccountBalance}>Delete account</MenuItem>
            </Menu>
          </View>
          <View>
            <Text
              color="black"
              fontSize="2em"
              fontWeight={800}
            >
              Simple AWS AppSync Subscription and Pipeline Resolver demo
            </Text>
            { accountDeleted ? <Alert isDismissible={true} onDismiss={() => setAccountDeleted(false)}>Account deleted</Alert> : '' }
            { accountState === 'NEW' ? <><Alert isDismissible={true}>Account created!</Alert></> : '' }
            { accountState === 'OLD' ? <><Alert isDismissible={true}>Account already exists!</Alert></> : ''}
          </View>
          <View>
            <SwitchField label="LogOut?" labelPosition="start" onChange={handleSignOut} />
          </View>
        </Flex>
      </Card>
      <Card 
        backgroundColor="#232F3E"
        columnStart="1"
        columnEnd="3"
        rowStart="1"
      >
        <Flex
          justifyContent="center"
        >
          <Card
            variation="elevated"
            backgroundColor="orange"
            padding="1rem"
          >
            <Flex
              direction="column"
              justifyContent="space-around"
            >
              <Heading level={4}>AMZN</Heading>
              <SwitchField label="AMZN" value={tick1Price} isChecked={isChecked.AMZN} onChange={(e) => handleInvest(e)} />
            </Flex>
            <Divider />
            <Flex
              directions="row"
              justifyContent="flex-start"
              minWidth="7rem"
              marginTop="1rem"
            > 
              <Text>Price: {tick1Price}</Text>
            </Flex>
          </Card>
          <Card
            variation="elevated"
            backgroundColor="orange"
            padding="1rem"
          >
            <Flex
              direction="column"
              justifyContent="center"
            >
              <Heading level={4}>TSLA</Heading>
              <SwitchField label="TSLA" value={tick2Price} isChecked={isChecked.TSLA} onChange={(e) => handleInvest(e)} />
            </Flex>
            <Divider />
            <Flex
              directions="row"
              justifyContent="flex-start"
              minWidth="7rem"
              marginTop="1rem"
            > 
              <Text>Price: {tick2Price}</Text>
            </Flex>
          </Card>
          <Card
            variation="elevated"
            backgroundColor="orange"
            padding="1rem"
          >
            <Flex
              direction="column"
              justifyContent="center"
            >
              <Heading level={4}>APPL</Heading>
              <SwitchField label="APPL" value={tick3Price} isChecked={isChecked.APPL} onChange={(e) => handleInvest(e)} />
            </Flex>
            <Divider />
            <Flex
              directions="row"
              justifyContent="flex-start"
              minWidth="7rem"
              marginTop="1rem"
            > 
              <Text>Price: {tick3Price}</Text>
            </Flex>
          </Card>
        </Flex>
        <Flex
          direction="column"
          justifyContent="flex-start"
          alignContent="flex-start"
          wrap="nowrap"
          gap="1rem"
        >
          <Card 
            backgroundColor="#232F3E"
          >
            <Flex 
              direction="row" 
              justifyContent="center"
            >
              <View>
                <SelectField
                  placeholder="New status"
                  color="white"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {statusList.map((state) => (
                    <option color="white" value={state}>{state}</option>
                  ))}
                </SelectField>
                <TextField 
                  placeholder="Transaction ID"
                  color="white"
                  onChange={(e) => setUuid(e.target.value)} 
                  outerEndComponent={
                    <Button
                      isLoading={loadStatus === 'update' ? true : false}
                      loadingText="updating..."
                      onClick={updateTransaction}
                      variation='primary'
                    >
                      Update
                    </Button>
                  } 
                />
              </View>
            </Flex>
          </Card>

            <Table
              backgroundColor="#232F3E"
              highlightOnHover={true}
            >
              <TableHead>
                <TableRow>
                  <TableCell as="th" color="white">Transaction Id</TableCell>
                  <TableCell as="th" color="white">Type</TableCell>
                  <TableCell as="th" color="white">Amount</TableCell>
                  <TableCell as="th" color="white">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow>
                    <TableCell color='orange'>{transaction.id}</TableCell>
                    <TableCell color='orange'>{transaction.type}</TableCell>
                    <TableCell color='orange'>{transaction.amount}</TableCell>
                    <TableCell color='orange'>{transaction.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

        </Flex>
      </Card>
      <Card 
        columnStart="1" 
        columnEnd="3"
        rowStart="2"
        rowEnd="-1"
        backgroundColor="#232F3E"
      >

      </Card>
      <Card 
        columnStart="3" 
        columnEnd="-1"
        rowStart="1"
        rowEnd="-1"
        backgroundColor="#232F3E"
      >
        <Flex
          direction="column"
          justifyContent="space-between"
          alignItems="stretch"
          alignContent="flex-start"
          wrap="nowrap"
          gap="1rem"
        >
          <Card>
            <View>
              <Text fontWeight={800}>Financial Statement</Text>
              <Divider />
              <Text>Account Id: {account} </Text>
              <Text marginBottom="2rem">Account balance: {balance} </Text>
              <Text fontWeight={800}>Transaction Summary</Text>
              <Divider />
              <Text>Sender: {username} </Text>
              <Text>Receiver: {receiver} </Text>
              <Text >Cash to send (US$):  {cash} </Text>
            </View>
          </Card>
          <Card>
            <View>
              <TextField 
                label="Cash value (US$)"
                placeholder="insert amount to be transfered"
                onChange={(e) => setCash(e.target.value)}
                marginBottom="1rem"
              />
              <SelectField
                label="To whom?"
                onChange={(e) => setReceiver(e.target.value)}
                marginBottom="1rem"
              >
                <option value="" default></option>
                {usernameReceivers.map((receiver) => (
                  <option value={receiver}>{receiver}</option>
                ))}
              </SelectField>
              <Button 
                onClick={createTransaction}
                isLoading={loadStatus === 'create' ? true : false}
                loadingText='creating...'
              >
                Transfer money
              </Button>
            </View>
          </Card>
        </Flex>
      </Card>
    </Grid>
  );
}

export default withAuthenticator(App);