# Document Structures

## Reviews

### restaurants/restaurantID/restaurantReviews/UserID

```js
{
    rating(number);
    review(string);
    dateCreated(timestamp);
}
```

### restaurants/restaurantID/productReviews/UserID

```js
{
    productID(string);
    rating(number);
    review(string);
    dateCreated(timestamp);
}
```

The collection of productReviews will link to each menu item through a productID.
