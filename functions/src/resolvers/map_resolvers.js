//@ts-check
const { DateTime } = require('luxon');

/**
 * @typedef {import('../types').ResolverArgsInfo} ResolverArgsInfo
 * @typedef {import('../types').RawTagDocumentFields} RawTagDocumentFields
 * @typedef {import('../types').RawStatusDocumentFields} RawStatusDocumentFields
 */

const tagResolvers = {
  Tag: {
    /**
     * @param {RawTagDocumentFields} tag
     * @param {*} _
     * @param {*} __
     */
    createTime: async (tag, _, __) =>
      DateTime.fromISO(tag.createTime.toDate().toISOString())
        .setZone('UTC+8')
        .toString(),
    /**
     * @param {RawTagDocumentFields} tag
     * @param {*} _
     * @param {*} __
     */
    lastUpdateTime: async (tag, _, __) =>
      DateTime.fromISO(tag.createTime.toDate().toISOString())
        .setZone('UTC+8')
        .toString(),
    createUser: async (tag, _, __) => ({
      uid: tag.createUserId,
    }),
    /**
     * @param {RawTagDocumentFields} tag
     * @param {*} _
     * @param {ResolverArgsInfo} info
     */
    imageUrl: async (tag, _, { dataSources }) =>
      dataSources.storageDataSource.getImageUrls({ tagId: tag.id }),
    /**
     * @param {RawTagDocumentFields} tag
     * @param {*} _
     * @param {ResolverArgsInfo} info
     */
    status: async (tag, _, { dataSources, userInfo }) =>
      dataSources.tagDataSource.getLatestStatusData({
        tagId: tag.id,
        userInfo,
      }),
    /**
     * @param {RawTagDocumentFields} tag
     * @param {*} _
     * @param {ResolverArgsInfo} info
     */
    statusHistory: async (tag, _, { dataSources }) =>
      dataSources.tagDataSource.getStatusHistory({ tagId: tag.id }),
  },
};

const statusResolvers = {
  Status: {
    /**
     * @param {Status} RawStatusDocumentFields
     * @param {*} _
     * @param {*} __
     */
    createTime: async (status, _, __) =>
      DateTime.fromISO(status.createTime.toDate().toISOString())
        .setZone('UTC+8')
        .toString(),
    createUser: async (status, _, __) => ({ uid: status.createUserId }),
  },
};

const userResolvers = {
  User: {
    uid: async ({ uid }, _, __) => uid,
    /**
     * @param {{uid: string}} param
     * @param {*} _
     * @param {ResolverArgsInfo} info
     */
    displayName: async ({ uid }, _, { dataSources }) =>
      dataSources.authDataSource.getUserName({
        uid,
      }),
    /**
     * @param {{uid: string}} param
     * @param {*} _
     * @param {ResolverArgsInfo} info
     */
    email: async ({ uid }, _, { dataSources }) =>
      dataSources.authDataSource.getUserEmail({ uid }),
  },
};

const coordinateResolvers = {
  Coordinate: {
    latitude: async (coordinates, _, __) => coordinates.latitude.toString(),
    longitude: async (coordinates, _, __) => coordinates.longitude.toString(),
  },
};

module.exports = {
  tagResolvers,
  statusResolvers,
  userResolvers,
  coordinateResolvers,
};
