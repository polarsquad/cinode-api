# @polarsquad/cinode-api

**Unofficial** Node.js API client for [Cinode](https://cinode.com).

> **NOTE:** 🚧 This client is still very much in development and shouldn't be considered stable before version 1.0.0 🚧

This client has support for:

- Interacting with skills
- Interacting with project assignments
- _More to follow..._

## Installation

`npm install --save @polarsquad/cinode-api`

## Configuration

**NOTE:** This library is moving away from environment variable based configuration but it is still a work in progress.

To make this work, you'll need to set the following environment variables:

- `CINODE_COMPANY_ID`
- `CINODE_COMPANY_NAME`
- `CINODE_ACCESS_ID`
- `CINODE_ACCESS_SECRET`

The company name is the `yourcompany` part in the Cinode URL. To obtain the other variables, create a personal API
account under <https://app.cinode.com/yourcompany/account> and copy the company ID, Access ID and Access secret.

## Development

Create a placeholder `.env` file for development:

```sh
echo -e "CINODE_COMPANY_ID=1234\nCINODE_COMPANY_NAME=foobarbaz\nCINODE_ACCESS_ID=foo\nCINODE_ACCESS_SECRET=bar" > .env
```

### Useful commands

🚀 Run tests: `npm run test`

🔧 Lint code: `npm run lint-fix`

🖌️ Autoformat code: `npm run prettier-fix`

### Releasing

1. Create new branch
1. Update version in `package.json` based on changes (we follow [semantic versioning](https://semver.org/))
1. Run `npm install` to update `package-lock.json`
1. Create Pull Request with title "Release x.y.z" and description for changelog
1. Merge changes to `main`
1. Tag & release with the format "vX.Y.Z" (e.g. `0.3.0` in `package.json` becomes `v0.3.0` as tag title)
1. GitHub Actions publishes the version in npm

## Links

- [Official Cinode API documentation](https://api.cinode.com/docs/index.html)

## TODO

- Use static (JWT) tokens for the API instead of personal ones
