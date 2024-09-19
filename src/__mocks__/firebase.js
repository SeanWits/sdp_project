// __mocks__/firebase.js
export const db = {
    collection: jest.fn(),
    doc: jest.fn(),
  };
  
  
  // src/__mocks__/firebase.js
export const getAuth = jest.fn();
export const setPersistence = jest.fn();
export const browserLocalPersistence = jest.fn();
export const getStorage = jest.fn();
export const getAnalytics = jest.fn();
export const getFirestore = jest.fn();


  //export const getDoc = jest.fn();
  export const setDoc = jest.fn();

  export const doc = jest.fn();

export const getDoc = jest.fn(() =>
  Promise.resolve({
    exists: () => true,
    data: () => ({
      restaurant: 'Mock Restaurant',
      date: { toDate: () => new Date() },
      numberOfPeople: 2,
      selectedFood: 'Pizza',
    }),
  })
);
  