require('dotenv').config();


const { DefaultAzureCredential } = require("@azure/identity");
const { BlobServiceClient } = require("@azure/storage-blob");

const accountName = process.env.STORAGE_ACCOUNT_NAME;
const containerName = process.env.BLOB_CONTAINER_NAME;
const blobName = process.env.BLOB_NAME;



console.log("Env values:", { accountName, containerName, blobName });

async function main() {
  const credential = new DefaultAzureCredential(); // Will pick up the VM's managed identity

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  const downloadBlockBlobResponse = await blobClient.download();
  const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);

  console.log("Blob content:", downloaded);
}

main().catch((err) => {
  console.error("Error:", err.message);
});

function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => chunks.push(data.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}
