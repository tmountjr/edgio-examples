# Vue Storefron Shopify Tenplate

Vue Storefront 2 template for Shopify.

> Please keep in mind this project is in beta phase. Please report all bugs you will spot on GitHub or help us by reolving them by yourself. It will help us to resolve them faster and make this project production-ready sooner!

## Setup

1. Fill in the project credentials in `middleware.config.js` (env. variables suggested)

```js
module.exports = {
  integrations: {
    shopify: {
      location: '@vue-storefront/shopify-api/server',
      configuration: {
        api: {
          domain: '<SHOPIFY_DOMAIN>',
          storefrontAccessToken: '<SHOPIFY_ACCESS_TOKEN>'
        },
        currency: 'USD',
        country: 'US'
      }
    }
  }
};
```

2. Run the project

``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org) / [Vue Storefront Docs](https://docs.vuestorefront.io/v2/).

## Contributing

This repository is autogenerated. If you want to contribute to Shopify integration please use https://github.com/vuestorefront/shopify.