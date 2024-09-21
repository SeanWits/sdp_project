const firebaseMock = {
  initializeApp: jest.fn(),
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  })),
  getFirestore: jest.fn(),
  getStorage: jest.fn(),
  getAnalytics: jest.fn(),
};

module.exports = firebaseMock;