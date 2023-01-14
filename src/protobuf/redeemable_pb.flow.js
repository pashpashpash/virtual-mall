// @flow
// package: protobuf
// file: protobuf/redeemable.proto

import * as jspb from "google-protobuf";

export class RedeemableInfo$AsClass extends jspb.Message {
  getSecretAccount: () => string;
  setSecretAccount: (value: string) => void;

  getCreatorAccount: () => string;
  setCreatorAccount: (value: string) => void;

  getClaimerAccount: () => string;
  setClaimerAccount: (value: string) => void;

  getEncryptedSecretPrivateKey: () => string;
  setEncryptedSecretPrivateKey: (value: string) => void;

  getCreatorMessage: () => string;
  setCreatorMessage: (value: string) => void;

  getTheme: () => $Values<typeof RedeemableTheme>;
  setTheme: (value: $Values<typeof RedeemableTheme>) => void;

  getTxDeposited: () => string;
  setTxDeposited: (value: string) => void;

  getTxClaimed: () => string;
  setTxClaimed: (value: string) => void;

  getDeprecatedNFTTokenID: () => number;
  setDeprecatedNFTTokenID: (value: number) => void;

  getNFTContract: () => string;
  setNFTContract: (value: string) => void;

  getNFTChainID: () => number;
  setNFTChainID: (value: number) => void;

  getNFTImage: () => string;
  setNFTImage: (value: string) => void;

  getCreatedAt: () => number;
  setCreatedAt: (value: number) => void;

  getClaimedAt: () => number;
  setClaimedAt: (value: number) => void;

  getNFTTokenID: () => string;
  setNFTTokenID: (value: string) => void;

  getNFTName: () => string;
  setNFTName: (value: string) => void;

  getCreatorFromName: () => string;
  setCreatorFromName: (value: string) => void;

  getStatus: () => $Values<typeof Status>;
  setStatus: (value: $Values<typeof Status>) => void;

  getRedeemableContract: () => $Values<typeof RedeemableContract>;
  setRedeemableContract: (value: $Values<typeof RedeemableContract>) => void;

  getAmount: () => string;
  setAmount: (value: string) => void;

  getDecimals: () => number;
  setDecimals: (value: number) => void;

  getSymbol: () => string;
  setSymbol: (value: string) => void;

  serializeBinary: () => Uint8Array;
  toObject: (includeInstance?: boolean) => RedeemableInfo$AsClass$AsObject;
  static toObject: (includeInstance: boolean, msg: RedeemableInfo$AsClass) => RedeemableInfo$AsClass$AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter: (message: RedeemableInfo$AsClass, writer: jspb.BinaryWriter) => void;
  static deserializeBinary: (bytes: Uint8Array) => RedeemableInfo$AsClass;
  static deserializeBinaryFromReader: (message: RedeemableInfo$AsClass, reader: jspb.BinaryReader) => RedeemableInfo$AsClass;
}

export type RedeemableInfo$AsClass$AsObject = {
  secretAccount: string,
  creatorAccount: string,
  claimerAccount: string,
  encryptedSecretPrivateKey: string,
  creatorMessage: string,
  theme: $Values<typeof RedeemableTheme>,
  txDeposited: string,
  txClaimed: string,
  deprecatedNFTTokenID: number,
  nFTContract: string,
  nFTChainID: number,
  nFTImage: string,
  createdAt: number,
  claimedAt: number,
  nFTTokenID: string,
  nFTName: string,
  creatorFromName: string,
  status: $Values<typeof Status>,
  redeemableContract: $Values<typeof RedeemableContract>,
  amount: string,
  decimals: number,
  symbol: string,
}

export class RenderRequest$AsClass extends jspb.Message {
  clearRedeemableSecretList: () => void;
  getRedeemableSecretList: () => Array<string>;
  setRedeemableSecretList: (value: Array<string>) => void;
  addRedeemableSecret: (value: string, index?: number) => string;

  serializeBinary: () => Uint8Array;
  toObject: (includeInstance?: boolean) => RenderRequest$AsClass$AsObject;
  static toObject: (includeInstance: boolean, msg: RenderRequest$AsClass) => RenderRequest$AsClass$AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter: (message: RenderRequest$AsClass, writer: jspb.BinaryWriter) => void;
  static deserializeBinary: (bytes: Uint8Array) => RenderRequest$AsClass;
  static deserializeBinaryFromReader: (message: RenderRequest$AsClass, reader: jspb.BinaryReader) => RenderRequest$AsClass;
}

export type RenderRequest$AsClass$AsObject = {
  redeemableSecretList: Array<string>,
}

export class Redeemables$AsClass extends jspb.Message {
  clearItemsList: () => void;
  getItemsList: () => Array<RedeemableInfo$AsClass>;
  setItemsList: (value: Array<RedeemableInfo$AsClass>) => void;
  addItems: (value?: RedeemableInfo$AsClass, index?: number) => RedeemableInfo$AsClass;

  serializeBinary: () => Uint8Array;
  toObject: (includeInstance?: boolean) => Redeemables$AsClass$AsObject;
  static toObject: (includeInstance: boolean, msg: Redeemables$AsClass) => Redeemables$AsClass$AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter: (message: Redeemables$AsClass, writer: jspb.BinaryWriter) => void;
  static deserializeBinary: (bytes: Uint8Array) => Redeemables$AsClass;
  static deserializeBinaryFromReader: (message: Redeemables$AsClass, reader: jspb.BinaryReader) => Redeemables$AsClass;
}

export type Redeemables$AsClass$AsObject = {
  itemsList: Array<RedeemableInfo$AsClass$AsObject>,
}

export const RedeemableTheme = Object.freeze({
  VIBRANT: 0,
  DARK: 1,
})

export const RedeemableTheme$ReverseLookUp = Object.freeze({
  "0": "VIBRANT",
  "1": "DARK",
})

export const Status = Object.freeze({
  DIGITAL: 0,
  PENDING: 1,
  PRINTING: 2,
  PRINTED: 3,
})

export const Status$ReverseLookUp = Object.freeze({
  "0": "DIGITAL",
  "1": "PENDING",
  "2": "PRINTING",
  "3": "PRINTED",
})

export const RedeemableContract = Object.freeze({
  ERC721: 0,
  ERC1155: 1,
  NATIVE: 2,
  ERC20: 3,
})

export const RedeemableContract$ReverseLookUp = Object.freeze({
  "0": "ERC721",
  "1": "ERC1155",
  "2": "NATIVE",
  "3": "ERC20",
})

