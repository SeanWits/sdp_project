export const styles = {
  pageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f9',
  },

  flexContainer: {
    flex: '1 0 auto', // Allows the container to grow and push the footer down
  },

  container: {
    backgroundColor: '#003b5c',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '95vw', // Make the width responsive to the screen size (95% of the viewport width)
    maxWidth: '100%', // Remove fixed maxWidth and allow it to fill the screen
    textAlign: 'center',
  },

  yellowBox: {
    backgroundColor: '#fcb040',
    padding: '10px',
    color:  '#003b5c',
    borderRadius: '15px',
    marginBottom: '20px',
  },

  reservationItem: {
    backgroundColor: 'white',
    padding: '20px',
    color:  '#003b5c',
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
    backgroundColor:  '#fcb040', 
    color: '#003b5c',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },

  label: {
    display: 'block',
    marginTop: '20px',
    fontSize: '16px',
    color: '#fcb040',
  },

  input: {
    marginTop: '10px',
    padding: '10px',
    width: '100%',
    fontSize: '16px',
    border: '1px solid #003b5c',
    borderRadius: '5px',
  },

  button: {
    marginTop: '30px',
    padding: '15px',
    width: '100%',
    fontSize: '16px',
    backgroundColor: '#fcb040',
    color: '#003b5c',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },

  // New style for text colors, can be applied to the Order Summary Page
  textColorPrimary: {
    color: '#fcb040', // Primary text color
  },

  textColorSecondary: {
    color: '#003b5c', // Secondary text color
  },

  textColorHighlight: {
    color: '#ff5733', // Custom highlight color for important text
  }
};
