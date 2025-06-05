// // Enforces dynamic content

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // Default export function to handle GET requests
// export async function GET(request) {
//   let responseStream = new TransformStream()
//   const writer = responseStream.writable.getWriter()
//   const encoder = new TextEncoder()

//   // Close if client disconnects
//   request.signal.onabort = () => {
//     console.log("closing writer");
//     writer.close();
//   };

//   writer.write(encoder.encode('data: Vercel is a platform for....\n\n'))

//   // Create a new Response object with the readable side of the stream
//   return new Response(responseStream.readable, {
//     headers: {
//       "Content-Type": "text/event-stream",
//       Connection: "keep-alive",
//       "Cache-Control": "no-cache, no-transform",
//     },
//   });
// }

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }

// function SSE() {
//   // Create a new EventSource instance
//   const eventSource = new EventSource(
//     "http://localhost:3000/api/event-update"
//   );

//   // Handle an open event
//   eventSource.onopen = (e) => {
//     console.log("Connection to server opened");
//   };

//   // Handle a message event
//   eventSource.onmessage = (e) => {
//     // const data = JSON.parse(e.data);
//     console.log("New message from server:", e.data);
//   };

//   // Handle an error event (or close)
//   eventSource.onerror = (e) => {
//     console.log("EventSource closed:", e);
//     eventSource.close(); // Close the connection if an error occurs
//   };

//   // Cleanup function
//   return () => {
//     eventSource.close();
//   };
// }