import React, { useEffect, useState } from 'react';
import { db, doc, getDoc} from './firebase';

function Test() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userRef = doc(db, 'users', 'GUuNErry035Y9L5q5fqa');
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setError('No such user!');
        }
      } catch (err) {
        setError('Error fetching user data: ' + err.message);
      }
    }

    fetchUserData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Data:</h2>
      <p>Name: {userData.name}</p>
      <p>Surname: {userData.surname}</p>
    </div>
  );
}

export default Test;