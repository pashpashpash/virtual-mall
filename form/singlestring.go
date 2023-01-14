package form

import (
	"github.com/pashpashpash/virtual-mall/errorlist"
)

type SingleStringForm struct {
	Input         string `schema:"input"`
	SourceAccount string `schema:"sourceaccount"`
}

func (me *SingleStringForm) Validate() errorlist.Errors {
	return errorlist.New()
}

func (me *SingleStringForm) String() string {
	return me.Input
}
