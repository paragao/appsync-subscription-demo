/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDigioDemo = /* GraphQL */ `
  subscription OnCreateDigioDemo {
    onCreateDigioDemo {
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
/*When you want to create a specific subscription based on a parameter*/ 
export const onSpecificUpdate = /* GraphQL */ `
  subscription OnSpecificUpdate (
    $id: String!,
    $user: String!
  ) {
    onSpecificUpdate (
      id: $id,
      user: $user
    ) {
      id
      user
      status
      createdAt
      originIP
    }
  }
`;
export const onDeleteDigioDemo = /* GraphQL */ `
  subscription OnDeleteDigioDemo {
    onDeleteDigioDemo {
      id
      user
      status
      createdAt
      originIP
    }
  }
`;
