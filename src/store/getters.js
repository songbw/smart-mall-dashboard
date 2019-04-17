const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  cosUrl: state => state.app.cosUrl,
  token: state => state.user.token,
  username: state => state.user.username,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  brandsNum: state => state.brands.brandsTotal,
  brandsData: state => state.brands.brandsData,
  allCategoriesData: state => state.categories.allClassesData,
  allCategoriesLoaded: state => state.categories.allClassesDataLoaded,
  allCategoriesInLoading: state => state.categories.allClassesDataInLoading,
  productsNum: state => state.products.productsTotal,
  productsData: state => state.products.productsData,
  aggregationQuery: state => state.aggregations.aggregationQuery,
  allAggregationList: state => state.aggregations.aggregationList,
  aggregationTotal: state => state.aggregations.aggregationTotalNum,
  currentAggregationInfo: state => state.aggregations.aggregation,
  currentAggregationContent: state => state.aggregations.aggregation.content,
  currentAggregationContentIndex: state => state.aggregations.aggregationTemplateIndex,
  currentPromotionInfo: state => state.promotions.promotion,
  allPromotionList: state => state.promotions.promotionList,
  promotionTotalNum: state => state.promotions.totalNum
}
export default getters
