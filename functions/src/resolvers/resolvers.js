const { merge } = require('lodash');

const {
  tagResolvers,
  statusResolvers,
  userResolvers,
  coordinateResolvers,
} = require('./map_resolvers');

/**
 * @typedef {import('../types').ResolverArgsInfo} ResolverArgsInfo
 * @typedef {import('../types').AddTagDataInput} AddTagDataInput
 * @typedef {import('../types').UpdateTagDataInput} UpdateTagDataInput
 */

const queryResolvers = {
  Query: {
    /**
     * @param {*} _
     * @param {*} __
     * @param {ResolverArgsInfo} info
     */
    unarchivedTagList: async (_, __, { dataSources }) =>
      dataSources.tagDataSource.getAllUnarchivedTags(),
    /**
     * @param {*} _
     * @param {{tagId: string}} params
     * @param {ResolverArgsInfo} info
     */
    tag: async (_, { tagId }, { dataSources }) =>
      dataSources.tagDataSource.getTagData({ tagId }),
    /**
     * @param {*} _
     * @param {{uid: string}} params
     * @param {ResolverArgsInfo} info
     */
    userAddTagHistory: async (_, { uid }, { dataSources }) =>
      dataSources.tagDataSource.getUserAddTagHistory({ uid }),
    /**
     * @param {*} _
     * @param {*} __
     * @param {ResolverArgsInfo} info
     */
    hasReadGuide: async (_, __, { dataSources, userInfo }) =>
      dataSources.userDataSource.getHasReadGuideStatus({ userInfo }),
    /**
     * @param {*} _
     * @param {*} __
     * @param {ResolverArgsInfo} info
     */
    archivedThreshold: async (_, __, { dataSources }) =>
      dataSources.tagDataSource.archivedThreshold,
  },
};

const mutationResolvers = {
  Mutation: {
    /**
     * @param {*} _
     * @param {{data: AddTagDataInput}} param
     * @param {ResolverArgsInfo} info
     */
    addNewTagData: async (_, { data }, { dataSources, userInfo }) => {
      const {
        tag,
        imageUploadNumber,
      } = await dataSources.tagDataSource.addNewTagData({ data, userInfo });
      const imageUploadUrls = Promise.all(
        dataSources.storageDataSource.getImageUploadUrls({
          imageUploadNumber,
          tagId: tag.id,
        })
      );
      return { tag, imageUploadNumber, imageUploadUrls };
    },
    /**
     *
     * @param {*} _
     * @param {{tagId: string, data: UpdateTagDataInput}} param
     * @param {ResolverArgsInfo} info
     */
    updateTagData: async (_, { tagId, data }, { dataSources, userInfo }) => {
      const { imageDeleteUrls, imageUploadNumber = 0 } = data;
      const { tag } = await dataSources.tagDataSource.updateTagData({
        tagId,
        data,
        userInfo,
      });
      return {
        tag,
        imageUploadNumber,
        imageUploadUrls: await dataSources.storageDataSource.getImageUploadUrls(
          { imageUploadNumber, tagId }
        ),
        imageDeleteStatus: await dataSources.storageDataSource.doImageDelete(
          tagId,
          imageDeleteUrls
        ),
      };
    },
    /**
     *
     * @param {*} _
     * @param {{tagId: string, statusName: string, description: string}} param
     * @param {ResolverArgsInfo} info
     * @returns
     */
    updateTagStatus: async (
      _,
      { tagId, statusName, description },
      { dataSources, userInfo }
    ) =>
      dataSources.tagDataSource.updateTagStatus({
        tagId,
        statusName,
        description,
        userInfo,
      }),
    /**
     *
     * @param {*} _
     * @param {{tagId: string, action: string}} param
     * @param {ResolverArgsInfo} info
     */
    updateUpVoteStatus: async (
      _,
      { tagId, action },
      { dataSources, userInfo }
    ) =>
      dataSources.tagDataSource.updateNumberOfUpVote({
        tagId,
        action,
        userInfo,
      }),
    /**
     *
     * @param {*} _
     * @param {*} __
     * @param {ResolverArgsInfo} info
     */
    setHasReadGuide: async (_, __, { dataSources, userInfo }) =>
      dataSources.userDataSource.setHasReadGuide({ userInfo }),
    /**
     * @param {*} _
     * @param {{tagId: string}} string
     * @param {ResolverArgsInfo} info
     */
    incrementViewCount: async (_, { tagId }, { dataSources, userInfo }) =>
      dataSources.tagDataSource.incrementTagViewCount(tagId, userInfo),
  },
};

const resolvers = merge(
  queryResolvers,
  mutationResolvers,
  tagResolvers,
  statusResolvers,
  userResolvers,
  coordinateResolvers
);

module.exports = resolvers;
