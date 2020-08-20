const path = require('path');
const os = require('os');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

/**
 * Convert upload images to jpeg and change its name
 * @param {FirebaseAdmin} admin admin instance to communicate with firebase services
 * @param {Object} object the file information of the upload file
 */
async function uploadImageProcessing(admin, object) {
  // get data from upload file
  const {
    bucket: fileBucket, // The Storage bucket that contains the file.
    name: filePath, // File path in the bucket.
    metadata,
    // contentType, // File content type.
    // metageneration, // Number of times metadata has been generated. New objects have a value of 1.
  } = object;

  console.log(metadata);
  const convertExtensionName = '.jpg';

  // bucket instance
  const bucket = admin.storage().bucket(fileBucket);

  // generate necessary data
  const fileName = path.basename(filePath);
  const tagId = path.dirname(filePath);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const newFileMetadata = {
    contentType: 'image/jpeg',
    metadata: {
      tagId,
      firebaseStorageDownloadTokens: uuidv4(),
    },
  };

  // check if the file is already update and convert to jpeg
  if (fileName.endsWith(convertExtensionName)) {
    console.log('already convert to ', convertExtensionName);
    return;
  }

  // upload file reference
  const fileRef = bucket.file(filePath);

  // download upload file
  await fileRef.download({ destination: tempFilePath });
  console.log('Image downloaded locally to', tempFilePath);

  // delete upload file
  await fileRef.delete();

  // convert file, generate new name
  const newFileName = `${uuidv4()}${convertExtensionName}`;
  const newFilePath = path.join(os.tmpdir(), newFileName);
  await sharp(tempFilePath).jpeg().toFile(newFilePath);

  // upload converted file
  await bucket.upload(newFilePath, {
    destination: path.join(tagId, newFileName),
    metadata: newFileMetadata,
  });

  // delete files
  fs.unlinkSync(tempFilePath);
  fs.unlinkSync(newFilePath);
}

module.exports = uploadImageProcessing;
