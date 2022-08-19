/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTransaction = /* GraphQL */ `
  query GetTransaction($id: ID!, $sender: String!) {
    getTransaction(id: $id, sender: $sender) {
      id
      originIP
      status
      sender
      receiver
      accountId
      amount
      type
      createdAt
      updatedAt
    }
  }
`;
export const listTransactions = /* GraphQL */ `
  query ListTransactions(
    $id: ID
    $sender: ModelStringKeyConditionInput
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listTransactions(
      id: $id
      sender: $sender
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        originIP
        status
        sender
        receiver
        accountId
        amount
        type
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getAccountBalance = /* GraphQL */ `
  query GetAccountBalance($id: String!, $email: AWSEmail!) {
    getAccountBalance(id: $id, email: $email) {
      id
      email
      balance
      active
      transactions {
        items {
          id
          originIP
          status
          sender
          receiver
          accountId
          amount
          type
          createdAt
          updatedAt
        }
        nextToken
      }
      symbols {
        items {
          name
          price
          createdAt
          updatedAt
          accountBalanceSymbolsId
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listAccountBalances = /* GraphQL */ `
  query ListAccountBalances(
    $id: String
    $email: ModelStringKeyConditionInput
    $filter: ModelAccountBalanceFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAccountBalances(
      id: $id
      email: $email
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        email
        balance
        active
        transactions {
          nextToken
        }
        symbols {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getSymbol = /* GraphQL */ `
  query GetSymbol($name: String!) {
    getSymbol(name: $name) {
      name
      price
      createdAt
      updatedAt
      accountBalanceSymbolsId
    }
  }
`;
export const listSymbols = /* GraphQL */ `
  query ListSymbols(
    $name: String
    $filter: ModelSymbolFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSymbols(
      name: $name
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        name
        price
        createdAt
        updatedAt
        accountBalanceSymbolsId
      }
      nextToken
    }
  }
`;
export const transactionsByEmail = /* GraphQL */ `
  query TransactionsByEmail(
    $receiver: String!
    $sender: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByEmail(
      receiver: $receiver
      sender: $sender
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        originIP
        status
        sender
        receiver
        accountId
        amount
        type
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const transactionsByStatus = /* GraphQL */ `
  query TransactionsByStatus(
    $type: String!
    $status: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByStatus(
      type: $type
      status: $status
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        originIP
        status
        sender
        receiver
        accountId
        amount
        type
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
