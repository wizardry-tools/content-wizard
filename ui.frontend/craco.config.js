const config = {
  typescript: {
    enableTypeChecking: true
  },
  babel: {
    presets: [
      [
        "@babel/preset-env",
        {
          "targets": {
            "esmodules": true,
            "node": "20"
          }
        }
      ],
      "@babel/preset-react",
      "@babel/preset-flow",
      "@babel/typescript"
    ],
    plugins: [
      "@emotion",
      "@babel/plugin-transform-runtime",
      ["@babel/plugin-proposal-decorators", { "legacy" : true }]
    ],
    // "env": {
    //   "test": {
    //     "plugins": [
    //       [
    //         "istanbul",
    //         {
    //           "include": [
    //             "src/**.*"
    //           ],
    //           "exclude": [
    //             "dist/**.*",
    //             "node_modules/**.*",
    //             "tests/**.*"
    //           ]
    //         }
    //       ]
    //     ]
    //   }
    // }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "\\.(css|scss)$": 'identity-obj-proxy',
        "^src/(.*)$": "<rootDir>/src/$1"
      },
      transform: {
        "^.+\\.(ts|tsx)$": [
          'ts-jest',
          {
            tsconfig: '<rootDir>/tsconfig.json'
          }
        ]
      },
      transformIgnorePatterns: [
        'node_modules/(?!node-fetch|fetch-blob|data-uri-to-buffer|formdata-polyfill)'
      ]
    }
  }
}

export default config;