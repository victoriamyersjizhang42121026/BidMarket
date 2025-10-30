# BidMarket Test Suite

This directory contains comprehensive unit tests for the BidMarket (ShieldedAuction) platform.

## Test Structure

```
tests/
├── fhe.test.ts          # FHE encryption/decryption tests
├── auction.test.ts      # Auction contract logic tests
├── utils.test.ts        # Utility function tests
└── README.md           # This file
```

## Test Files Overview

### 1. `fhe.test.ts` - FHE Encryption Tests

Tests for Fully Homomorphic Encryption functionality:

- **SDK Initialization**
  - ✓ Successful initialization
  - ✓ Instance reuse/caching
  - ✓ Error handling for missing providers
  - ✓ Multi-wallet support (MetaMask, OKX, Coinbase)

- **Encryption (encryptUint64)**
  - ✓ Successful encryption of values
  - ✓ Different value ranges (0 to MAX_SAFE_INTEGER)
  - ✓ Address format validation
  - ✓ Hex output format verification

- **Decryption (decryptUint64)**
  - ✓ Successful decryption
  - ✓ Error handling (returns null on failure)
  - ✓ Invalid input handling

- **Error Handling**
  - ✓ SDK initialization failures
  - ✓ Network errors during encryption
  - ✓ Malformed data handling

### 2. `auction.test.ts` - Auction Logic Tests

Tests for core auction functionality:

- **Auction Creation**
  - ✓ Parameter validation
  - ✓ Name requirements
  - ✓ Address validation
  - ✓ Initial state verification

- **Timing Logic**
  - ✓ Bidding phase validation
  - ✓ Reveal phase timing
  - ✓ Auction expiration
  - ✓ Phase transitions

- **Bid Validation**
  - ✓ Positive amount validation
  - ✓ Zero/negative bid rejection
  - ✓ Maximum value handling
  - ✓ Bid comparison logic

- **Winner Determination**
  - ✓ Highest bidder identification
  - ✓ Single bidder scenarios
  - ✓ No bids scenarios

- **Edge Cases**
  - ✓ No bids handling
  - ✓ Long auction names
  - ✓ Small time windows
  - ✓ Multiple simultaneous auctions

### 3. `utils.test.ts` - Utility Function Tests

Tests for helper functions:

- **Address Formatting**
  - ✓ Long address truncation (0x1234...7890)
  - ✓ Custom prefix/suffix lengths
  - ✓ Short address handling

- **Time Formatting**
  - ✓ Days and hours display
  - ✓ Hours and minutes display
  - ✓ Minutes only display
  - ✓ "Ended" status for past times

- **BigInt Formatting**
  - ✓ Wei to ETH conversion
  - ✓ Decimal handling
  - ✓ Different token decimals (18, 6, etc.)
  - ✓ Zero and small amounts

- **Validation**
  - ✓ Ethereum address validation
  - ✓ Numeric input validation
  - ✓ Positive number checks

- **Array Operations**
  - ✓ Remove duplicates by key
  - ✓ Empty array handling
  - ✓ No duplicate scenarios

- **String Operations**
  - ✓ String truncation
  - ✓ Capitalization
  - ✓ Empty string handling

## Running Tests

### Prerequisites

Install testing dependencies:

```bash
yarn add -D vitest @testing-library/react @testing-library/jest-dom @vitest/ui jsdom
```

### Configuration

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Run Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test fhe.test.ts

# Run with UI
yarn test:ui

# Run with coverage
yarn test:coverage

# Watch mode
yarn test --watch
```

## Test Coverage Goals

Target coverage metrics:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Writing New Tests

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup code
  });

  describe('Sub-feature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices

1. **Descriptive Names**
   - Use clear, descriptive test names
   - Follow pattern: "should [expected behavior] when [condition]"

2. **Arrange-Act-Assert**
   - Separate test into three clear sections
   - Makes tests easier to read and maintain

3. **Test One Thing**
   - Each test should verify one specific behavior
   - Split complex tests into multiple smaller tests

4. **Mock External Dependencies**
   - Mock blockchain calls, FHE SDK, wallet providers
   - Keep tests fast and deterministic

5. **Edge Cases**
   - Test boundary conditions
   - Test error scenarios
   - Test with invalid inputs

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn test
      - run: yarn test:coverage
```

## Debugging Tests

### VSCode Configuration

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "yarn",
  "runtimeArgs": ["test", "--inspect-brk"],
  "console": "integratedTerminal"
}
```

### Browser Debugging

```bash
# Open Vitest UI for interactive debugging
yarn test:ui
```

## Common Issues

### Issue: "Cannot find module '@/lib/fhe'"

**Solution**: Check `tsconfig.json` path aliases match `vitest.config.ts`

### Issue: "window is not defined"

**Solution**: Ensure `environment: 'jsdom'` in vitest config

### Issue: "Mock not working"

**Solution**: Use `vi.mock()` before imports:

```typescript
vi.mock('../src/lib/fhe', () => ({
  initializeFHE: vi.fn(),
  encryptUint64: vi.fn(),
}));
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Wagmi Testing](https://wagmi.sh/react/guides/testing)
- [Viem Testing Utils](https://viem.sh/docs/utilities/testing.html)

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Maintain coverage above 80%
4. Update this README if adding new test categories

---

**Last Updated**: 2025-10-31
