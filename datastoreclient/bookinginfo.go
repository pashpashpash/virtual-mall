package datastoreclient

import (
	"context"
	"log"
	"time"

	"cloud.google.com/go/datastore"
	"github.com/pashpashpash/virtual-mall/protobuf"
	"google.golang.org/api/iterator"
)

const BookingDataKind string = "BookingInfo"

func WriteBookingInfo(booking *protobuf.BookingInfo) error {
	startTime := time.Now()

	key := NameKey(BookingDataKind, "", nil)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*60)
	defer cancel()
	if _, err := DatastoreClient.Put(ctx, key, booking); err != nil {
		log.Printf("[Datastore] Error Updating %v ShopInfo: %v", booking, err)
		return err
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] Shop Write Latency: %s\n", elapsed)

	return nil
}

func GetAllBookingInfosWithoutBizData() (*protobuf.BookingInfos, error) {
	var bookings protobuf.BookingInfos
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	log.Println(">>>>>>>>>>>> iterating through all bookings")
	iter := GetAllBookingsIter(ctx)
	for {
		var booking protobuf.BookingInfo

		_, err := iter.Next(&booking)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		booking.Biz = "censored"
		log.Println(">>>>>>>>>>>> booking:", booking)

		bookings.Items = append(bookings.Items, &booking)
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetAllBookingInfosWithoutBizData Latency: %s\n", elapsed)
	return &bookings, nil
}

func GetAllBookingInfos() (*protobuf.BookingInfos, error) {
	var bookings protobuf.BookingInfos
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	iter := GetAllBookingsIter(ctx)
	for {
		var booking protobuf.BookingInfo

		_, err := iter.Next(&booking)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		bookings.Items = append(bookings.Items, &booking)
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetAllBookingInfosWithoutBizData Latency: %s\n", elapsed)
	return &bookings, nil
}

func GetAllBookingsIter(ctx context.Context) *datastore.Iterator {
	q := NewQuery("BookingInfo").
		Order("Start")

	return DatastoreClient.Run(ctx, q)
}

func GetAllBookingInfosFromShop(shopID int64) (*protobuf.BookingInfos, error) {
	var bookings protobuf.BookingInfos
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	q := NewQuery("BookingInfo").
		Order("Start")
	iter := DatastoreClient.Run(ctx, q)

	for {
		var booking protobuf.BookingInfo

		_, err := iter.Next(&booking)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		if booking.Shop_ID == shopID {
			bookings.Items = append(bookings.Items, &booking)
		}
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetAllBookingInfosFromShop Latency: %s\n", elapsed)
	return &bookings, nil
}

func DeleteAllBookingInfosByBiz(bizID string) (*protobuf.BookingInfos, error) {
	var bookings protobuf.BookingInfos
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	q := NewQuery("BookingInfo").
		Filter("Biz =", bizID)
	iter := DatastoreClient.Run(ctx, q)

	for {
		var booking protobuf.BookingInfo

		key, err := iter.Next(&booking)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		bookings.Items = append(bookings.Items, &booking)

		if err := DatastoreClient.Delete(ctx, key); err != nil {
			log.Printf("[Datastore] Error Deleting #%s Biz: %v", bizID, err)
			return nil, err
		}

		log.Printf("Successfully deleted booking for shop #%d by biz %s\n", booking.Shop_ID, booking.Biz)
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetAllBookingInfosFromShop Latency: %s\n", elapsed)
	return &bookings, nil
}

func DeleteAllBookingInfosByShop(shopID int64) (*protobuf.BookingInfos, error) {
	var bookings protobuf.BookingInfos
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	q := NewQuery("BookingInfo").
		Filter("Shop_ID =", shopID)
	iter := DatastoreClient.Run(ctx, q)

	for {
		var booking protobuf.BookingInfo

		key, err := iter.Next(&booking)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		bookings.Items = append(bookings.Items, &booking)

		if err := DatastoreClient.Delete(ctx, key); err != nil {
			log.Printf("[Datastore] Error Deleting #%d Shop's Booking: %v", shopID, err)
			return nil, err
		}

		log.Printf("Successfully deleted booking for shop #%d by biz %s\n", booking.Shop_ID, booking.Biz)
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetAllBookingInfosFromShop Latency: %s\n", elapsed)
	return &bookings, nil
}

func makeTimestamp() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}

func GetNextAvailableSlot(bookings protobuf.BookingInfos) *protobuf.BookingInfo {
	currTime := makeTimestamp()
	var booking protobuf.BookingInfo

	if len(bookings.Items) == 0 {
		booking.Start = currTime
		booking.End = 9999999999999
	} else {
		nextBookedSlotAfterCurrentTime := -1
		for i := 0; i < len(bookings.Items); i++ {
			if currTime < bookings.Items[i].Start {
				nextBookedSlotAfterCurrentTime = i
				break
			}
		}
		if nextBookedSlotAfterCurrentTime == 0 {
			// curr time is less than first slot starting time
			booking.Start = currTime
			booking.End = bookings.Items[0].Start - 1
		} else if nextBookedSlotAfterCurrentTime > 0 {
			// curr time is in between slots' starting times
			if bookings.Items[nextBookedSlotAfterCurrentTime-1].End < currTime {
				booking.Start = currTime
				booking.End = bookings.Items[nextBookedSlotAfterCurrentTime].Start - 1
			} else {
				booking.Start = bookings.Items[nextBookedSlotAfterCurrentTime-1].End + 1
				booking.End = bookings.Items[nextBookedSlotAfterCurrentTime].Start - 1
			}
		} else {
			// curr time is above all slots' starting time
			lastTimeSlot := bookings.Items[len(bookings.Items)-1]
			if lastTimeSlot.End >= currTime {
				booking.Start = lastTimeSlot.End + 1
			} else {
				booking.Start = currTime
			}
			booking.End = 9999999999999
		}
	}

	return &booking
}

func GetNextAvailableBookingInfoFromShop(shopID int64) (*protobuf.BookingInfo, error) {
	var bookings protobuf.BookingInfos
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	q := NewQuery("BookingInfo").
		Order("Start")
	iter := DatastoreClient.Run(ctx, q)

	for {
		var booking protobuf.BookingInfo

		_, err := iter.Next(&booking)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		if booking.Shop_ID == shopID {
			bookings.Items = append(bookings.Items, &booking)
		}
	}

	booking := GetNextAvailableSlot(bookings)

	booking.Shop_ID = shopID

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetNextAvailableBookingInfoFromShop Latency: %s\n", elapsed)
	return booking, nil
}

func GetNextAvailableBookingInfos() (*protobuf.BookingInfos, error) {
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	q := NewQuery("BookingInfo").
		Order("Start")
	iter := DatastoreClient.Run(ctx, q)

	lookupMap := map[int64][]*protobuf.BookingInfo{}

	for {
		var booking protobuf.BookingInfo

		_, err := iter.Next(&booking)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		items := lookupMap[booking.Shop_ID]
		items = append(items, &booking)
		lookupMap[booking.Shop_ID] = items
	}

	var bookings protobuf.BookingInfos
	for k, v := range lookupMap {
		bifos := protobuf.BookingInfos{}
		bifos.Items = v

		booking := GetNextAvailableSlot(bifos)
		booking.Shop_ID = k
		bookings.Items = append(bookings.Items, booking)
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetNextAvailableBookingInfoFromShop Latency: %s\n", elapsed)
	return &bookings, nil
}
