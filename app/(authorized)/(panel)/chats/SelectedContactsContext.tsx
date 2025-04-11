'use client'
import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Define the shape of the selected contacts state
type SelectedContactsState = number[];

// Define action types
type SelectedContactsAction =
    | { type: 'ADD_CONTACT', contactId: number }
    | { type: 'REMOVE_CONTACT', contactId: number }
    | { type: 'SET_CONTACTS', contacts: number[] }
    | { type: 'CLEAR_CONTACTS' };

// Reducer function
const selectedContactsReducer = (state: SelectedContactsState, action: SelectedContactsAction): SelectedContactsState => {
    let newState: SelectedContactsState;

    switch (action.type) {
        case 'ADD_CONTACT':
            newState = state.includes(action.contactId) || state.length >= 3
                ? state
                : [...state, action.contactId];
            break;
        case 'REMOVE_CONTACT':
            newState = state.filter(id => id !== action.contactId);
            break;
        case 'SET_CONTACTS':
            newState = action.contacts.slice(0, 3);
            break;
        case 'CLEAR_CONTACTS':
            newState = [];
            break;
        default:
            newState = state;
    }

    // Save to local storage after state changes
    localStorage.setItem('selectedContacts', JSON.stringify(newState));
    return newState;
};

// Create context
const SelectedContactsContext = createContext<SelectedContactsState | undefined>(undefined);
const SelectedContactsDispatchContext = createContext<Dispatch<SelectedContactsAction> | undefined>(undefined);

// Provider component
export function SelectedContactsProvider({ children }: { children: ReactNode }) {
    // Initialize state from local storage or default to empty array
    const initialState = (() => {
        if (typeof window !== 'undefined') {
            const savedContacts = localStorage.getItem('selectedContacts');
            return savedContacts ? JSON.parse(savedContacts) : [];
        }
        return [];
    })();

    const [state, dispatch] = useReducer(selectedContactsReducer, initialState);

    return (
        <SelectedContactsContext.Provider value={state}>
            <SelectedContactsDispatchContext.Provider value={dispatch}>
                {children}
            </SelectedContactsDispatchContext.Provider>
        </SelectedContactsContext.Provider>
    );
}

// Custom hooks for using the context
export function useSelectedContacts() {
    const context = useContext(SelectedContactsContext);
    if (context === undefined) {
        throw new Error('useSelectedContacts must be used within a SelectedContactsProvider');
    }
    return context;
}

export function useSelectedContactsDispatch() {
    const context = useContext(SelectedContactsDispatchContext);
    if (context === undefined) {
        throw new Error('useSelectedContactsDispatch must be used within a SelectedContactsProvider');
    }
    return context;
}