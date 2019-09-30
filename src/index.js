import * as CLAIM_VALUES from 'constants/claim';
import * as ACTIONS from 'constants/action_types';
import * as LICENSES from 'constants/licenses';
import * as PAGES from 'constants/pages';
import * as SETTINGS from 'constants/settings';
import * as SORT_OPTIONS from 'constants/sort_options';
import * as THUMBNAIL_STATUSES from 'constants/thumbnail_upload_statuses';
import * as TRANSACTIONS from 'constants/transaction_types';
import * as TX_LIST from 'constants/transaction_list';
import * as HEADERS from 'constants/headers';
import { SEARCH_TYPES, SEARCH_OPTIONS } from 'constants/search';
import { DEFAULT_KNOWN_TAGS, DEFAULT_FOLLOWED_TAGS, MATURE_TAGS } from 'constants/tags';
import Lbry from 'lbry';
import { selectState as selectSearchState } from 'redux/selectors/search';

// constants
export {
  ACTIONS,
  CLAIM_VALUES,
  LICENSES,
  THUMBNAIL_STATUSES,
  SEARCH_TYPES,
  SEARCH_OPTIONS,
  SETTINGS,
  TRANSACTIONS,
  TX_LIST,
  SORT_OPTIONS,
  PAGES,
  DEFAULT_KNOWN_TAGS,
  DEFAULT_FOLLOWED_TAGS,
  MATURE_TAGS,
  HEADERS,
};

// common
export { Lbry };
export {
  regexInvalidURI,
  regexAddress,
  parseURI,
  buildURI,
  normalizeURI,
  isURIValid,
  isURIClaimable,
  isNameValid,
  convertToShareLink,
} from 'lbryURI';

// actions
export { doToast, doDismissToast, doError, doDismissError } from 'redux/actions/notifications';

export {
  doFetchClaimsByChannel,
  doFetchClaimListMine,
  doAbandonClaim,
  doResolveUris,
  doResolveUri,
  doFetchChannelListMine,
  doCreateChannel,
  doUpdateChannel,
  doClaimSearch,
  doImportChannel,
} from 'redux/actions/claims';

export { doDeletePurchasedUri, doPurchaseUri, doFileGet } from 'redux/actions/file';

export {
  doFetchFileInfo,
  doFileList,
  doFetchFileInfosAndPublishedClaims,
  doSetFileListSort,
} from 'redux/actions/file_info';

export {
  doResetThumbnailStatus,
  doClearPublish,
  doUpdatePublishForm,
  doUploadThumbnail,
  doPrepareEdit,
  doPublish,
  doCheckPendingPublishes,
} from 'redux/actions/publish';

export {
  doSearch,
  doUpdateSearchQuery,
  doFocusSearchInput,
  doBlurSearchInput,
  setSearchApi,
  doUpdateSearchOptions,
} from 'redux/actions/search';

export { savePosition } from 'redux/actions/content';

export {
  doUpdateBalance,
  doBalanceSubscribe,
  doFetchTransactions,
  doGetNewAddress,
  doCheckAddressIsMine,
  doSendDraftTransaction,
  doSetDraftTransactionAmount,
  doSetDraftTransactionAddress,
  doSendTip,
  doWalletEncrypt,
  doWalletDecrypt,
  doWalletUnlock,
  doWalletStatus,
  doSetTransactionListFilter,
  doUpdateBlockHeight,
} from 'redux/actions/wallet';

export { doToggleTagFollow, doAddTag, doDeleteTag } from 'redux/actions/tags';

export { doCommentList, doCommentCreate } from 'redux/actions/comments';

export { doToggleBlockChannel } from 'redux/actions/blocked';

export { doPopulateSharedUserState } from 'redux/actions/sync';

// utils
export { batchActions } from 'util/batch-actions';
export { parseQueryParams, toQueryString } from 'util/query-params';
export { formatCredits, formatFullPrice, creditsToString } from 'util/format-credits';
export { isClaimNsfw, createNormalizedClaimSearchKey } from 'util/claim';

// reducers
export { claimsReducer } from 'redux/reducers/claims';
export { commentReducer } from 'redux/reducers/comments';
export { contentReducer } from 'redux/reducers/content';
export { fileInfoReducer } from 'redux/reducers/file_info';
export { fileReducer } from 'redux/reducers/file';
export { notificationsReducer } from 'redux/reducers/notifications';
export { publishReducer } from 'redux/reducers/publish';
export { searchReducer } from 'redux/reducers/search';
export { tagsReducer } from 'redux/reducers/tags';
export { blockedReducer } from 'redux/reducers/blocked';
export { walletReducer } from 'redux/reducers/wallet';

// selectors
export { makeSelectContentPositionForUri } from 'redux/selectors/content';

export { selectToast, selectError } from 'redux/selectors/notifications';

export {
  selectFailedPurchaseUris,
  selectPurchasedUris,
  selectPurchaseUriErrorMessage,
  selectLastPurchasedUri,
  makeSelectStreamingUrlForUri,
} from 'redux/selectors/file';

