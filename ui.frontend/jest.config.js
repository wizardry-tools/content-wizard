

module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  "transform": {
    "\\.(js|jsx)$": "babel-jest",
    "\\.(ts|tsx)$": "ts-jest"
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!@mui)"
  ]
}