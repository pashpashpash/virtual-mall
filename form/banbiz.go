package form

import (
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/pashpashpash/virtual-mall/errorlist"
	"github.com/pashpashpash/virtual-mall/protobuf"
	"google.golang.org/protobuf/proto"

	"github.com/pashpashpash/virtual-mall/validator"
)

type BanBizForm struct {
	SourceAccount string `schema:"sourceaccount"`
	Message       string `schema:"message"`
	Signature     string `schema:"signature"`
}

func (me *BanBizForm) Validate() errorlist.Errors {
	errs := errorlist.New()

	validator.CheckNotEmpty(me.Message, "subject", errs)
	validator.CheckNotEmpty(me.Signature, "message", errs)
	validator.VerifyAdminSignature(me.SourceAccount,
		me.Message, me.Signature, "signature", errs)

	if len(errs) == 0 {
		_, err := me.ParseBookingInfo()
		if err != nil {
			errs["shopinfo"] = errorlist.NewError("shop could not be parsed")
		}
	}

	return errs
}

func (me *BanBizForm) ParseBookingInfo() (*protobuf.BookingInfo, error) {
	hexData := "0x" + strings.TrimPrefix(me.Message, "Ban Biz: ")
	data := common.FromHex(hexData)
	bookingInfoProto := protobuf.BookingInfo{}

	err := proto.Unmarshal(data, &bookingInfoProto)
	if err != nil {
		return nil, err
	}

	return &bookingInfoProto, nil
}

func (me *BanBizForm) String() string {
	bookingInfo, err := me.ParseBookingInfo()
	if err != nil {
		return "Shop Info Write Error"
	}

	return "SHOPINFO#" + fmt.Sprint(bookingInfo.GetBiz)
}
