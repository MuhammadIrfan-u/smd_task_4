import React, { createContext, useState } from 'react';

export const ReadingListContext = createContext();

export function ReadingListProvider({ children }) {
  // state will hold an object mapping bookId to status.
  // Example: { '1': 'Read', '2': 'Half Done' }
  const [readingList, setReadingList] = useState({});

  const addToReadingList = (bookId) => {
    setReadingList((prev) => {
      if (prev[bookId]) {
        return prev; // already in list
      }
      return { ...prev, [bookId]: 'Not Read' };
    });
  };

  const updateStatus = (bookId, status) => {
    setReadingList((prev) => ({
      ...prev,
      [bookId]: status,
    }));
  };

  const removeFromList = (bookId) => {
    setReadingList((prev) => {
      const newState = { ...prev };
      delete newState[bookId];
      return newState;
    });
  };

  return (
    <ReadingListContext.Provider value={{ readingList, addToReadingList, updateStatus, removeFromList }}>
      {children}
    </ReadingListContext.Provider>
  );
}
