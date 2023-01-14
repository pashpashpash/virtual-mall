package validator

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/pashpashpash/virtual-mall/errorlist"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/nugbase/dappauth"
)

var (
	ETH_CLIENT *ethclient.Client
)

type Validator interface {
	Validate(map[string]error)
}

func Run(ethClient *ethclient.Client) {
	ETH_CLIENT = ethClient
}

func CheckNotEmpty(input, name string, errs errorlist.Errors) {
	if len(strings.TrimSpace(input)) == 0 {
		errs[name] = errorlist.NewError("cannot be blank")
	}
}

func signHash(data []byte) []byte {
	msg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(data), data)
	return crypto.Keccak256([]byte(msg))
}

func ecRecover(sigHex string, msg []byte) (common.Address, error) {
	sig := hexutil.MustDecode(sigHex)

	if sig[64] != 27 && sig[64] != 28 && sig[64] != 0 && sig[64] != 1 {
		// From go-eth PrivateAccountAPI.EcRecover
		log.Println("Invalid Ethereum Signature")
		return common.Address{}, errors.New("Invalid Ethereum Signature")
	}
	if sig[64] == 27 || sig[64] == 28 {
		sig[64] -= 27 // Transform yellow paper V from 27/28 to 0/1
	}
	pubKey, err := crypto.SigToPub(signHash(msg), sig)
	if err != nil {
		log.Println("Error SigToPub", err)
		return common.Address{}, err
	}

	recoveredAddr := crypto.PubkeyToAddress(*pubKey)

	return recoveredAddr, nil
}

// TODO: Replay Attacks: should implement nonce, destination ID
// TODO: Admin Types: everything is validated against Store Managers
func VerifyAdminSignature(sourceAccount, message, signature, name string, errs errorlist.Errors) {
	if sourceAccount != "0xc1D622d588B92D2F7553c6fe66b1Ce6C52ec36f9" {
		log.Println("[VerifyAdminSignature] Signer Not On Admin List:", sourceAccount)
		errs[name] = errorlist.NewError("signer is not on admin list")
		return
	}

	givenAddr := common.HexToAddress(sourceAccount)
	recoveredAddr, err := ecRecover(signature, []byte(message))
	if err != nil {
		errs[name] = errorlist.NewError("cannot verify signature: " + err.Error())
		return
	}

	if recoveredAddr == givenAddr {
		log.Println("[VerifyAdminSignature] Admin Verified:", recoveredAddr.Hex())
		return
	} else {
		errs[name] = errorlist.NewError("signer is not admin")
		log.Println("pubkey is not admin", recoveredAddr.Hex())
		return
	}
}

// TODO: Replay Attacks: should implement nonce, destination ID
func VerifySignature(sourceAccount, message, signature, name string, errs errorlist.Errors) {
	// Try EIP-1654 Scheme (I.e. Dapper Smart Contract Wallet Sig)
	if len(signature) != 132 {
		log.Println("Weird sig, trying EIP-1654")
		VerifyEIP1654Signature(sourceAccount, message, signature, name, errs)
		return
	}

	givenAddr := common.HexToAddress(sourceAccount)
	recoveredAddr, err := ecRecover(signature, []byte(message))
	if err != nil {
		errs[name] = errorlist.NewError("cannot verify signature: " + err.Error())
		log.Println("[VerifySignature] cannot verify:", err)
		return
	}

	if recoveredAddr == givenAddr {
		log.Println("[VerifySignature] Signature Verified:", recoveredAddr.Hex())
		return
	} else {
		errs[name] = errorlist.NewError("signature is not valid")
		log.Println("[VerifySignature] Signature Failed:", recoveredAddr.Hex())
		return
	}
}

func VerifyEIP1654Signature(sourceAccount, message, signature, name string,
	errs errorlist.Errors) {

	authenticator := dappauth.NewAuthenticator(context.Background(), ETH_CLIENT)
	isAuthorized, err := authenticator.IsAuthorizedSigner(
		message, signature, sourceAccount)

	if err != nil {
		errs[name] = errorlist.NewError("cannot verify signature: " + err.Error())
		log.Println("[VerifyEIP1654Signature] cannot verify:", err)
		return
	}

	if !isAuthorized {
		errs[name] = errorlist.NewError("signature is not valid")
		log.Println("[VerifyEIP1654Signature] signature invalid from:", sourceAccount)
		return
	}
}
