import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export type SearchParams = {
  after?: number | string;
  before?: number | string;
  channels?: number[];
};

export type SearchQuery = {
  displayText: string;
  params: SearchParams;
  timeTag?: string;
};

export type SearchState = {
  query: SearchQuery;
};

const initialState: SearchState = {
  query: {
    displayText: '',
    params: {},
    timeTag: undefined,
  },
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<SearchQuery>) {
      state.query = action.payload;
    },
    clearSearch(state) {
      state.query = initialState.query;
    },
  },
});

export const { setSearch, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
