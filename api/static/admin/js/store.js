import { createStore, combineReducers } from 'redux';
import { browserHistory } from 'react-router';
import { routerReducer } from 'react-router-redux';

const defaultState = {
  loggedIn: false,
};

export default function authentication(state = defaultState, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        loggedIn: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        loggedIn: false,
      };
    default:
      return state;
  }
}

export const store = createStore(
  combineReducers({
    routing: routerReducer,
    authentication,
  }),
  applyMiddleware(browserHistory));
