package datastoreclient

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/pashpashpash/virtual-mall/protobuf"
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
	log.Printf("[Datastore] GetLatestEtherFlower Latency: %s\n", elapsed)
	return shop, err
}

func GetAllShopsInfo() (*protobuf.ShopInfos, error) {
	var shops protobuf.ShopInfos
	var shop protobuf.ShopInfo
	var err error
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	q := NewQuery("ShopInfo").
		Order("ID")

	iter := DatastoreClient.Run(ctx, q)
	for _, err = iter.Next(&shop); err != nil; _, err = iter.Next(&shop) { //checks for last DB entry
		shops.Items = append(shops.Items, &shop)
	}
	if err != nil {
		log.Printf("[Datastore] Error Getting ShopInfo!\n %v\n", err)
		return nil, err
	}

	elapsed := time.Since(startTime)
	log.Printf("[Datastore] GetLatestEtherFlower Latency: %s\n", elapsed)
	return &shops, nil
}
