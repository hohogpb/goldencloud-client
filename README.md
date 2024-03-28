# goldencloud-client

[![npm](https://img.shields.io/npm/v/goldencloud-client)](https://www.npmjs.com/package/goldencloud-client)

高登云开票 sdk js实现

[高登云接口文档](https://docs.gc365.com/%E4%BA%91%E5%BC%80%E7%A5%A8/%E4%BA%A7%E5%93%81%E4%BB%8B%E7%BB%8D/%E4%BA%A7%E5%93%81%E6%A6%82%E8%BF%B0.html)

``` js
import GoldenCloundClient from "goldencloud-client"

async function testQuery() {
  const client = new GoldenCloudClient(
    "your appkey",
    "your appsecret"
  );

  const payload = {
    seller_taxpayer_num: "售方税号",
    order_id: "订单id",
  };

  const resp = await client.post("/tax-api/invoice/query/v1", payload);
  console.log(await resp.json());
}
```
