const { gql } = require('apollo-server');

const {
  Tag,
  Category,
  Status,
  User,
  Coordinate,
  StreetView,
  updateUpVoteAction,
  updateUpVoteResponse,
  AddorUpdateTagResponse,
  AddTagDataInput,
  UpdateTagDataInput,
  CoordinateInput,
  CategoryInput,
  StreetViewInput,
} = require('./map_schema');

const Query = `type Query {
  unarchivedTagList: [Tag]
  tag(tagId: ID!): Tag
  userAddTagHistory(uid: ID!): [Tag]!
  "true if the use have read the guide, need to add token in the header"
  hasReadGuide: Boolean!
  "問題任務 archived threshold"
  archivedThreshold: Int!
}`;

const Mutation = `type Mutation {
  """
  The description in the input will store in the status data
  """
  addNewTagData(data: addTagDataInput!): AddorUpdateTagResponse!
  updateTagData(tagId: ID!, data: updateTagDataInput!): AddorUpdateTagResponse!
  updateTagStatus(tagId: ID!, statusName: String!, description: String): Status!
  updateUpVoteStatus(tagId: ID!, action: updateUpVoteAction!): updateUpVoteResponse
  "true the update is successful, need to add token in the header"
  setHasReadGuide: Boolean!
  "true if the increment operation success"
  incrementViewCount(tagId: ID!): Boolean!
}`;

const typeDefs = gql(
  [
    Query,
    Tag,
    Category,
    Status,
    User,
    Coordinate,
    StreetView,
    Mutation,
    updateUpVoteAction,
    updateUpVoteResponse,
    AddorUpdateTagResponse,
    AddTagDataInput,
    UpdateTagDataInput,
    CoordinateInput,
    CategoryInput,
    StreetViewInput,
  ].join('\n')
);

module.exports = typeDefs;
