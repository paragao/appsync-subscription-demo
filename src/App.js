import React, { useState, useEffect } from 'react'; 
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Button, Flex, Card, SwitchField, Menu, MenuItem, Grid, Text, View, TextField, SelectField, Divider, Table, TableBody, TableRow, TableCell, TableHead, Alert, Heading, Icon } from '@aws-amplify/ui-react'; 
import '@aws-amplify/ui-react/styles.css';
import { MdDeleteForever } from 'react-icons/md';
import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import * as subscriptions from './graphql/subscriptions';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import { createAccount, getAccountBalance, deleteAccountBalance } from './Functions/AccountBalance';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig)

function App({ signOut, user }) {

  //info got from Amazon Cognito integration via Amplify Auth
  const username = user.attributes.email
  const [cognitoUsers, setCognitoUsers] = useState();
  const [uuid, setUuid] = useState(''); //TODO: can remove and let it be created automatically - recover from getTransaction and use in updateTransaction later
  const [status, setStatus] = useState(''); 
  const [loadStatus, setLoadStatus] = useState('');
  const [receiver, setReceiver] = useState('');
  const [cash, setCash] = useState();
  const [balance, setBalance] = useState();
  const [account, setAccount] = useState(user.attributes.sub);
  const [accountState, setAccountState] = useState();
  const [tickPrice, setTickPrice] = useState([]);
  const [isChecked, setIsChecked] = useState([false, false, false]);
  const [transactions, setTransactions] = useState([]);
  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {
    // on first render, get initial balance if account exists or else creates it automatically
    const getDetails = {
      id: account,
      email: username
    }
    const result = getAccountBalance(getDetails)
      if (result.state === 'NEW') {
        setAccountState(result.state);
      } else { 
        setAccountState(result.state);
        setAccount(result.accountId);
        setBalance(resulta.accountBalance);
      }
    
    if (accountState !== 'OLD') { 
      createAccount(account, username);
    }

    balanceSubscription();
    createTransactionSubscription();
  }, []); 
  
  useEffect(() => {
    const filter = { 
      or: { 
        sender: { eq: username },
        receiver: { eq: username }
      }
    }
    listTransactions(filter)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setTickPrice([Math.floor(Math.random() * 251), Math.floor(Math.random() * 251), Math.floor(Math.random() * 251)]);  
    }, 2000);
  }, [tickPrice])

  // not working because of CORS - I hate CORS.
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
    setCognitoUsers(users)
    console.log('users', users)
  }

  const handleSignOut = () => {
    balanceSubscription().unsubscribe();
    signOut();
  }

  const handleInvest = async (e) => {
    const tick = e.target.value;
    const check = e.target.checked;
    const label = e.target.labels[0].textContent;
    
    switch (label) { 
      case 'AMZN':
        isChecked[0] = check;
        setIsChecked(isChecked)
        break; 
      case 'APPL':
        isChecked[1] = check;
        setIsChecked(isChecked)
        break; 
      case 'TSLA':
        isChecked[2] = check;
        setIsChecked(isChecked)
        break; 
      default:
        console.warn('case not found')
        break;
    }

    if (check) {
      await API.graphql(graphqlOperation(mutations.updateAccountBalance, { input: { id: account, email: username, balance: (balance - tick) }}))
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
  
      await API.graphql(graphqlOperation(mutations.createTransaction, { input: createDetails }))
        .catch((err) => console.warn(err))
    }
  }

  // Subscriptions
  const balanceSubscription = () => {
    return API.graphql(graphqlOperation(subscriptions.onUpdateAccountBalance)).subscribe({
      next: ({ provider, value }) => { 
        setBalance(value.data.onUpdateAccountBalance.balance)
      },
      error: (error) => console.warn(error)
    }); 
  }

  const deleteTransactionSubscription = () => { 
    return API.graphql(graphqlOperation(subscriptions.onDeleteTransaction)).subscribe({
      next: ({ provider, value }) => {
        setTransactions(transactions.filter(el => el.id !== value.data.onDeleteTransaction.id));
      },
      error: (error) => console.warn(error)
    })
  }

  const updateTransactionSubscription = () => {
    return API.graphql(graphqlOperation(subscriptions.onUpdateTransaction)).subscribe({
      next: ({ provider, value }) => {
        console.log('transactions', transactions)
        const newTransactions = transactions.slice();
        console.log('sliced transactions', newTransactions)
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
  }

  const createTransactionSubscription = () => {
    return API.graphql(graphqlOperation(subscriptions.onCreateTransaction)).subscribe({
      next: ({ provider, value }) => {
        setTransactions(transactions => [...transactions, value.data.onCreateTransaction]);
      },
      error: (error) => console.warn(error)
    });
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
      .then(() => {
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

  const listTransactions = async (filterDetails) => {
    await API.graphql(graphqlOperation(queries.listTransactions, { filter: filterDetails }))
      .then((response) => { 
        console.log('setting transactions', response.data)
        setTransactions(transactions => [...transactions, response.data.listTransactions.items]);
      });
  }

  const deleteAllTransactions = () => {
    transactions.map((transaction) => {
      API.graphql(graphqlOperation(mutations.deleteTransaction, { input: { id: transaction.id, sender: username }}))
        .catch((error) => console.warn('error deleting transaction ', error))
    })
  }

  const deleteTransaction = async (transactionId) => {
    await API.graphql(graphqlOperation(mutations.deleteTransaction, { input: { id: transactionId, sender: username }}))
      .then(() => { 
        console.log('transaction deleted')
      })
      .catch((error) => console.log('error deleting transaction', error))
  }

  ////
  //Account and balance related functions
  ////

//  const createAccount = async () => {
//    setLoadStatus('create');
//
//    const createDetails = {
//      id: account,
//      email: username,
//      balance: 500 
//    }
//
//    await API.graphql(graphqlOperation(queries.listAccountBalances, { filter: {email: {eq: username} }})) //TODO: change to getAccountBalance, do a query instead of a scan
//      .then((response) => {
//        const length = response.data.listAccountBalances.items.length;
//        
//        const getDetails = {
//          id: account,
//          email: username
//        }
//
//        //length of zero means that no account has been found and we need to create one. Otherwise, just get the balance.
//        if ( length === 0) {
//          createAccountBalance(createDetails)
//        } else {
//          getAccountBalance(getDetails);
//        }
//      })
//      .catch((err) => {
//        console.log('error processing new account', err)
//      })
//    
//    setLoadStatus('');
//  }
//
//  const createAccountBalance = async (createDetails) => {
//    await API.graphql(graphqlOperation(mutations.createAccountBalance, { input: createDetails }))
//      .then((response) => {
//        console.log('new account id: ', response.data.createAccountBalance.id);
//        setAccountState('NEW');
//        setAccount(response.data.createAccountBalance.id);
//        setBalance(response.data.createAccountBalance.balance);
//      })
//      .catch((err) => {
//        console.warn('create account error', err);
//      });
//  }
//
//  const getAccountBalance = async (getDetails) => {  
//    await API.graphql(graphqlOperation(queries.getAccountBalance, getDetails ))
//      .then((response) => { 
//        if (response.data.getAccountBalance !== null) {
//          setAccountState('OLD');
//          setAccount(response.data.getAccountBalance.id);
//          setBalance(response.data.getAccountBalance.balance);
//          //setTransactions(response.data.getAccountBalance.transactions.items)
//        } else {
//          setAccountState('NEW');
//        }
//      })
//  }
//
//  const deleteAccountBalance = async () => {
//    await API.graphql(graphqlOperation(mutations.deleteAccountBalance, { input: { id: account, email: username }}))
//    .then(() => {
//        deleteAllTransactions();
//        setAccountDeleted(true);
//    })
//    .catch((err) => {
//        console.error('could not delete the account ', err)
//    })
//  }

  const usernameReceivers = ['paragao@amazon.com', 'paragao+user1@amazon.com', 'nobody@amazon.com']
  const statusList = ['NEW', 'WORKING', 'COMPLETE']
  const ticks = [{ 
      name: 'AMZN', 
      price: tickPrice[0],
      isChecked: isChecked[0]
    },
    {
      name: 'APPL',
      price: tickPrice[1],
      isChecked: isChecked[1]
    },
    { 
      name: 'TSLA',
      price: tickPrice[2],
      isChecked: isChecked[2]
    }
  ]

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
                      AWS AppSync Subscription demo
                  </Text>
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
        { accountDeleted ? <Alert marginBottom="1rem" borderRadius={30} isDismissible={true} variation='error' onDismiss={() => setAccountDeleted(false)}>Account deleted</Alert> : '' }
        { accountState === 'NEW' ? <><Alert marginBottom="1rem" borderRadius={30} isDismissible={true} variation='success'>Account created!</Alert></> : '' }
        { accountState === 'OLD' ? <><Alert marginBottom="1rem" borderRadius={30} isDismissible={true} variation='success'>Account already exists!</Alert></> : ''}
        <Flex
          justifyContent="center"
        >
          {ticks.map((tick) => (
            <Card
              variation="elevated"
              backgroundColor="orange"
              padding="1rem"
            >
              <Flex
                direction="column"
                justifyContent="space-around"
              >
                <Heading level={4}>{tick.name}</Heading>
                <SwitchField label={tick.name} value={tick.price} isChecked={tick.isChecked} onChange={(e) => handleInvest(e)} />
              </Flex>
              <Divider />
              <Flex
                directions="row"
                justifyContent="flex-start"
                minWidth="7rem"
                marginTop="1rem"
              > 
                <Text>Price: {tick.price}</Text>
              </Flex>
            </Card>
          ))}
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
                  <TableCell as="th" color="white">Delete</TableCell>
                  <TableCell as="th" color="white">Credit/Debit</TableCell>
                  <TableCell as="th" color="white">Type</TableCell>
                  <TableCell as="th" color="white">Amount</TableCell>
                  <TableCell as="th" color="white">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow>
                    <TableCell color='orange'><Button size="medium" variation="link" onClick={() => deleteTransaction(transaction.id)}><Icon as={MdDeleteForever} /></Button></TableCell> 
                    <TableCell color='orange'>{transaction.sender === username ? 'DEBIT' : 'CREDIT'}</TableCell>
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