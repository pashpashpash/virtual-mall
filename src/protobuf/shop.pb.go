// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.1
// 	protoc        v3.20.3
// source: protobuf/shop.proto

package protobuf

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type ShopInfo struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ID        int64  `protobuf:"varint,1,opt,name=ID,proto3" json:"ID,omitempty"`
	CreatedBy string `protobuf:"bytes,2,opt,name=created_by,json=createdBy,proto3" json:"created_by,omitempty"`
}

func (x *ShopInfo) Reset() {
	*x = ShopInfo{}
	if protoimpl.UnsafeEnabled {
		mi := &file_protobuf_shop_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ShopInfo) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ShopInfo) ProtoMessage() {}

func (x *ShopInfo) ProtoReflect() protoreflect.Message {
	mi := &file_protobuf_shop_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ShopInfo.ProtoReflect.Descriptor instead.
func (*ShopInfo) Descriptor() ([]byte, []int) {
	return file_protobuf_shop_proto_rawDescGZIP(), []int{0}
}

func (x *ShopInfo) GetID() int64 {
	if x != nil {
		return x.ID
	}
	return 0
}

func (x *ShopInfo) GetCreatedBy() string {
	if x != nil {
		return x.CreatedBy
	}
	return ""
}

type ShopInfos struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Items []*ShopInfo `protobuf:"bytes,1,rep,name=items,proto3" json:"items,omitempty"`
}

func (x *ShopInfos) Reset() {
	*x = ShopInfos{}
	if protoimpl.UnsafeEnabled {
		mi := &file_protobuf_shop_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ShopInfos) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ShopInfos) ProtoMessage() {}

func (x *ShopInfos) ProtoReflect() protoreflect.Message {
	mi := &file_protobuf_shop_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ShopInfos.ProtoReflect.Descriptor instead.
func (*ShopInfos) Descriptor() ([]byte, []int) {
	return file_protobuf_shop_proto_rawDescGZIP(), []int{1}
}

func (x *ShopInfos) GetItems() []*ShopInfo {
	if x != nil {
		return x.Items
	}
	return nil
}

var File_protobuf_shop_proto protoreflect.FileDescriptor

var file_protobuf_shop_proto_rawDesc = []byte{
	0x0a, 0x13, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2f, 0x73, 0x68, 0x6f, 0x70, 0x2e,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x08, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x22,
	0x39, 0x0a, 0x08, 0x53, 0x68, 0x6f, 0x70, 0x49, 0x6e, 0x66, 0x6f, 0x12, 0x0e, 0x0a, 0x02, 0x49,
	0x44, 0x18, 0x01, 0x20, 0x01, 0x28, 0x03, 0x52, 0x02, 0x49, 0x44, 0x12, 0x1d, 0x0a, 0x0a, 0x63,
	0x72, 0x65, 0x61, 0x74, 0x65, 0x64, 0x5f, 0x62, 0x79, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x09, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x64, 0x42, 0x79, 0x22, 0x35, 0x0a, 0x09, 0x53, 0x68,
	0x6f, 0x70, 0x49, 0x6e, 0x66, 0x6f, 0x73, 0x12, 0x28, 0x0a, 0x05, 0x69, 0x74, 0x65, 0x6d, 0x73,
	0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x12, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75,
	0x66, 0x2e, 0x53, 0x68, 0x6f, 0x70, 0x49, 0x6e, 0x66, 0x6f, 0x52, 0x05, 0x69, 0x74, 0x65, 0x6d,
	0x73, 0x42, 0x0b, 0x5a, 0x09, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2f, 0x62, 0x06,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_protobuf_shop_proto_rawDescOnce sync.Once
	file_protobuf_shop_proto_rawDescData = file_protobuf_shop_proto_rawDesc
)

func file_protobuf_shop_proto_rawDescGZIP() []byte {
	file_protobuf_shop_proto_rawDescOnce.Do(func() {
		file_protobuf_shop_proto_rawDescData = protoimpl.X.CompressGZIP(file_protobuf_shop_proto_rawDescData)
	})
	return file_protobuf_shop_proto_rawDescData
}

var file_protobuf_shop_proto_msgTypes = make([]protoimpl.MessageInfo, 2)
var file_protobuf_shop_proto_goTypes = []interface{}{
	(*ShopInfo)(nil),  // 0: protobuf.ShopInfo
	(*ShopInfos)(nil), // 1: protobuf.ShopInfos
}
var file_protobuf_shop_proto_depIdxs = []int32{
	0, // 0: protobuf.ShopInfos.items:type_name -> protobuf.ShopInfo
	1, // [1:1] is the sub-list for method output_type
	1, // [1:1] is the sub-list for method input_type
	1, // [1:1] is the sub-list for extension type_name
	1, // [1:1] is the sub-list for extension extendee
	0, // [0:1] is the sub-list for field type_name
}

func init() { file_protobuf_shop_proto_init() }
func file_protobuf_shop_proto_init() {
	if File_protobuf_shop_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_protobuf_shop_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ShopInfo); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_protobuf_shop_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ShopInfos); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_protobuf_shop_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   2,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_protobuf_shop_proto_goTypes,
		DependencyIndexes: file_protobuf_shop_proto_depIdxs,
		MessageInfos:      file_protobuf_shop_proto_msgTypes,
	}.Build()
	File_protobuf_shop_proto = out.File
	file_protobuf_shop_proto_rawDesc = nil
	file_protobuf_shop_proto_goTypes = nil
	file_protobuf_shop_proto_depIdxs = nil
}
