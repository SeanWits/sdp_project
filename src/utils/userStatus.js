import React, { useContext, useEffect } from 'react';
import { UserContext } from './userContext';

const UserStatus = () => {
  const { user, loading } = useContext(UserContext);

  useEffect(() => {
    if (!loading) {
      console.log(user ? `User UID: ${user.uid}` : 'no user');
    }
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? `User UID: ${user.uid}` : 'no user'}
    </div>
  );
};

export default UserStatus;