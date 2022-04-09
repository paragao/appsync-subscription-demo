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

  const [username, setUsername] = useState('paragao');
  const [uuid, setUuid] = useState('');
  const [ip, setIp] = useState();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    //getIp();
    subs();
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

  const updateDetails = { 
    id: 'Af2tmbH9nFkUOG43pK0XPGIvldp79XYB', 
    user: 'paragao',
    status: "NEW"
  }

  const createDetails = {
    id: uuid,
    status: "ANDAMENTO",
    user: username,
    originIp: ip
  }

  const getDetails = {
    id: "",
    user: ""
  }

  const subs = () => {
    API.graphql(graphqlOperation(subscriptions.onUpdateDigioDemo)).subscribe({
      next: ({ provider, value }) => {
        console.log('subs data: ', value);
        //update the array with the new values
        //use .slice to copy the state array, then change it, and then update using setState

        //get updated information
        const newTransaction = value.data.onUpdateDigioDemo

        //copy the state array - transactions
        const newTransactions = transactions.slice();

        //change the value 
        const index = newTransactions.findIndex(el => el.id === 'Af2tmbH9nFkUOG43pK0XPGIvldp79XYB')
        console.log('index: ', index)

        //finally update the state with the new information
        setTransactions(newTransactions)
      },
      error: error => console.warn('subs error: ', error)
    });
  };

  const updateTransaction = async () => {
    await API.graphql(graphqlOperation(mutations.updateDigioDemo, { input: updateDetails }))
      .then((data) => {
        console.log('updated: ', data)
      });
  }

  const createTransaction = async () => {
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
        <div>
          <div>Unique ID: {uuid}</div>
          <div><button onClick={() => setUuid(uuidv4())}>Generate UUID</button></div>
          <div>Username: {username}</div>
          <div><input type="text" onChange={(e) => setUsername(e.target.value)} label="set username" /></div>
          <div>Origin IP: {ip}</div>
          <div><button onClick={() => setIp(getIp())}>Get IP</button></div>
          <div></div>
        </div>
        <div>
          <button onClick={createTransaction}>
            Click me to CREATE a transaction
          </button><br />
          <button onClick={updateTransaction}>
            Click me to UPDATE the transaction
          </button><br />
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
