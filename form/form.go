package form

import "github.com/pashpashpash/virtual-mall/errorlist"

type Form interface {
	Validate() errorlist.Errors
	String() string
}
