// @flow
import * as ACTIONS from 'constants/action_types';
import { handleActions } from 'util/redux-utils';

const buildDraftTransaction = () => ({
  amount: undefined,
  address: undefined,
});

// TODO: Split into common success and failure types
// See details in https://github.com/lbryio/lbry/issues/1307
type ActionResult = {
  type: any,
  result: any,
};

type WalletState = {
  balance: any,
  totalBalance: any,
  reservedBalance: any,
  claimsBalance: any,
  supportsBalance: any,
  tipsBalance: any,
  latestBlock: ?number,
  transactions: { [string]: Transaction },
  supports: { [string]: Support },
  abandoningSupportsByOutpoint: { [string]: boolean },
  fetchingTransactions: boolean,
  gettingNewAddress: boolean,
  draftTransaction: any,
  sendingSupport: boolean,
  walletIsEncrypted: boolean,
  walletEncryptPending: boolean,
  walletEncryptSucceded: ?boolean,
  walletEncryptResult: ?boolean,
  walletDecryptPending: boolean,
  walletDecryptSucceded: ?boolean,
  walletDecryptResult: ?boolean,
  walletUnlockPending: boolean,
  walletUnlockSucceded: ?boolean,
  walletUnlockResult: ?boolean,
  walletLockPending: boolean,
  walletLockSucceded: ?boolean,
  walletLockResult: ?boolean,
};

const defaultState = {
  balance: undefined,
  totalBalance: undefined,
  reservedBalance: undefined,
  claimsBalance: undefined,
  supportsBalance: undefined,
  tipsBalance: undefined,
  latestBlock: undefined,
  transactions: {},
  fetchingTransactions: false,
  supports: {},
  fetchingSupports: false,
  abandoningSupportsByOutpoint: {},
  gettingNewAddress: false,
  draftTransaction: buildDraftTransaction(),
  sendingSupport: false,
  walletIsEncrypted: false,
  walletEncryptPending: false,
  walletEncryptSucceded: null,
  walletEncryptResult: null,
  walletDecryptPending: false,
  walletDecryptSucceded: null,
  walletDecryptResult: null,
  walletUnlockPending: false,
  walletUnlockSucceded: null,
  walletUnlockResult: null,
  walletLockPending: false,
  walletLockSucceded: null,
  walletLockResult: null,
  transactionListFilter: 'all',
};

