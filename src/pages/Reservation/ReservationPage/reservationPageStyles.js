export const styles = {
    pageWrapper: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#f4f4f9',
    },

    flexContainer: {
        flex: '1 0 auto', // Allows the container to grow and push the footer down
    },


    container: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '800px', // Increased width to better fit the reservations
        textAlign: 'center',
    },
    yellowBox: {
        backgroundColor: '#fcb040',
        padding: '10px',
        color: '#003b5c',
        borderRadius: '15px',
        marginBottom: '20px',
    },
    reservationItem: {
        backgroundColor: '#003b5c', // Orange background for each reservation
        padding: '20px',
        color: '#fcb040',
        borderRadius: '8px',
        marginBottom: '15px',
        position: 'relative',
    },
    cancelButton: {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '10px 20px',
        backgroundColor: '#fcb040',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    label: {
        display: 'block',
        marginTop: '20px',
        fontSize: '16px',
        color: '#003b5c',
    },
    input: {
        marginTop: '10px',
        padding: '10px',
        width: '92.5%',
        fontSize: '16px',
        border: '1px solid #003b5c',
        borderRadius: '5px',
    },
    button: {
        marginTop: '30px',
        padding: '15px',
        width: '100%',
        fontSize: '16px',
        backgroundColor: '#003b5c',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },

    // Add these to your styles object
    errorMessage: {
        color: 'red',
        marginBottom: '15px',
    },
    retryButton: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#fcb040',
        color: '#003b5c',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};
