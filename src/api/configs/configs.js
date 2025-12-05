export const BASE_URL_TRANSACTION = process.env.NODE_ENV === 'production' ? 'https://api.wowlibre.com/transaction' : 'http://localhost:8092/transaction';
export const BASE_URL = process.env.NODE_ENV === 'production' ?'https://api.wowlibre.com/core': 'http://localhost:8091/core';
