module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/data/mockData.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '\\.d\\.ts$',
    '\\.test\\.(ts|tsx)$',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ['/node_modules/(?!(@react-native|react-native)/)'],
};
