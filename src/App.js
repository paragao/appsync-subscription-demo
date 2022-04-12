import { faker } from '@faker-js/faker';
import React, { useState, useEffect } from 'react'; 
import { v4 as uuidv4 } from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import * as subscriptions from './graphql/subscriptions';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig)

function App() {

  const [username, setUsername] = useState('');
  const [uuid, setUuid] = useState('');
  const [status, setStatus] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [observers, setObservers] = useState({});

  useEffect(() => {

  }, []);

  const subscription = () => {
    const sub = API.graphql(graphqlOperation(subscriptions.onUpdateTransaction)).subscribe({
      next: ({ provider, value }) => {
        //update the array with the new values
        const newTransaction = value.data.onUpdateTransaction

        //copy the state array - transactions
        const newTransactions = transactions.slice();

        //find the index where the item is located 
        const index = newTransactions.findIndex(el => el.id === uuid)
        
        if (index !== -1) {
          //update the value
          newTransactions[index].status = newTransaction.status
          
          //finally update the state with the new information
          setTransactions(newTransactions)
        } else {
          console.error('couldn\'t find item in the array', index)
        }
        console.log('subs: ', sub)
      },
      error: error => console.warn('subs error: ', error)
    })
  setObservers(sub)
  console.log('Subscription on ALL items started')
  }

  const subscriptionId = () => {
    const sub = API.graphql(graphqlOperation(subscriptions.onUpdateSpecificTransaction, { id: uuid })).subscribe({
      next: ({ provider, value }) => {
        //update the array with the new values
        console.log('data: ', value.data)
        console.log('provider: ', provider)
        const newTransaction = value.data.onUpdateSpecificTransaction

        //copy the state array - transactions
        const newTransactions = transactions.slice();

        //find the index where the item is located 
        const index = newTransactions.findIndex(el => el.id === value.data.onUpdateSpecificTransaction.id)
        
        if (index !== -1) {
          //update the value
          newTransactions[index].status = newTransaction.status
          
          //finally update the state with the new information
          setTransactions(newTransactions)
        } else {
          console.error('couldn\'t find item in the array', index)
        }

      },
      error: error => console.warn('subs error: ', error)
    })
    setObservers(sub)
    console.log('Subscription on SPECIFIC ID started')
  }

  const subscriptionUser = () => {
    const sub = API.graphql(graphqlOperation(subscriptions.onUpdateTransactionByUser, { user: username })).subscribe({
      next: ({ provider, value }) => {
        //update the array with the new values
        const newTransaction = value.data.onUpdateTransactionByUser

        //copy the state array - transactions
        const newTransactions = transactions.slice();

        //find the index where the item is located 
        const index = newTransactions.findIndex(el => el.id === value.data.onUpdateTransactionByUser.id)
        
        if (index !== -1) {
          //update the value
          newTransactions[index].status = newTransaction.status
          
          //finally update the state with the new information
          setTransactions(newTransactions)
        } else {
          console.error('couldn\'t find item in the array', index)
        }

      },
      error: error => console.warn('subs error: ', error)
    })
    setObservers(sub)
    console.log('Subscription on SPECIFIC USED started')
  }

  const stopSubscription = () => {
    observers.unsubscribe();
    console.log('Stopped subscribing')
  }

  const updateTransaction = async () => {
    const updateDetails = { 
      id: uuid, 
      user: username,
      status: status
    }

    await API.graphql(graphqlOperation(mutations.updateTransaction, { input: updateDetails }))
      .then((data) => {
        console.log('updated item: ', data)
      });
  }

  const createTransaction = async () => {
    const createDetails = {
      id: uuidv4(),
      status: status || 'NEW',
      user: username || faker.internet.userName(),
      originIP: faker.internet.ipv4()
    }

    await API.graphql(graphqlOperation(mutations.createTransaction, { input: createDetails }))
      .then((data) => {
        console.log('created item: ', data)
        setTransactions([...transactions, data.data.createTransaction])
      });
  }

  const listTransactions = async () => {
    //TODO: sort by updatedAt
    const data = await API.graphql(graphqlOperation(queries.listTransactions));
    setTransactions(data.data.listTransactions.items)
  }

  const getTransaction = async () => {
    const data = await API.graphql(graphqlOperation(queries.getTransaction, { id: uuid, user: username }))
    setTransactions([data.data.getTransaction])
  }

  return (
    <div className='container-fluid py-2'>
      <div className='row py-2 justify-content-center'>
        <div className='col-md-4'></div>
        <div className='col-xs-6 col-md-8 card'>
          <label className='card-title'>Data to be used for an update (new items will be auto filled)</label>
        </div>
      </div>
      <div className='row justify-content-center'>
        <div className='col-xs-6 col-md-4 card border-light py-4'>
          <div className='btn-group px-4'>
            <button className='btn btn-outline-warning me-2' onClick={subscription}>Start SUBSCRIPTION on all items</button>
            <button className='btn btn-outline-warning me-2' onClick={subscriptionId}>Start SUBSCRIPTION on specific id/user</button>
            <button className='btn btn-outline-warning me-2' onClick={subscriptionUser}>Start SUBSCRIPTION on all items for specific user</button>
          </div>
          <div className='btn-group p-4'>
            <button className='btn btn-outline-warning me-2' onClick={stopSubscription}>Stop SUBSCRIPTION on all items</button>
            <button className='btn btn-outline-warning me-2' onClick={stopSubscription}>Stop SUBSCRIPTION on specific id/user</button>
            <button className='btn btn-outline-warning me-2' onClick={stopSubscription}>Stop SUBSCRIPTION on all items for specific user</button>
          </div>
          <div className='btn-group'>
            <button className='btn btn-outline-primary me-2' onClick={createTransaction}>CREATE a transaction</button>
            <button className='btn btn-outline-success me-2' onClick={updateTransaction}>UPDATE the transaction</button>
            <button className='btn btn-outline-dark me-2' onClick={listTransactions}>LIST all transactions</button>
            <button className='btn btn-outline-secondary me-2' onClick={getTransaction}>GET a specific transaction by ID / USER</button>
          </div>
        </div>
        <div className='col-xs-6 col-md-4 card py-4'>
          <label>UUID: {uuid}</label>
          <label>Username: {username}</label>
          <label>Status: {status}</label>
        </div>
        <div className='col-xs-6 col-md-4 card py-4' >
          <label>Type unique ID:</label>
          <input type="text" value={uuid} onChange={(e) => setUuid(e.target.value)} />
          <label>Username: </label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} label="setUsername" />
          <label>Status:</label>
          <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} label="setStatus" />
        </div>
        <div className='card border-light'></div>
      </div>
        <div className='row justify-content-center py-4'>
          <div className='col-md-6'>

          </div>
        </div>
        <div className='row justify-content-center'>
          <div className='col-xs-12 col-md-10'>
            <table className='table table-striped table-hover'>
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Origin IP</th>
                  <th>createdAt</th>
                  <th>updatedAt</th>
                </tr>
              </thead>
              <tbody>
                {
                  transactions.map((item, id) => {
                    return (
                      <tr key={id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.status}</td>
                        <td>{item.originIP}</td>
                        <td>{item.createdAt}</td>
                        <td>{item.updatedAt}</td>
                      </tr>
                    )      
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

  );
}

export default App;
