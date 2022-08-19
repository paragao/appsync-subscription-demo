/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTransaction = /* GraphQL */ `
  mutation CreateTransaction(
    $input: CreateTransactionInput!
    $condition: ModelTransactionConditionInput
  ) {
    createTransaction(input: $input, condition: $condition) {
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
export const updateTransaction = /* GraphQL */ `
  mutation UpdateTransaction(
    $input: UpdateTransactionInput!
    $condition: ModelTransactionConditionInput
  ) {
    updateTransaction(input: $input, condition: $condition) {
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
export const deleteTransaction = /* GraphQL */ `
  mutation DeleteTransaction(
    $input: DeleteTransactionInput!
    $condition: ModelTransactionConditionInput
  ) {
    deleteTransaction(input: $input, condition: $condition) {
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
export const createAccountBalance = /* GraphQL */ `
  mutation CreateAccountBalance(
    $input: CreateAccountBalanceInput!
    $condition: ModelAccountBalanceConditionInput
  ) {
    createAccountBalance(input: $input, condition: $condition) {
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
export const updateAccountBalance = /* GraphQL */ `
  mutation UpdateAccountBalance(
    $input: UpdateAccountBalanceInput!
    $condition: ModelAccountBalanceConditionInput
  ) {
    updateAccountBalance(input: $input, condition: $condition) {
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
export const deleteAccountBalance = /* GraphQL */ `
  mutation DeleteAccountBalance(
    $input: DeleteAccountBalanceInput!
    $condition: ModelAccountBalanceConditionInput
  ) {
    deleteAccountBalance(input: $input, condition: $condition) {
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
export const createSymbol = /* GraphQL */ `
  mutation CreateSymbol(
    $input: CreateSymbolInput!
    $condition: ModelSymbolConditionInput
  ) {
    createSymbol(input: $input, condition: $condition) {
      name
      price
      createdAt
      updatedAt
      accountBalanceSymbolsId
    }
  }
`;
export const updateSymbol = /* GraphQL */ `
  mutation UpdateSymbol(
    $input: UpdateSymbolInput!
    $condition: ModelSymbolConditionInput
  ) {
    updateSymbol(input: $input, condition: $condition) {
      name
      price
      createdAt
      updatedAt
      accountBalanceSymbolsId
    }
  }
`;
export const deleteSymbol = /* GraphQL */ `
  mutation DeleteSymbol(
    $input: DeleteSymbolInput!
    $condition: ModelSymbolConditionInput
  ) {
    deleteSymbol(input: $input, condition: $condition) {
      name
      price
      createdAt
      updatedAt
      accountBalanceSymbolsId
    }
  }
`;
