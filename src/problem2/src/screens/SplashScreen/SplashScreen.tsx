import "./style.scss";

const SplashScreen = () => {
  return (
    <div className="splashScreen">
      <div className="spinner-container">
        <div className="container">
          <span />
          <span />
          <span />
          <span />
        </div>
        <h1>Did you trade today?</h1>
      </div>
    </div>
  );
};

export default SplashScreen;