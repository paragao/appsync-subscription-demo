/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDigioDemo = /* GraphQL */ `
  subscription OnCreateDigioDemo(
    $id: ID
    $user: String
    $status: String
    $createdAt: AWSDateTime
    $originIP: AWSIPAddress
  ) {
    onCreateDigioDemo(
      id: $id
      user: $user
      status: $status
      createdAt: $createdAt
      originIP: $originIP
    ) {
      id
      user
      status
      createdAt
      originIP
    }
  }
`;
export const onUpdateDigioDemo = /* GraphQL */ `
  subscription OnUpdateDigioDemo {
    onUpdateDigioDemo {
      id
      user
      status
      createdAt
      originIP
    }
  }
`;
export const onDeleteDigioDemo = /* GraphQL */ `
  subscription OnDeleteDigioDemo(
    $id: ID
    $user: String
    $status: String
    $createdAt: AWSDateTime
    $originIP: AWSIPAddress
  ) {
    onDeleteDigioDemo(
      id: $id
      user: $user
      status: $status
      createdAt: $createdAt
      originIP: $originIP
    ) {
      id
      user
      status
      createdAt
      originIP
    }
  }
`;
