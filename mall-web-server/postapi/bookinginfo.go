package postapi

import (
	"fmt"
	"log"
	"net/http"
	"sort"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/pashpashpash/virtual-mall/datastoreclient"
	"github.com/pashpashpash/virtual-mall/form"
	"github.com/pashpashpash/virtual-mall/protobuf"
	"google.golang.org/api/iterator"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

func BookingInfoBizViewHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.BookingInfoBizReadForm)

	// validation & parsing
	if errs := FormParseVerify(form, "BookingInfoBizView", w, r); errs != nil {
		return
	}
	sourceAccount := common.HexToAddress(form.SourceAccount)
	if err := validateLoggedInSourceAccount(r, sourceAccount); err != nil {
		log.Println("BookingInfoBizView] Could not validate logged in source account: ", sourceAccount)
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	log.Println("[BookingInfoBizView] Fetching all booking infos without biz data")
	bookingInfos, err := datastoreclient.GetAllBookingInfosWithoutBizData()
	if err != nil && err != iterator.Done {
		log.Println("[BookingInfoBizView] Error Reading BookingInfos")
		http.Error(w, fmt.Sprintf("[BookingInfoBizView] Error Reading BookingInfos"), http.StatusInternalServerError)
		return
	}

	// response
	encoded, err := protojson.Marshal(bookingInfos)
	if err != nil {
		log.Println("[BookingInfoBizView] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal BookingInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing BookingInfos to response.... %+v\n", bookingInfos)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[BookingInfoBizView] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write BookingInfos"), http.StatusNotFound)
		return
	}
	log.Println("[BookingInfoBizView] Completed", bookingInfos)
}

// Perform a binary search to find the first one that lies just after the desired interval
// and then check if the previous one overlaps with it. This would be O(logN).
func checkValidBooking(b *protobuf.BookingInfo) bool {
	bookingInfos, err := datastoreclient.GetAllBookingInfosFromShop(b.Shop_ID)
	if err != nil && err != iterator.Done {
		log.Println("[checkValidBooking] Error Reading BookingInfos\n", err)
		return false
	}

	bi := bookingInfos.Items

	i := sort.Search(len(bi), func(i int) bool {
		return bi[i].Start > b.End
	})
	return i == 0 || bi[i-1].End < b.Start
}

func BookingInfoAddHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.BookingInfoAddForm)

	// validation & parsing
	if errs := FormParseVerify(form, "BookingInfoAddForm", w, r); errs != nil {
		return
	}
	sourceAccount := common.HexToAddress(form.SourceAccount)
	if err := validateLoggedInSourceAccount(r, sourceAccount); err != nil {
		log.Println("[BookingInfoAdd] Could not validate logged in source account: ", sourceAccount)
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	bookingInfo, err := form.ParseBookingInfo()
	log.Printf("[BookingInfoAdd] Incoming booking info:\n%+v\n", bookingInfo)
	if err != nil {
		http.Error(w, fmt.Sprintf("[BookingInfoAdd] Error Parsing BookingInfo"), http.StatusInternalServerError)
		return
	}

	if !checkValidBooking(bookingInfo) {
		log.Println("BookingInfoAdd] Could not validate incoming booking slot.: ", sourceAccount)
		http.Error(w, fmt.Sprintf("Could not validate incoming booking slot (conflict found)"), http.StatusUnauthorized)
		return
	}

	err = datastoreclient.WriteBookingInfo(bookingInfo)
	if err != nil {
		http.Error(w, fmt.Sprintf("[BookingInfoAdd] Error Writing BookingInfo"), http.StatusInternalServerError)
		return
	}

	// response
	encoded, err := proto.Marshal(bookingInfo)
	if err != nil {
		log.Println("[BookingInfoAdd] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal BookingInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing BookingInfos to response.... %+v\n", bookingInfo)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[BookingInfoAdd] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write BookingInfos"), http.StatusNotFound)
		return
	}
	log.Println("[BookingInfoAdd] Completed", bookingInfo)
}

func BookingInfoAdminViewHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.BookingInfoAdminReadForm)

	// validation & parsing
	if errs := FormParseVerify(form, "BookingInfoAdminView", w, r); errs != nil {
		return
	}
	sourceAccount := common.HexToAddress(form.SourceAccount)
	if err := validateLoggedInSourceAccount(r, sourceAccount); err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	bookingInfos, err := datastoreclient.GetAllBookingInfos()
	if err != nil && err != iterator.Done {
		http.Error(w, fmt.Sprintf("[BookingInfoBizView] Error Reading BookingInfos"), http.StatusInternalServerError)
		return
	}

	// response
	encoded, err := protojson.Marshal(bookingInfos)
	if err != nil {
		log.Println("[BookingInfoBizView] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal BookingInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing BookingInfos to response.... %+v\n", bookingInfos)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[BookingInfoBizView] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write BookingInfos"), http.StatusNotFound)
		return
	}
	log.Println("[BookingInfoBizView] Completed", bookingInfos)
}

