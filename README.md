# cinode-api

🚧 **WORK IN PROGRESS** 🚧

Node.js API client for Cinode.

## Installation

`npm install @polarsquad/cinode-api`

## Instructions

To make this work, you'll need to set the following environment variables:

- `CINODE_COMPANY_ID`
- `CINODE_COMPANY_NAME`
- `CINODE_ACCESS_ID`
- `CINODE_ACCESS_SECRET`

The company name is the `yourcompany` part in the Cinode URL. To obtain the other variables, create a personal API account under <https://app.cinode.com/yourcompany/account> and copy the company ID, Access ID and Access secret.

## Links

- [Official Cinode API documentation](https://api.cinode.com/docs/index.html)

## TODO

- Use static (JWT) tokens for the API instead of personal ones
