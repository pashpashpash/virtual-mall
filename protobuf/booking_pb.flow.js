// @flow
// package: protobuf
// file: protobuf/booking.proto

import * as jspb from "google-protobuf";

export class BookingInfo$AsClass extends jspb.Message {
  getStart: () => number;
  setStart: (value: number) => void;

  getEnd: () => number;
  setEnd: (value: number) => void;

  getShopId: () => number;
  setShopId: (value: number) => void;

  getBiz: () => string;
  setBiz: (value: string) => void;

  serializeBinary: () => Uint8Array;
  toObject: (includeInstance?: boolean) => BookingInfo$AsClass$AsObject;
  static toObject: (includeInstance: boolean, msg: BookingInfo$AsClass) => BookingInfo$AsClass$AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter: (message: BookingInfo$AsClass, writer: jspb.BinaryWriter) => void;
  static deserializeBinary: (bytes: Uint8Array) => BookingInfo$AsClass;
  static deserializeBinaryFromReader: (message: BookingInfo$AsClass, reader: jspb.BinaryReader) => BookingInfo$AsClass;
}

export type BookingInfo$AsClass$AsObject = {
  start: number,
  end: number,
  shopId: number,
  biz: string,
}

export class BookingInfos$AsClass extends jspb.Message {
  clearItemsList: () => void;
  getItemsList: () => Array<BookingInfo$AsClass>;
  setItemsList: (value: Array<BookingInfo$AsClass>) => void;
  addItems: (value?: BookingInfo$AsClass, index?: number) => BookingInfo$AsClass;

  serializeBinary: () => Uint8Array;
  toObject: (includeInstance?: boolean) => BookingInfos$AsClass$AsObject;
  static toObject: (includeInstance: boolean, msg: BookingInfos$AsClass) => BookingInfos$AsClass$AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter: (message: BookingInfos$AsClass, writer: jspb.BinaryWriter) => void;
  static deserializeBinary: (bytes: Uint8Array) => BookingInfos$AsClass;
  static deserializeBinaryFromReader: (message: BookingInfos$AsClass, reader: jspb.BinaryReader) => BookingInfos$AsClass;
}

export type BookingInfos$AsClass$AsObject = {
  itemsList: Array<BookingInfo$AsClass$AsObject>,
}

