package postapi

import (
	"fmt"
	"log"
	"net/http"

	"github.com/ethereum/go-ethereum/common"
	"github.com/pashpashpash/virtual-mall/datastoreclient"
	"github.com/pashpashpash/virtual-mall/form"
	"google.golang.org/api/iterator"
	"google.golang.org/protobuf/proto"
)

// ShopInfoReadHandler Returns a UserValue protobuf for the account
func ShopInfoReadHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.SingleStringForm)

	if errs := FormParseVerify(form, "ShopInfoRead", w, r); errs != nil {
		return
	}

	shops, err := datastoreclient.GetAllShopsInfo()
	if err != nil && err != iterator.Done {
		http.Error(w, fmt.Sprintf("[ShopInfoRead] Error Writing ShopInfo"), http.StatusInternalServerError)
		return
	}

	// response
	encoded, err := proto.Marshal(shops)
	if err != nil {
		log.Println("[ShopInfoRead] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal ShopInfo"), http.StatusNotFound)
		return
	}

	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[ShopInfoRead] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write ShopInfo"), http.StatusNotFound)
		return
	}
	log.Println("[ShopInfoRead] Completed", shops)
}

func ShopInfoAddHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.ShopInfoWriteForm)

	// validation & parsing
	if errs := FormParseVerify(form, "ShopInfoWrite", w, r); errs != nil {
		return
	}
	sourceAccount := common.HexToAddress(form.SourceAccount)
	if err := validateLoggedInSourceAccount(r, sourceAccount); err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	shopInfo, err := form.ParseShopInfo()
	log.Printf("[ShopInfoWrite] Incoming shop info:\n%+v\n", shopInfo)
	if err != nil {
		http.Error(w, fmt.Sprintf("[ShopInfoWrite] Error Parsing ShopInfo"), http.StatusInternalServerError)
		return
	}

	log.Printf("Saving ShopInfo.... %+v\n", shopInfo)

	latestShop, err := datastoreclient.GetShopInfoWithHighestId()
	// saving shopInfo to db
	if err != nil && err != iterator.Done {
		http.Error(w, fmt.Sprintf("[ShopInfoWrite] Error querying latest shop info"), http.StatusInternalServerError)
		return
	}

	if err == iterator.Done {
		shopInfo.ID = 0
	} else {
		shopInfo.ID = latestShop.ID + 1
	}

	err = datastoreclient.WriteShopInfo(shopInfo)
	if err != nil {
		http.Error(w, fmt.Sprintf("[ShopInfoWrite] Error Writing ShopInfo"), http.StatusInternalServerError)
		return
	}

	// response
	encoded, err := proto.Marshal(shopInfo)
	if err != nil {
		log.Println("[ShopInfoWrite] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal ShopInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing ShopInfo to response.... %+v\n", shopInfo)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[ShopInfoWrite] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write ShopInfo"), http.StatusNotFound)
		return
	}
	log.Println("[ShopInfoWrite] Completed", shopInfo)
}

func ShopInfoDeleteHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.ShopInfoWriteForm)

	// validation & parsing
	if errs := FormParseVerify(form, "ShopInfoDelete", w, r); errs != nil {
		return
	}
	sourceAccount := common.HexToAddress(form.SourceAccount)
	if err := validateLoggedInSourceAccount(r, sourceAccount); err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	shopInfo, err := form.ParseShopInfo()
	log.Printf("[ShopInfoWrite] Incoming shop info:\n%+v\n", shopInfo)
	if err != nil {
		http.Error(w, fmt.Sprintf("[ShopInfoWrite] Error Parsing ShopInfo"), http.StatusInternalServerError)
		return
	}

	log.Printf("Saving ShopInfo.... %+v\n", shopInfo)

	err = datastoreclient.DeleteShopInfoByID(shopInfo.ID)
	if err != nil {
		http.Error(w, fmt.Sprintf("[ShopInfoWrite] Error Deleting ShopInfo"), http.StatusInternalServerError)
		return
	}

	//todo: remove all booking infos for this shop as well.

	// response
	encoded, err := proto.Marshal(shopInfo)
	if err != nil {
		log.Println("[ShopInfoWrite] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal ShopInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing ShopInfo to response.... %+v\n", shopInfo)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[ShopInfoWrite] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write ShopInfo"), http.StatusNotFound)
		return
	}
	log.Println("[ShopInfoWrite] Completed", shopInfo)
}
