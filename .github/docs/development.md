# Development

## Workspace setup

Install dependencies from the repository's root directory (this will also set up the example project workspace):

```bash
yarn
```

## ProjectID setup

The example project has `app.config.js` file. Add your Project ID there

``` json
extra: {
  ...
  PROJECT_ID: process.env.PROJECT_ID || "YOUR_PROJECT_ID"
},
```

or add it before running commands in your terminal:

```bash
PROJECT_ID="YOUR_PROJECT_ID" yarn example ios
```


To create your ProjectID, head to [cloud.walletconnect.com](https://cloud.walletconnect.com/)

## Commands

Execute all commands from the root.

- `yarn example ios` - Run the example project in an iOS simulator.
- `yarn example android` - Run the example project in an Android simulator.
- `yarn lint` - Run the linter.
- `yarn typecheck` - Run typescript checks.
- `yarn test` - Run jest tests.
