/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onUpdateSpecificTransaction = /* GraphQL */ `
  subscription OnUpdateSpecificTransaction($id: ID!) {
    onUpdateSpecificTransaction(id: $id) {
      id
      originIP
      status
      user
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateTransactionByUser = /* GraphQL */ `
  subscription OnUpdateTransactionByUser($user: String!) {
    onUpdateTransactionByUser(user: $user) {
      id
      originIP
      status
      user
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
      user
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
      user
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
      user
      createdAt
      updatedAt
    }
  }
`;
