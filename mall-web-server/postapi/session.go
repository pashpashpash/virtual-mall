package postapi

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/pashpashpash/virtual-mall/form"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/ethereum/go-ethereum/common"
)

// TODO Change key 12/13/2021 Nighttrek
var jwtKey = []byte("4PG7e87t4PG7m748njKKadLm74e87tKadL8njK")

const (
	authPubTokenPrefix  = "NUGPUB-"
	authPrivTokenPrefix = "NUGPRIV-"
	authTokenLifespan   = 24 * time.Hour
)

type Claims struct {
	Account string `json:"account"`
	jwt.StandardClaims
}

func SessionLoginHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.SessionLogin)

	if errs := FormParseVerify(form, "SessionLogin", w, r); errs != nil {
		return
	}

	expirationTime := time.Now().Add(authTokenLifespan)

	claims := &Claims{
		Account: form.SourceAccount,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Write restricted access JWT Cookie
	http.SetCookie(w, &http.Cookie{
		Name:     authPrivTokenPrefix + form.SourceAccount,
		Value:    tokenString,
		Expires:  expirationTime,
		Path:     "/",
		HttpOnly: true,                 // cookie not accessible by javascript
		SameSite: http.SameSiteLaxMode, // protects against CSRF
	})

	// Write public cookie letting JS check login state of accounts
	http.SetCookie(w, &http.Cookie{
		Name:     authPubTokenPrefix + form.SourceAccount,
		Value:    "1",
		Expires:  expirationTime,
		Path:     "/",
		SameSite: http.SameSiteLaxMode, // protects against CSRF
	})

	log.Println("[SessionLogin] Cookie Written", form)
}

// Gives raw claims, based on a JWT cookie. Overall, if this function does
// not error, then the claims are valid, and the user is logged in. However,
// due to paranoia and ease of use, a lot of the code uses the simpler
// validateLoggedInSourceAccount()
func isLoggedIn(r *http.Request, sourceAddress common.Address) (*Claims, error) {
	sourceAccount := sourceAddress.Hex()
	c, err := r.Cookie(authPrivTokenPrefix + sourceAccount)
	if err != nil {
		return nil, err
	}

	tknStr := c.Value
	claims := &Claims{}
	tkn, err := jwt.ParseWithClaims(tknStr, claims,
		func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
	if err != nil {
		return nil, err
	}

	if !tkn.Valid {
		return nil, errors.New("Invalid Auth Token")
	}

	return claims, nil
}

// Handy function for checking if the user is logged in with the given
// sourceAccount. Returns an error if they're not logged in. Kind of does
// the same job as isLoggedIn(), but with extra paranoia and the claims
// are not returned, making it easier to use
func validateLoggedInSourceAccount(
	r *http.Request, sourceAccount common.Address) error {

	claims, err := isLoggedIn(r, sourceAccount)
	if err != nil {
		return fmt.Errorf("Not Logged In")
	}

	if sourceAccount.Hex() == "0x0000000000000000000000000000000000000000" {
		return fmt.Errorf("Not Logged In")
	}

	if claims.Account != sourceAccount.Hex() {
		return fmt.Errorf("Not Logged In")
	}

	return nil
}
