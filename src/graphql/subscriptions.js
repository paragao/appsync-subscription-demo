/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onUpdateSpecificTransaction = /* GraphQL */ `
  subscription OnUpdateSpecificTransaction($id: ID!) {
    onUpdateSpecificTransaction(id: $id) {
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
export const onUpdateTransactionBySender = /* GraphQL */ `
  subscription OnUpdateTransactionBySender($sender: String!) {
    onUpdateTransactionBySender(sender: $sender) {
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
export const onUpdateTransactionByReceiver = /* GraphQL */ `
  subscription OnUpdateTransactionByReceiver($receiver: String!) {
    onUpdateTransactionByReceiver(receiver: $receiver) {
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
export const onCreateTransaction = /* GraphQL */ `
  subscription OnCreateTransaction {
    onCreateTransaction {
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
export const onUpdateTransaction = /* GraphQL */ `
  subscription OnUpdateTransaction {
    onUpdateTransaction {
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
export const onDeleteTransaction = /* GraphQL */ `
  subscription OnDeleteTransaction {
    onDeleteTransaction {
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
export const onCreateAccountBalance = /* GraphQL */ `
  subscription OnCreateAccountBalance {
    onCreateAccountBalance {
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
export const onUpdateAccountBalance = /* GraphQL */ `
  subscription OnUpdateAccountBalance {
    onUpdateAccountBalance {
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
export const onDeleteAccountBalance = /* GraphQL */ `
  subscription OnDeleteAccountBalance {
    onDeleteAccountBalance {
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
export const onCreateSymbol = /* GraphQL */ `
  subscription OnCreateSymbol {
    onCreateSymbol {
      name
      price
      createdAt
      updatedAt
      accountBalanceSymbolsId
    }
  }
`;
export const onUpdateSymbol = /* GraphQL */ `
  subscription OnUpdateSymbol {
    onUpdateSymbol {
      name
      price
      createdAt
      updatedAt
      accountBalanceSymbolsId
    }
  }
`;
export const onDeleteSymbol = /* GraphQL */ `
  subscription OnDeleteSymbol {
    onDeleteSymbol {
      name
      price
      createdAt
      updatedAt
      accountBalanceSymbolsId
    }
  }
`;
