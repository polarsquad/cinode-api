# @polarsquad/cinode-api

**Unofficial** Node.js API client for [Cinode](https://cinode.com).

> 🚧 This client is still very much in development and might change drastically 🚧

This client has support for:

- Interacting with skills
- Interacting with project assignments
- _More to follow..._

## Installation

`npm install --save @polarsquad/cinode-api`

## Configuration

1. Obtain API tokens and configuration from: <https://app.cinode.com/yourcompany/account>
    - The `yourcompany` part of the URL is your company name in the configuration
1. Import and configure the client:

    ```typescript
    import { Api } from '@polarsquad/cinode-api/api'
    import clientBuilder from '@polarsquad/cinode-api/client'
    import { CinodeService } from '@polarsquad/cinode-api/service'

    const api = new Api(
      {
        id: 1234,               // Company ID
        name: 'yourcompany'     // Company name
      },
      clientBuilder(
        'cinodeaccessid',       // Cinode Access ID
        'cinodeaccessecret'     // Cinode Access Secret
      )
    )
    const service = new CinodeService(api)
    ```

## Development

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

## License

See [LICENSE](./LICENSE) for more details.

## TODO

- Use static (JWT) tokens for the API instead of personal ones
