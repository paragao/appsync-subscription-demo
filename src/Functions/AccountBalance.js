import { API, graphqlOperation } from 'aws-amplify';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
    
const createAccount = async (account, username) => {
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
}

const createAccountBalance = async (createDetails) => {
    await API.graphql(graphqlOperation(mutations.createAccountBalance, { input: createDetails }))
        .then((response) => {
            console.log('new account id: ', response.data.createAccountBalance.id);
            return {
                state: 'NEW',
                accountId: response.data.createAccountBalance.id,
                accountBalance: response.data.createAccountBalance.balance
            }
            //setAccountState('NEW');
            //setAccount(response.data.createAccountBalance.id);
            //setBalance(response.data.createAccountBalance.balance);
        })
        .catch((err) => {
            console.warn('create account error', err);
        });
}

const getAccountBalance = async (getDetails) => {  
    await API.graphql(graphqlOperation(queries.getAccountBalance, getDetails ))
        .then((response) => { 
        if (response.data.getAccountBalance !== null) {
            return { 
                state: 'OLD',
                accountId: response.data.getAccountBalance.id,
                accountBalance: response.data.getAccountBalance.balance,
                transactions: response.data.getAccountBalance.transactions.items
            }
            
            //setAccountState('OLD');
            //setAccount(response.data.getAccountBalance.id);
            //setBalance(response.data.getAccountBalance.balance);
            //setTransactions(response.data.getAccountBalance.transactions.items)
        } else {
            return { 
                state: 'NEW'
            }
        }
    })
}

const deleteAccountBalance = async (account, username) => {
    await API.graphql(graphqlOperation(mutations.deleteAccountBalance, { input: { id: account, email: username }}))
    .then(() => {
        deleteAllTransactions();
        setAccountDeleted(true);
    })
    .catch((err) => {
        console.error('could not delete the account ', err)
    })
}

export { createAccount, getAccountBalance, deleteAccountBalance };