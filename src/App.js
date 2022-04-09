import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import React, { useState, useEffect } from 'react'; 
import { v4 as uuidv4 } from 'uuid';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import * as subscriptions from './graphql/subscriptions';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig)

function App() {

  const [username, setUsername] = useState('');
  const [uuid, setUuid] = useState('');
  const [ip, setIp] = useState('192.168.0.1');
  const [status, setStatus] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    //getIp();
    subscription.unsubscribe();
  });

  const getIp = () => {
    const ip2 = axios({
      url: '/',
      method: 'GET',
      baseURL: 'https://checkip.amazonaws.com',
      headers: { 'Access-Control-Allow-Headers': '*'}
    })
      .then(res => {
        console.log('data: ', res)
        console.log(res)
      })
  }

  const getDateTime = () => {
    const date = new Date().toISOString()
    setDateTime(date)
  }

  const updateDetails = { 
    id: uuid, 
    user: username,
    status: status
  }

  const createDetails = {
    id: uuid,
    status: status,
    user: username,
    originIp: ip,
    createdAt: dateTime
  }

  const getDetails = {
    id: uuid,
    user: username
  }

  const subscription = API.graphql(graphqlOperation(subscriptions.onUpdateDigioDemo)).subscribe({
    next: ({ provider, value }) => {
      console.log('subs data: ', value);
      //update the array with the new values
      const newTransaction = value.data.onUpdateDigioDemo

      //copy the state array - transactions
      const newTransactions = transactions.slice();

      //find the index where the item is located 
      const index = newTransactions.findIndex(el => el.id === uuid)
      
      if (index != -1) {
        //update the value
        newTransactions[index].status = newTransaction.status
        
        //finally update the state with the new information
        setTransactions(newTransactions)
      } else {
        console.error('couldn\'t find item in the array', index)
      }
    },
    error: error => console.warn('subs error: ', error)
  });

  const updateTransaction = async () => {
    await API.graphql(graphqlOperation(mutations.updateDigioDemo, { input: updateDetails }))
      .then((data) => {
        console.log('updated: ', data)
      });

    subscription.unsubscribe();
  }

  const createTransaction = async () => {
    getDateTime();
    await API.graphql(graphqlOperation(mutations.createDigioDemo, { input: createDetails }))
      .then((data) => {
        console.log('created: ', data)
      });
  }

  const listTransactions = async () => {
    const data = await API.graphql(graphqlOperation(queries.listDigioDemos, {}));
    setTransactions(data.data.listDigioDemos.items)
  }

  const getTransactions = async () => {
    await API.graphql(graphqlOperation(queries.getDigioDemo, {input: getDetails }));
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="content">
          <div className="left">
            <label>Unique ID:</label>
            <input type="text" onChange={(e) => setUuid(e.target.value)} />
            <button onClick={() => setUuid(uuidv4())}>Generate UUID</button>
          </div>
          <div className="left">
            <label>Username: </label>
            <input type="text" onChange={(e) => setUsername(e.target.value)} label="setUsername" />
          </div>
          <div className="left">
            <label>Status:</label>
            <input type="text" onChange={(e) => setStatus(e.target.value)} label="setStatus" />
          </div>
          <div className="right">
            <label>UUID: {uuid}</label>
            <label>Username: {username}</label>
            <label>Status: {status}</label>
          </div>
        </div>
        <div className='content'>
          <button onClick={createTransaction}>
            Click me to CREATE a transaction
          </button>
          <button onClick={updateTransaction}>
            Click me to UPDATE the transaction
          </button>
          <button onClick={listTransactions}>
            Click me to LIST all transactions
          </button>
        </div>
        <div>
          <table>
            <tr>
              <th>Item ID</th>
              <th>Username</th>
              <th>Status</th>
              <th>Origin IP</th>
              <th>createdAt</th>
            </tr>
            {
              transactions.map((item, id) => {
                return (
                  <tr key={id}>
                    <td>{item.id}</td>
                    <td>{item.user}</td>
                    <td>{item.status}</td>
                    <td>{item.originIp}</td>
                    <td>{item.createdAt}</td>
                  </tr>
                )      
              })
            }
          </table>
        </div>
      </header>
    </div>
  );
}

export default App;
