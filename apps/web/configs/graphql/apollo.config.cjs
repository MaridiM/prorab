require('dotenv/config');

const url = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080/graphql';

module.exports = {
  client: {
    service: {
      name: 'prorab-graphql',
      url,
      skipSSLValidation: true,
    },
    includes: ['src/**/*.{ts,tsx,gql,graphql}'],
    excludes: ['node_modules/**', 'src/**/__generated__/**'],
  },
};
