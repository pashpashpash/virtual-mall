package form

import (
	"fmt"
	"strings"

	"github.com/pashpashpash/virtual-mall/protobuf"

	"github.com/pashpashpash/virtual-mall/errorlist"

	"github.com/pashpashpash/virtual-mall/validator"

	"github.com/ethereum/go-ethereum/common"
	"google.golang.org/protobuf/proto"
)

type ShopInfoWriteForm struct {
	SourceAccount string `schema:"sourceaccount"`
	Message       string `schema:"message"`
	Signature     string `schema:"signature"`
}

func (me *ShopInfoWriteForm) Validate() errorlist.Errors {
	errs := errorlist.New()

	validator.CheckNotEmpty(me.Message, "subject", errs)
	validator.CheckNotEmpty(me.Signature, "message", errs)
	validator.VerifyAdminSignature(me.SourceAccount,
		me.Message, me.Signature, "signature", errs)

	if len(errs) == 0 {
		_, err := me.ParseShopInfo()
		if err != nil {
			errs["shopinfo"] = errorlist.NewError("shop could not be parsed")
		}
	}

	return errs
}

func (me *ShopInfoWriteForm) ParseShopInfo() (*protobuf.ShopInfo, error) {
	hexData := "0x" + strings.TrimPrefix(me.Message, "Shop Info: ")
	data := common.FromHex(hexData)
	shopInfoProto := protobuf.ShopInfo{}

	err := proto.Unmarshal(data, &shopInfoProto)
	if err != nil {
		return nil, err
	}

	return &shopInfoProto, nil
}

func (me *ShopInfoWriteForm) String() string {
	shopInfo, err := me.ParseShopInfo()
	if err != nil {
		return "Shop Info Write Error"
	}

	return "SHOPINFO#" + fmt.Sprint(shopInfo.ID)
}

type ShopInfoReadForm struct {
	Account       string `schema:"account"`
	SourceAccount string `schema:"sourceaccount"`
}

func (me *ShopInfoReadForm) Validate() errorlist.Errors {
	errs := errorlist.New()

	validator.CheckNotEmpty(me.Account, "account", errs)
	validator.CheckNotEmpty(me.SourceAccount, "sourceaccount", errs)

	return errs
}

func (me *ShopInfoReadForm) String() string {
	return "ACCOUNT#" + me.Account
}
