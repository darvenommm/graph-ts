import type { JestConfigWithTsJest } from 'ts-jest';

console.log(process.cwd());

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: process.cwd(),
  roots: ['<rootDir>/src/test/'],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
  },
};

module.exports = config;
