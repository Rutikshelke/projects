import { combineReducers } from '@reduxjs/toolkit';

import themeReducer from '../slices/themeSlice';
import appReducer from '../slices/appSlice';
import authReducer from '../slices/authSlice';


const newRed = combineReducers({
    app: appReducer,
    theme: themeReducer,
    auth: authReducer,
});

const rootReducer = (state, action) => {
    if (action.type === 'RESET_STORE') {
        state = undefined;
    }
    return newRed(state, action);
};

export default rootReducer;