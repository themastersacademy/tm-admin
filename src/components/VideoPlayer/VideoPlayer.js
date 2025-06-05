export default function VideoPlayer({ videoURL }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "80vh",
        justifyContent: "center",
        alignItems: "center",
        padding: "0px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <iframe
          src={videoURL}
          loading="lazy"
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            position: "absolute",
            minHeight: "100%",
            minWidth: "100%",
            objectFit: "cover",
            backgroundColor: "black",
          }}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
          allowFullScreen
        />
      </div>
    </div>
  );
}
