import { fal } from "@fal-ai/client";

async function main() {
  console.log("Checking schema...");
  // We can't directly check schema with the client, but we can hit the OpenAPI spec if we know it.
  // Instead, let's just make a dummy request to see what validation error we get.
  try {
    const result = await fetch("https://queue.fal.run/fal-ai/flux-2-pro/edit", {
      method: "POST",
      headers: {
        "Authorization": `Key 3eea6864-9599-4924-9a6d-48a6516afb99:a157cfe91527cc39541ed994d1b2bc41`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: "test" })
    });
    const data = await result.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
main();
