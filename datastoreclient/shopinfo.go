package datastoreclient

import (
	"context"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/datastore"
	"github.com/pashpashpash/virtual-mall/protobuf"
	"google.golang.org/api/iterator"
)

const ShopDataKind string = "ShopInfo"

func WriteShopInfo(shop *protobuf.ShopInfo) error {
	startTime := time.Now()

	keyName := shop.ID
	key := NameKey(ShopDataKind, fmt.Sprint(keyName), nil)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*60)
	defer cancel()
	if _, err := DatastoreClient.Put(ctx, key, shop); err != nil {
		log.Printf("[Datastore] Error Updating %v ShopInfo: %v", shop, err)
		return err
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] Shop Write Latency: %s\n", elapsed)

	return nil
}

func GetShopInfoWithHighestId() (protobuf.ShopInfo, error) {
	var shop protobuf.ShopInfo
	var err error
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	q := NewQuery("ShopInfo").
		Order("-ID").
		Limit(1)

	iter := DatastoreClient.Run(ctx, q)
	for _, err = iter.Next(&shop); err == nil; _, err = iter.Next(&shop) { //checks for last DB entry
		return shop, err
	}
	if err != nil {
		log.Printf("[Datastore] Error Getting Latest ShopInfo!\n %v\n", err)
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetShopInfoWithHighestId Latency: %s\n", elapsed)
	return shop, err
}

func GetAllShopsInfo() (*protobuf.ShopInfos, error) {
	var shops protobuf.ShopInfos
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	iter := GetAllShopsIter(ctx)
	for {
		var shop protobuf.ShopInfo

		_, err := iter.Next(&shop)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		shops.Items = append(shops.Items, &shop)
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetAllShopsInfo Latency: %s\n", elapsed)
	return &shops, nil
}

func GetAllShopsIter(ctx context.Context) *datastore.Iterator {
	q := NewQuery("ShopInfo").
		Order("-ID")

	return DatastoreClient.Run(ctx, q)
}

func DeleteShopInfoByID(id int64) error {
	startTime := time.Now()

	key := NameKey(ShopDataKind, fmt.Sprint(id), nil)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*60)
	defer cancel()
	if err := DatastoreClient.Delete(ctx, key); err != nil {
		log.Printf("[Datastore] Error Deleting #%d ShopInfo: %v", id, err)
		return err
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] Shop Delete Latency: %s\n", elapsed)

	return nil
}
