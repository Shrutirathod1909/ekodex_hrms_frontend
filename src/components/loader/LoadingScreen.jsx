import React from "react";

const LoadingScreen = () => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "transparent",
      //   backgroundColor: "#2c2c2c",
      fontFamily: "sans-serif",
    },
    box: {
      width: "100px",
      height: "100px",
      backgroundColor: "#2d3191",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "12px",
      marginBottom: "20px",
      boxShadow: "4.0px 8.0px 8.0px hsl(0deg 0% 0% / 0.38)",
      //   boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: "4px solid #555",
      borderTop: "4px solid #ffffff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    text: {
      color: "#252525",
      fontSize: "16px",
      letterSpacing: "1px",
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.box}>
        <div style={styles.spinner}></div>
      </div>
      <p style={styles.text}>Loading, please wait...</p>
    </div>
  );
};

export default LoadingScreen;
