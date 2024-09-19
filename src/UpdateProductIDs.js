import React, { useState } from 'react';
import { db, doc, getDoc, updateDoc } from './firebase';

const UpdateProductIDs = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');

  const addUniqueProductIDs = async () => {
    setIsUpdating(true);
    setUpdateStatus('Updating product IDs...');
    const restaurantIDs = ['rest001', 'rest002', 'rest003'];

    try {
      for (const restaurantID of restaurantIDs) {
        const restaurantRef = doc(db, 'restaurants', restaurantID);
        const restaurantSnap = await getDoc(restaurantRef);

        if (restaurantSnap.exists()) {
          const restaurantData = restaurantSnap.data();
          let updatedCategories = [];
          let productCounter = 1;

          for (const category of restaurantData.categories) {
            let updatedMenuItems = category.menu_items.map(item => ({
              ...item,
              productID: `${restaurantID}_${String(productCounter++).padStart(5, '0')}`
            }));

            updatedCategories.push({
              ...category,
              menu_items: updatedMenuItems
            });
          }

          await updateDoc(restaurantRef, {
            categories: updatedCategories
          });

          setUpdateStatus(prevStatus => prevStatus + `\nUpdated restaurant ${restaurantID} with unique productIDs`);
        } else {
          setUpdateStatus(prevStatus => prevStatus + `\nRestaurant ${restaurantID} not found`);
        }
      }
      setUpdateStatus(prevStatus => prevStatus + '\nAll updates completed successfully!');
    } catch (error) {
      console.error("Error updating product IDs:", error);
      setUpdateStatus(`Error: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <h2>Update Product IDs</h2>
      <button onClick={addUniqueProductIDs} disabled={isUpdating}>
        {isUpdating ? 'Updating...' : 'Add Unique Product IDs'}
      </button>
      {updateStatus && (
        <div style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>
          <h3>Update Status:</h3>
          <p>{updateStatus}</p>
        </div>
      )}
    </div>
  );
};

export default UpdateProductIDs;