export {
  makeSelectClaimForUri,
  makeSelectClaimIsMine,
  makeSelectFetchingChannelClaims,
  makeSelectClaimsInChannelForPage,
  makeSelectMetadataForUri,
  makeSelectMetadataItemForUri,
  makeSelectThumbnailForUri,
  makeSelectCoverForUri,
  makeSelectTitleForUri,
  makeSelectDateForUri,
  makeSelectAmountForUri,
  makeSelectTagsForUri,
  makeSelectContentTypeForUri,
  makeSelectIsUriResolving,
  makeSelectTotalItemsForChannel,
  makeSelectTotalPagesForChannel,
  makeSelectNsfwCountFromUris,
  makeSelectNsfwCountForChannel,
  makeSelectClaimIsNsfw,
  makeSelectRecommendedContentForUri,
  makeSelectFirstRecommendedFileForUri,
  makeSelectChannelForClaimUri,
  makeSelectClaimIsPending,
  makeSelectPendingByUri,
  makeSelectClaimsInChannelForCurrentPageState,
  makeSelectShortUrlForUri,
  makeSelectCanonicalUrlForUri,
  makeSelectPermanentUrlForUri,
  makeSelectSupportsForUri,
  selectPendingById,
  selectClaimsById,
  selectClaimsByUri,
  selectAllClaimsByChannel,
  selectMyClaimsRaw,
  selectAbandoningIds,
  selectMyActiveClaims,
  selectAllFetchingChannelClaims,
  selectIsFetchingClaimListMine,
  selectPendingClaims,
  selectMyClaims,
  selectMyClaimsWithoutChannels,
  selectMyClaimUrisWithoutChannels,
  selectAllMyClaimsByOutpoint,
  selectMyClaimsOutpoints,
  selectFetchingMyChannels,
  selectMyChannelClaims,
  selectResolvingUris,
  selectPlayingUri,
  selectChannelClaimCounts,
  selectCurrentChannelPage,
  selectFetchingClaimSearch,
  selectFetchingClaimSearchByQuery,
  selectClaimSearchByQuery,
  selectClaimSearchByQueryLastPageReached,
  selectUpdatingChannel,
  selectUpdateChannelError,
  selectCreatingChannel,
  selectCreateChannelError,
  selectChannelImportPending,
  makeSelectMyStreamUrlsForPage,
  selectMyStreamUrlsCount,
} from 'redux/selectors/claims';

export { makeSelectCommentsForUri } from 'redux/selectors/comments';

export {
  makeSelectFileInfoForUri,
  makeSelectDownloadingForUri,
  makeSelectLoadingForUri,
  selectFileInfosByOutpoint,
  selectIsFetchingFileList,
  selectIsFetchingFileListDownloadedOrPublished,
  selectDownloadingByOutpoint,
  selectUrisLoading,
  selectFileInfosDownloaded,
  selectDownloadingFileInfos,
  selectTotalDownloadProgress,
  selectFileListDownloadedSort,
  selectFileListPublishedSort,
  selectDownloadedUris,
  makeSelectMediaTypeForUri,
  makeSelectUriIsStreamable,
  makeSelectDownloadPathForUri,
  makeSelectFileNameForUri,
  makeSelectFilePartlyDownloaded,
  makeSelectDownloadUrlsForPage,
  selectDownloadUrlsCount,
} from 'redux/selectors/file_info';

export {
  makeSelectPublishFormValue,
  selectPublishFormValues,
  selectIsStillEditing,
  selectMyClaimForUri,
  selectIsResolvingPublishUris,
  selectTakeOverAmount,
} from 'redux/selectors/publish';

export { selectSearchState };
export {
  makeSelectSearchUris,
  selectSearchValue,
  selectSearchOptions,
  selectIsSearching,
  selectSearchUrisByQuery,
  selectSearchBarFocused,
  selectSearchSuggestions,
  makeSelectQueryWithOptions,
} from 'redux/selectors/search';

export {
  selectBalance,
  selectTotalBalance,
  selectReservedBalance,
  selectClaimsBalance,
  selectSupportsBalance,
  selectTipsBalance,
  selectTransactionsById,
  selectSupportsByOutpoint,
  selectTotalSupports,
  selectTransactionItems,
  selectRecentTransactions,
  selectHasTransactions,
  selectIsFetchingTransactions,
  selectIsSendingSupport,
  selectReceiveAddress,
  selectGettingNewAddress,
  selectDraftTransaction,
  selectDraftTransactionAmount,
  selectDraftTransactionAddress,
  selectDraftTransactionError,
  selectBlocks,
  selectWalletIsEncrypted,
  selectWalletState,
  selectWalletEncryptPending,
  selectWalletEncryptSucceeded,
  selectWalletEncryptResult,
  selectWalletDecryptPending,
  selectWalletDecryptSucceeded,
  selectWalletDecryptResult,
  selectWalletUnlockPending,
  selectWalletUnlockSucceeded,
  selectWalletUnlockResult,
  selectTransactionListFilter,
  selectFilteredTransactions,
  makeSelectFilteredTransactionsForPage,
  selectFilteredTransactionCount,
} from 'redux/selectors/wallet';

export {
  selectFollowedTags,
  selectUnfollowedTags,
  makeSelectIsFollowingTag,
} from 'redux/selectors/tags';

export {
  selectBlockedChannels,
  selectChannelIsBlocked,
  selectBlockedChannelsCount,
} from 'redux/selectors/blocked';
