package postapi

import (
	"fmt"
	"log"
	"net/http"

	"github.com/ethereum/go-ethereum/common"
	"github.com/pashpashpash/virtual-mall/datastoreclient"
	"github.com/pashpashpash/virtual-mall/form"
	"google.golang.org/api/iterator"
	"google.golang.org/protobuf/encoding/protojson"
)

func BanBizHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.BanBizForm)

	// validation & parsing
	if errs := FormParseVerify(form, "BanBizHandler", w, r); errs != nil {
		return
	}
	sourceAccount := common.HexToAddress(form.SourceAccount)
	if err := validateLoggedInSourceAccount(r, sourceAccount); err != nil {
		log.Println("[BanBizHandler] Could not validate logged in source account: ", sourceAccount)
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	bookingInfo, err := form.ParseBookingInfo()
	log.Printf("[BanBizHandler] Incoming booking info:\n%+v\n", bookingInfo)
	if err != nil {
		http.Error(w, fmt.Sprintf("[BanBizHandler] Error Parsing BookingInfo"), http.StatusInternalServerError)
		return
	}

	log.Printf("[BanBizHandler] Biz to be banned:\n%+v\n", bookingInfo.Biz)
	bookingsInfo, err := datastoreclient.DeleteAllBookingInfosByBiz(bookingInfo.Biz)
	if err != nil && err != iterator.Done {
		http.Error(w, fmt.Sprintf("[BanBizHandler] Error Reading BookingInfos"), http.StatusInternalServerError)
		return
	}

	// response
	encoded, err := protojson.Marshal(bookingsInfo)
	if err != nil {
		log.Println("[BanBizHandler] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal BookingInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing BookingInfos to response.... %+v\n", bookingsInfo)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[BanBizHandler] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write BookingInfos"), http.StatusNotFound)
		return
	}
	log.Println("[BanBizHandler] Completed", bookingsInfo)
}
