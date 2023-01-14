package form

import (
	"github.com/pashpashpash/virtual-mall/validator"

	"github.com/pashpashpash/virtual-mall/errorlist"
)

type SessionLogin struct {
	SourceAccount string `schema:"sourceaccount"`
	Message       string `schema:"message"`
	Signature     string `schema:"signature"`
}

func (me *SessionLogin) Validate() errorlist.Errors {
	errs := errorlist.New()

	validator.CheckNotEmpty(me.Message, "subject", errs)
	validator.CheckNotEmpty(me.Signature, "message", errs)
	validator.VerifySignature(me.SourceAccount,
		me.Message, me.Signature, "signature", errs)

	return errs
}

func (me *SessionLogin) String() string {
	return me.SourceAccount
}
