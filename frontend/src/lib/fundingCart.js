const STORAGE_KEY = 'unicap_funding_cart'

/** @typedef {{ id: string, challengeType: '1-step' | '2-step', stepsCount: 1 | 2, accountSize: number, price: number, label: string }} FundingCartItem */

export function getFundingCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistAndNotify(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('funding-cart-updated'))
}

/**
 * @param {Omit<FundingCartItem, 'id'> & { challengeType: '1-step' | '2-step', accountSize: number, price: number, label: string }} item
 */
export function addToFundingCart(item) {
  const id = `${item.challengeType}-${item.accountSize}`
  const cart = getFundingCart()
  const entry = {
    id,
    challengeType: item.challengeType,
    stepsCount: item.challengeType === '1-step' ? 1 : 2,
    accountSize: item.accountSize,
    price: item.price,
    label: item.label
  }
  const idx = cart.findIndex((i) => i.id === id)
  if (idx >= 0) cart[idx] = entry
  else cart.push(entry)
  persistAndNotify(cart)
}

/** @param {string} id */
export function removeFromFundingCart(id) {
  persistAndNotify(getFundingCart().filter((i) => i.id !== id))
}

export function clearFundingCart() {
  persistAndNotify([])
}

export function getFundingCartItemCount() {
  return getFundingCart().length
}