func makeTimestamp() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}

func BookingInfoCurrentBookingsHandler(w http.ResponseWriter, r *http.Request) {
	bi, err := datastoreclient.GetAllBookingInfos()
	if err != nil && err != iterator.Done {
		http.Error(w, fmt.Sprintf("[BookingInfoBizView] Error Reading BookingInfos"), http.StatusInternalServerError)
		return
	}

	currTime := makeTimestamp()
	bookingInfos := protobuf.BookingInfos{}
	for i := 0; i < len(bi.Items); i++ {
		if currTime >= bi.Items[i].Start && currTime <= bi.Items[i].End {
			// current booking found
			bookingInfos.Items = append(bookingInfos.Items, bi.Items[i])
		}
	}

	// response
	encoded, err := protojson.Marshal(&bookingInfos)
	if err != nil {
		log.Println("[BookingInfoBizView] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal BookingInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing BookingInfos to response.... %+v\n", bookingInfos)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[BookingInfoBizView] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write BookingInfos"), http.StatusNotFound)
		return
	}
	log.Println("[BookingInfoBizView] Completed", bookingInfos, encoded)
}

func BookingInfoNextAvailableHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.BookingInfoAddForm)

	// validation & parsing
	if errs := FormParseVerify(form, "BookingInfoNextAvailableForm", w, r); errs != nil {
		return
	}
	sourceAccount := common.HexToAddress(form.SourceAccount)
	if err := validateLoggedInSourceAccount(r, sourceAccount); err != nil {
		log.Println("[BookingInfoNextAvailableHandler] Could not validate logged in source account: ", sourceAccount)
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	bookingInfo, err := form.ParseBookingInfo()
	log.Printf("[BookingInfoNextAvailableHandler] Incoming booking info:\n%+v\n", bookingInfo)
	if err != nil {
		http.Error(w, fmt.Sprintf("[BookingInfoNextAvailableHandler] Error Parsing BookingInfo"), http.StatusInternalServerError)
		return
	}

	// query datastore for next available slot in shop #bookingInfo.Shop_ID
	bi, err := datastoreclient.GetNextAvailableBookingInfoFromShop(bookingInfo.Shop_ID)
	if err != nil && err != iterator.Done {
		log.Println("[BookingInfoNextAvailableHandler] Error Reading BookingInfos")
		http.Error(w, fmt.Sprintf("[BookingInfoNextAvailableHandler] Error Reading BookingInfos"), http.StatusInternalServerError)
		return
	}

	// response
	encoded, err := protojson.Marshal(bi)
	if err != nil {
		log.Println("[BookingInfoNextAvailableHandler] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal BookingInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing BookingInfos to response.... %+v\n", bookingInfo)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[BookingInfoNextAvailableHandler] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write BookingInfos"), http.StatusNotFound)
		return
	}
	log.Println("[BookingInfoNextAvailableHandler] Completed", bookingInfo)
}

func BookingInfoNextAvailableAllHandler(w http.ResponseWriter, r *http.Request) {
	form := new(form.BookingInfoBizReadForm)

	// validation & parsing
	if errs := FormParseVerify(form, "BookingInfoBizView", w, r); errs != nil {
		return
	}
	sourceAccount := common.HexToAddress(form.SourceAccount)
	if err := validateLoggedInSourceAccount(r, sourceAccount); err != nil {
		log.Println("BookingInfoBizView] Could not validate logged in source account: ", sourceAccount)
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	bookingInfos, err := datastoreclient.GetNextAvailableBookingInfos()
	if err != nil && err != iterator.Done {
		log.Println("[BookingInfoNextAvailableHandler] Error Reading BookingInfos")
		http.Error(w, fmt.Sprintf("[BookingInfoNextAvailableHandler] Error Reading BookingInfos"), http.StatusInternalServerError)
		return
	}

	// response
	encoded, err := protojson.Marshal(bookingInfos)
	if err != nil {
		log.Println("[BookingInfoBizView] Error Marshaling")
		http.Error(w, fmt.Sprintf("Could Not Marshal BookingInfo"), http.StatusNotFound)
		return
	}
	log.Printf("Writing BookingInfos to response.... %+v\n", bookingInfos)
	_, err = w.Write(encoded)
	if err != nil {
		log.Println("[BookingInfoBizView] Error Response Writing", err)
		http.Error(w, fmt.Sprintf("Could Not Write BookingInfos"), http.StatusNotFound)
		return
	}
	log.Println("[BookingInfoBizView] Completed", bookingInfos)
}
