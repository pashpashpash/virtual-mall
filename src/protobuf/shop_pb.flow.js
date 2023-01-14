// @flow
// package: protobuf
// file: protobuf/shop.proto

import * as jspb from "google-protobuf";

export class ShopInfo$AsClass extends jspb.Message {
  getId: () => number;
  setId: (value: number) => void;

  getCreatedBy: () => string;
  setCreatedBy: (value: string) => void;

  serializeBinary: () => Uint8Array;
  toObject: (includeInstance?: boolean) => ShopInfo$AsClass$AsObject;
  static toObject: (includeInstance: boolean, msg: ShopInfo$AsClass) => ShopInfo$AsClass$AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter: (message: ShopInfo$AsClass, writer: jspb.BinaryWriter) => void;
  static deserializeBinary: (bytes: Uint8Array) => ShopInfo$AsClass;
  static deserializeBinaryFromReader: (message: ShopInfo$AsClass, reader: jspb.BinaryReader) => ShopInfo$AsClass;
}

export type ShopInfo$AsClass$AsObject = {
  id: number,
  createdBy: string,
}

export class ShopInfos$AsClass extends jspb.Message {
  clearItemsList: () => void;
  getItemsList: () => Array<ShopInfo$AsClass>;
  setItemsList: (value: Array<ShopInfo$AsClass>) => void;
  addItems: (value?: ShopInfo$AsClass, index?: number) => ShopInfo$AsClass;

  serializeBinary: () => Uint8Array;
  toObject: (includeInstance?: boolean) => ShopInfos$AsClass$AsObject;
  static toObject: (includeInstance: boolean, msg: ShopInfos$AsClass) => ShopInfos$AsClass$AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter: (message: ShopInfos$AsClass, writer: jspb.BinaryWriter) => void;
  static deserializeBinary: (bytes: Uint8Array) => ShopInfos$AsClass;
  static deserializeBinaryFromReader: (message: ShopInfos$AsClass, reader: jspb.BinaryReader) => ShopInfos$AsClass;
}

export type ShopInfos$AsClass$AsObject = {
  itemsList: Array<ShopInfo$AsClass$AsObject>,
}

