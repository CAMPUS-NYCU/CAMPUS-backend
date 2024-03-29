const { FieldValue } = require("firebase-admin").firestore;
const functions = require("firebase-functions");

// require for logger
// https://firebase.google.com/docs/functions/writing-and-viewing-logs
const { logger } = require("firebase-functions");
const { PubSub } = require("@google-cloud/pubsub");

/**
 * @typedef {import('firebase-admin')} firebaseAdmin
 * @typedef {import('firebase-admin').firestore.QueryDocumentSnapshot} QueryDocumentSnapshot
 * /

/**
 * Delete images when corresponding tag is deleted
 * @param {firebaseAdmin} admin
 * @param {QueryDocumentSnapshot} snap 
 */
async function deleteTagTrigger(admin, snap) {
  // https://firebase.google.com/docs/functions/config-env#access_environment_configuration_in_a_function
  const topicName = functions.config().campus.event_topic_name;
  const pubSubClient = new PubSub();

  const tagId = snap.id;
  const { createUserId: uid } = snap.data();
  const storageRef = admin.storage().bucket();
  const userDocRef = admin.firestore().collection("user").doc(uid);

  // publish delete event by Pub/Sub
  // https://cloud.google.com/pubsub/docs/quickstart-client-libraries#publish_messages
  try {
    // these fields are firestore object, need to process before encode to JSON string
    const { createTime, lastUpdateTime, coordinates } = snap.data();
    const { latitude, longitude } = coordinates;
    const dataBuffer = Buffer.from(
      JSON.stringify({
        changeType: "deleted",
        tagContent: {
          ...snap.data(), // first destruct original objects
          // * and then replace existed keys
          // * don't reverse the order!!!(don't assign replaced values first and
          //   then destruct)
          id: tagId,
          createTime: createTime.toDate().toISOString(),
          lastUpdateTime: lastUpdateTime.toDate().toISOString(),
          coordinates: { latitude, longitude },
        },
      })
    );
    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    logger.log(`publish ${tagId} delete event, message id: ${messageId}`);
  } catch (error) {
    logger.error(`publish ${tagId} delete event failed on topic ${topicName}`);
    logger.error(error);
  }

  // Decrement userAddTagNumber
  userDocRef.update({ userAddTagNumber: FieldValue.increment(-1) });
  logger.log(`Delete tag ${tagId} and update user add tags history`);

  // Delete related images
  // There may be more than 1 images related to 1 tag.
  const options = {
    prefix: tagId,
  };
  const [files] = await storageRef.getFiles(options);

  const responses = await Promise.allSettled(
    files.map((file) => file.delete())
  );
  const rejectedMessages = responses.filter(
    ({ status }) => status === "rejected"
  );
  if (rejectedMessages.length > 0) {
    logger.log(`${tagId} images delete failed.`);
    logger.error(rejectedMessages);
    return;
  }
  logger.log(`${tagId} images delete successfully.`);
}

module.exports = deleteTagTrigger;
