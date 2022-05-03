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

  // form variables
  const [username, setUsername] = useState('');
  const [uuid, setUuid] = useState('');
  const [status, setStatus] = useState(''); 
  const [toast, setToast] = useState({show: false, message: ''});
  
  const [transactions, setTransactions] = useState([]); // used to hold the transcation data 
  const [observers, setObservers] = useState({}); //used to hold the subscription promise and stop subscribing via the .unsubscribe() function

  useEffect(() => {
    //placeholder, not used right now
  }, []);

  const updateValue = (value) => {
    if (value.data.onUpdateSpecificTransaction) {
      const newTransaction = value.data.onUpdateSpecificTransaction
      const newTransactions = transactions.slice();
      const index = newTransactions.findIndex(el => el.id === value.data.onUpdateSpecificTransaction.id)
      
      if (index !== -1) {
        newTransactions[index].status = newTransaction.status
        setTransactions(newTransactions)
        console.log('Item already existed, status updated')
      } else {
        console.error('The item ID does not exist, update failed', index)
      }
    } else if (value.data.onUpdateTransactionByUser) {
      const newTransaction = value.data.onUpdateTransactionByUser
      const newTransactions = transactions.slice();
      const index = newTransactions.findIndex(el => el.id === value.data.onUpdateTransactionByUser.id)
      
      if (index !== -1) {
        newTransactions[index].status = newTransaction.status
        setTransactions(newTransactions)
        console.log('Item already existed, status updated')
      } else {
        setTransactions([...transactions, newTransaction]) 
        console.warn('New item identified, adding to the table...', newTransaction)
      }
    } else { 
      const newTransaction = value.data.onUpdateTransaction
      const newTransactions = transactions.slice();
      const index = newTransactions.findIndex(el => el.id === value.data.onUpdateTransaction.id)
      
      if (index !== -1) {
        newTransactions[index].status = newTransaction.status
        setTransactions(newTransactions)
      } else {
        console.error('Item does not exist, update failed', index)
      }
    }
  }
  
  const subscription = () => {
    const sub = API.graphql(graphqlOperation(subscriptions.onUpdateTransaction)).subscribe({
      next: ({ provider, value }) => {
        console.log('subscription data: ', value.data)
        console.log('subscription provider: ', provider)
        updateValue(value)
        console.log('subscription function: ', sub)
      },
      error: error => console.warn('subs error: ', error)
    })
    setObservers(sub)
    setToast({show: true, message: "Started Subscription on ALL items"})
  }

  const subscriptionId = () => {
    const sub = API.graphql(graphqlOperation(subscriptions.onUpdateSpecificTransaction, { id: uuid })).subscribe({
      next: ({ provider, value }) => {
        console.log('subscription data: ', value.data)
        console.log('subscription provider: ', provider)
        updateValue(value)
        console.log('subscription function: ', sub)        
      },
      error: error => console.warn('subs error: ', error)
    })
    setObservers(sub)
    setToast({show: true, message: `Subscription on ID ${uuid} started`})
  }

  const subscriptionUser = () => {
    const sub = API.graphql(graphqlOperation(subscriptions.onUpdateTransactionByUser, { user: username })).subscribe({
      next: ({ provider, value }) => {
        console.log('subscription data: ', value.data)
        console.log('subscription provider: ', provider)
        updateValue(value)
        console.log('subscription function: ', sub) 
      },
      error: error => console.warn('subs error: ', error)
    })
    setObservers(sub)
    setToast({show: true, message: `Subscription on USER ${username} started`})
  }

  const stopSubscription = () => {
    observers.unsubscribe();
    setToast({show: true, message: "Stopped subscribing"})
  }

  const updateTransaction = async () => {
    const updateDetails = { 
      id: uuid, 
      user: username,
      status: status
    }

    await API.graphql(graphqlOperation(mutations.updateTransaction, { input: updateDetails }))
      .then((data) => {
        console.log('updated item: ', data);
        setToast({show: true, level: 'bg-success', message: 'item updated successfully'})
      })
      .catch((err) => {
        console.error('item update gone wrong', err);
        setToast({show: true, level: 'bg-warning', message: 'error updating item'})
      });
  }

  const createTransaction = async () => {
    const createDetails = {
      id: uuid || uuidv4(),
      status: status || 'NEW',
      user: username || faker.internet.userName(),
      originIP: faker.internet.ipv4()
    }

    await API.graphql(graphqlOperation(mutations.createTransaction, { input: createDetails }))
      .then((data) => {
        console.log('created item: ', data)
        console.log(observers._state)
        if (observers._state === 'closed' || observers._state === undefined) {
          setTransactions([...transactions, data.data.createTransaction])
        }
        setToast({show: true, level: 'bg-success', message: 'item created successfully'})
      })
      .catch((err) => {
        console.warn('create items error', err)
        setToast({show: true, level: 'bg-warning', message: 'item creation failed'})
      });
  }

  const listTransactions = async () => {
    const data = await API.graphql(graphqlOperation(queries.listTransactions))
      .then((response) => {
        setTransactions(data.data.listTransactions.items);
        setToast({show: true, level: 'bg-success', message: 'items listed successfully'})
      })
      .catch((err) => {
        console.warn('list items error', err);
        setToast({show: true, level: 'bg-warning', message: 'items listing failed'})
      });
  }

  const getTransaction = async () => {
    const data = await API.graphql(graphqlOperation(queries.getTransaction, { id: uuid, user: username }))
      .then((response) => {
        setTransactions([data.data.getTransaction]);
        setToast({show: true, level: 'bg-success', message: 'got item successfully'})
      })
      .catch((err) => {
        console.warn('get item error', err);
        setToast({show: true, level: 'bg-warning', message: 'get item failed'})
      })
  }

  const handleToast = () => {
    setToast({show: false, message: ''})
  }

  return (
    <div className='container-fluid py-2'>
      <div className='row py-2 justify-content-center'>
        <div className='col-md-4'>
          <div class={toast.show ? `toast show ${toast.level} text-white` : 'toast hidden'}>
            <div class="d-flex">
              <div class='toast-body'>
                {toast.show ? toast.message : ''}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" onClick={handleToast} />
            </div>
          </div>
        </div>
        <div className='col-xs-6 col-md-8 card'>
          <label className='card-title'>Data to be used for an update (new items will be auto filled)</label>
        </div>
      </div>
      <div className='row justify-content-center'>
        <div className='col-xs-6 col-md-4 card border-light py-4'>
          <div className='btn-group px-4'>
            <button className='btn btn-outline-dark me-2' onClick={subscription}>Start SUBSCRIPTION on all items</button>
            <button className='btn btn-outline-dark me-2' onClick={subscriptionId}>Start SUBSCRIPTION on specific ID</button>
            <button className='btn btn-outline-dark me-2' onClick={subscriptionUser}>Start SUBSCRIPTION on all items for specific USER</button>
          </div>
          <div className='btn-group p-4'>
            <button className='btn btn-outline-dark me-2' onClick={stopSubscription}>Stop SUBSCRIPTION on all items</button>
            <button className='btn btn-outline-dark me-2' onClick={stopSubscription}>Stop SUBSCRIPTION on specific ID</button>
            <button className='btn btn-outline-dark me-2' onClick={stopSubscription}>Stop SUBSCRIPTION on all items for specific USER</button>
          </div>
          <div className='btn-group'>
            <button className='btn btn-outline-primary me-2' onClick={createTransaction}>CREATE a transaction</button>
            <button className='btn btn-outline-success me-2' onClick={updateTransaction}>UPDATE the transaction</button>
            <button className='btn btn-outline-danger me-2' onClick={listTransactions}>LIST all transactions</button>
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
