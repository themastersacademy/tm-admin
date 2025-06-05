const UploadVideo = () => {
  return (
    <div
      style={{
        width: "800px",
        margin: "auto",
      }}
    >
      <div style={{ position: "relative", paddingTop: "56.25%" }}>
        <iframe
          src="https://iframe.mediadelivery.net/embed/376973/da30f22b-0a39-4a99-9e08-ebef21cf089d?token=7f05bbde38a36d4030ee9b33171026d300d35e5863faa01374c316703d02e30e&expires=1739787545&autoplay=true&loop=false&muted=false&preload=true&responsive=true"
          loading="lazy"
          style={{
            border: 0,
            position: "absolute",
            top: 0,
            height: "100%",
            width: "100%",
          }}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
          allowFullScreen={true}
        ></iframe>
      </div>
    </div>
  );
};

export default UploadVideo;

async function uploadToS3(file, setResponseMessage) {
  // Request presigned URL from your backend
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/bank/resource/create-file`,
      {
        method: "POST",
        body: JSON.stringify({
          title: file.name,
          fileType: file.type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      console.log(await response.json());

      setResponseMessage("Failed to get presigned URL");
      return;
      // throw new Error("Failed to get presigned URL");
    }

    const { url } = await response.json();

    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        // Calculate the progress percentage.
        const percent = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
        setResponseMessage(`Upload progress: ${percent}%`);
        console.log(`Upload progress: ${percent}%`);
      },
    });

    setResponseMessage("Upload completed");

    // const fileStream = file.stream();
    // const reader = fileStream.getReader();
    // let uploadedBytes = 0;

    // const uploadChunk = async (value) => {
    //   const uploadResponse = await fetch(url, {
    //     method: "PUT",
    //     headers: { "Content-Type": file.type },
    //     body: value,
    //   });

    //   if (uploadResponse.ok) {
    //     uploadedBytes += value.length;
    //     const percent = ((uploadedBytes / file.size) * 100).toFixed(2);
    //     setResponseMessage(`Upload progress: ${percent}%`);
    //     console.log(`Upload progress: ${percent}%`);
    //   } else {
    //     setResponseMessage("Upload failed");
    //     console.error("Upload failed");
    //   }
    // };

    // const readChunks = async () => {
    //   const { done, value } = await reader.read();
    //   if (done) {
    //     setResponseMessage("Upload completed");
    //     console.log("Upload completed");
    //     return;
    //   }
    //   await uploadChunk(value);
    //   readChunks(); // Continue with the next chunk
    // };

    // readChunks(); // Start reading and uploading
  } catch (error) {
    setResponseMessage("Error during file upload");
    console.error("Error during file upload:", error);
  }
}
