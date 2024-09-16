// __mocks__/firebase.js
export const db = {
    collection: jest.fn(),
    doc: jest.fn(),
  };
  
  export const getDoc = jest.fn();
  export const setDoc = jest.fn();
  