import { describe, expect, it } from 'vitest'
import { formatMoney, parseMoneyToCents } from '../../../src/domain/money'

describe('money helpers', () => {
  it('parses loose currency input into cents', () => {
    expect(parseMoneyToCents('$1,234.56')).toBe(123456)
    expect(parseMoneyToCents(' -18.1 ')).toBe(1810)
  })

  it('formats cents with stable decimal places', () => {
    expect(formatMoney(50000)).toBe('$500.00')
    expect(formatMoney(-36000)).toBe('-$360.00')
  })
})
