import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppDispatch } from '../reducers/store'
import { setContents } from './data'

/**
 * Removes duplicate objects from an array based on a unique key.
 * Keeps the first occurrence of each unique key.
 * * @param {Array<Object>} data The input array of objects.
 * @param {string} key The key to check for uniqueness (e.g., 'currency').
 * @returns {Array<Object>} A new array with unique items.
 */
function removeDuplicates(data: any[], key: string) {
  const seen = new Map();

  return data.filter(item => {
    if (seen.has(item[key])) {
      return false;
    } else {
      seen.set(item[key], true);
      return true;
    }
  });
}

export const getData = createAsyncThunk<void, string, { dispatch: AppDispatch }>('groupedActions/getData', async (string, { dispatch }) => {
    try {
        const { data } = await axios.get(`https://interview.switcheo.com/prices.json`)

        const uniqueData = removeDuplicates(data, 'currency') || [];

        const currencies = uniqueData.map((item: any) => ({
            ...item,
            iconUrl: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${item.currency}.svg`
        }))

        dispatch(setContents(currencies))
    } catch (e) {
        console.error(e)
        throw e
    }
})
