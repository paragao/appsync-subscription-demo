/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDigioDemo = /* GraphQL */ `
  query GetDigioDemo($id: ID!, $user: String!) {
    getDigioDemo(id: $id, user: $user) {
      id
      user
      status
      createdAt
      originIP
    }
  }
`;
export const listDigioDemos = /* GraphQL */ `
  query ListDigioDemos(
    $filter: TableDigioDemoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDigioDemos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        user
        status
        createdAt
        originIP
      }
      nextToken
    }
  }
`;