export const walletReducer = handleActions(
  {
    [ACTIONS.FETCH_TRANSACTIONS_STARTED]: (state: WalletState) => ({
      ...state,
      fetchingTransactions: true,
    }),

    [ACTIONS.FETCH_TRANSACTIONS_COMPLETED]: (state: WalletState, action) => {
      const byId = { ...state.transactions };

      const { transactions } = action.data;
      transactions.forEach(transaction => {
        byId[transaction.txid] = transaction;
      });

      return {
        ...state,
        transactions: byId,
        fetchingTransactions: false,
      };
    },

    [ACTIONS.FETCH_SUPPORTS_STARTED]: (state: WalletState) => ({
      ...state,
      fetchingSupports: true,
    }),

    [ACTIONS.FETCH_SUPPORTS_COMPLETED]: (state: WalletState, action) => {
      const byOutpoint = state.supports;
      const { supports } = action.data;

      supports.forEach(transaction => {
        const { txid, nout } = transaction;
        byOutpoint[`${txid}:${nout}`] = transaction;
      });

      return { ...state, supports: byOutpoint, fetchingSupports: false };
    },

    [ACTIONS.ABANDON_SUPPORT_STARTED]: (state: WalletState, action: any): WalletState => {
      const { outpoint }: { outpoint: string } = action.data;
      const currentlyAbandoning = state.abandoningSupportsByOutpoint;

      currentlyAbandoning[outpoint] = true;

      return {
        ...state,
        abandoningSupportsByOutpoint: currentlyAbandoning,
      };
    },

    [ACTIONS.ABANDON_SUPPORT_COMPLETED]: (state: WalletState, action: any): WalletState => {
      const { outpoint }: { outpoint: string } = action.data;
      const byOutpoint = state.supports;
      const currentlyAbandoning = state.abandoningSupportsByOutpoint;

      delete currentlyAbandoning[outpoint];
      delete byOutpoint[outpoint];

      return {
        ...state,
        supports: byOutpoint,
        abandoningSupportsById: currentlyAbandoning,
      };
    },

    [ACTIONS.GET_NEW_ADDRESS_STARTED]: (state: WalletState) => ({
      ...state,
      gettingNewAddress: true,
    }),

    [ACTIONS.GET_NEW_ADDRESS_COMPLETED]: (state: WalletState, action) => {
      const { address } = action.data;

      return { ...state, gettingNewAddress: false, receiveAddress: address };
    },

    [ACTIONS.UPDATE_BALANCE]: (state: WalletState, action) => ({
      ...state,
      totalBalance: action.data.totalBalance,
      balance: action.data.balance,
      reservedBalance: action.data.reservedBalance,
      claimsBalance: action.data.claimsBalance,
      supportsBalance: action.data.supportsBalance,
      tipsBalance: action.data.tipsBalance,
    }),

    [ACTIONS.CHECK_ADDRESS_IS_MINE_STARTED]: (state: WalletState) => ({
      ...state,
      checkingAddressOwnership: true,
    }),

    [ACTIONS.CHECK_ADDRESS_IS_MINE_COMPLETED]: (state: WalletState) => ({
      ...state,
      checkingAddressOwnership: false,
    }),

    [ACTIONS.SET_DRAFT_TRANSACTION_AMOUNT]: (state: WalletState, action) => {
      const oldDraft = state.draftTransaction;
      const newDraft = { ...oldDraft, amount: parseFloat(action.data.amount) };

      return { ...state, draftTransaction: newDraft };
    },

    [ACTIONS.SET_DRAFT_TRANSACTION_ADDRESS]: (state: WalletState, action) => {
      const oldDraft = state.draftTransaction;
      const newDraft = { ...oldDraft, address: action.data.address };

      return { ...state, draftTransaction: newDraft };
    },

    [ACTIONS.SEND_TRANSACTION_STARTED]: (state: WalletState) => {
      const newDraftTransaction = { ...state.draftTransaction, sending: true };

      return { ...state, draftTransaction: newDraftTransaction };
    },

    [ACTIONS.SEND_TRANSACTION_COMPLETED]: (state: WalletState) =>
      Object.assign({}, state, {
        draftTransaction: buildDraftTransaction(),
      }),

    [ACTIONS.SEND_TRANSACTION_FAILED]: (state: WalletState, action) => {
      const newDraftTransaction = Object.assign({}, state.draftTransaction, {
        sending: false,
        error: action.data.error,
      });

      return { ...state, draftTransaction: newDraftTransaction };
    },

    [ACTIONS.SUPPORT_TRANSACTION_STARTED]: (state: WalletState) => ({
      ...state,
      sendingSupport: true,
    }),

    [ACTIONS.SUPPORT_TRANSACTION_COMPLETED]: (state: WalletState) => ({
      ...state,
      sendingSupport: false,
    }),

    [ACTIONS.SUPPORT_TRANSACTION_FAILED]: (state: WalletState, action) => ({
      ...state,
      error: action.data.error,
      sendingSupport: false,
    }),

    [ACTIONS.WALLET_STATUS_COMPLETED]: (state: WalletState, action) => ({
      ...state,
      walletIsEncrypted: action.result,
    }),

    [ACTIONS.WALLET_ENCRYPT_START]: (state: WalletState) => ({
      ...state,
      walletEncryptPending: true,
      walletEncryptSucceded: null,
      walletEncryptResult: null,
    }),

    [ACTIONS.WALLET_ENCRYPT_COMPLETED]: (state: WalletState, action: ActionResult) => ({
      ...state,
      walletEncryptPending: false,
      walletEncryptSucceded: true,
      walletEncryptResult: action.result,
    }),

    [ACTIONS.WALLET_ENCRYPT_FAILED]: (state: WalletState, action: ActionResult) => ({
      ...state,
      walletEncryptPending: false,
      walletEncryptSucceded: false,
      walletEncryptResult: action.result,
    }),

    [ACTIONS.WALLET_DECRYPT_START]: (state: WalletState) => ({
      ...state,
      walletDecryptPending: true,
      walletDecryptSucceded: null,
      walletDecryptResult: null,
    }),

    [ACTIONS.WALLET_DECRYPT_COMPLETED]: (state: WalletState, action: ActionResult) => ({
      ...state,
      walletDecryptPending: false,
      walletDecryptSucceded: true,
      walletDecryptResult: action.result,
    }),

    [ACTIONS.WALLET_DECRYPT_FAILED]: (state: WalletState, action: ActionResult) => ({
      ...state,
      walletDecryptPending: false,
      walletDecryptSucceded: false,
      walletDecryptResult: action.result,
    }),

    [ACTIONS.WALLET_UNLOCK_START]: (state: WalletState) => ({
      ...state,
      walletUnlockPending: true,
      walletUnlockSucceded: null,
      walletUnlockResult: null,
    }),

    [ACTIONS.WALLET_UNLOCK_COMPLETED]: (state: WalletState, action: ActionResult) => ({
      ...state,
      walletUnlockPending: false,
      walletUnlockSucceded: true,
      walletUnlockResult: action.result,
    }),

    [ACTIONS.WALLET_UNLOCK_FAILED]: (state: WalletState, action: ActionResult) => ({
      ...state,
      walletUnlockPending: false,
      walletUnlockSucceded: false,
      walletUnlockResult: action.result,
    }),

    [ACTIONS.WALLET_LOCK_START]: (state: WalletState) => ({
      ...state,
      walletLockPending: false,
      walletLockSucceded: null,
      walletLockResult: null,
    }),

    [ACTIONS.WALLET_LOCK_COMPLETED]: (state: WalletState, action: ActionResult) => ({
      ...state,
      walletLockPending: false,
      walletLockSucceded: true,
      walletLockResult: action.result,
    }),

    [ACTIONS.WALLET_LOCK_FAILED]: (state: WalletState, action: ActionResult) => ({
      ...state,
      walletLockPending: false,
      walletLockSucceded: false,
      walletLockResult: action.result,
    }),

    [ACTIONS.SET_TRANSACTION_LIST_FILTER]: (state: WalletState, action: { data: string }) => ({
      ...state,
      transactionListFilter: action.data,
    }),

    [ACTIONS.UPDATE_CURRENT_HEIGHT]: (state: WalletState, action: { data: number }) => ({
      ...state,
      latestBlock: action.data,
    }),
  },
  defaultState
);
