import crypto from "crypto";
import { URL } from "url";

export default class GoldenCloudClient {
  env: string;
  appkey: string;
  secret: string;

  baseUrls = {
    test: "https://apigw-test.goldentec.com",
    prod: "https://apigw.goldentec.com",
  };

  constructor(appkey: string, secret: string, env = "test") {
    this.appkey = appkey;
    this.secret = secret;
    this.env = env;
  }

  static hmacSha256Base64(srcStr: string, secretKey: string) {
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(srcStr);
    const hash = hmac.digest("binary");
    const base64Encoded = Buffer.from(hash, "binary").toString("base64");
    return base64Encoded;
  }

  sign(url: string, payload: any) {
    const publicArgs = {
      algorithm: "HMAC-SHA256",
      appkey: this.appkey,
      nonce: Math.floor(Math.random() * 900000) + 100000,
      timestamp: Math.floor(Date.now() / 1000),
    };

    // 1.对公共参数进行排序，按照key升序排列
    const sortedPublicArgs = Object.entries(publicArgs).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    // 2.参数转为 参数名称=参数值
    const stringifyPublicArgs = sortedPublicArgs.map((arg) => {
      const [key, value] = arg;
      return `${key}=${value}`;
    });

    // 3.所有参数拍好队
    const args = [...stringifyPublicArgs, url, JSON.stringify(payload)];

    // 4.用 | 连接所有参数
    const argsStr = args.join("|");

    // 5.生成签名串 signature
    const signature = GoldenCloudClient.hmacSha256Base64(argsStr, this.secret);

    // 6.生成签名请求字符串
    const authorizationStr = [
      ...stringifyPublicArgs,
      `signature=${signature}`,
    ].join(",");

    return authorizationStr;
  }

  getFullUrl(url: string) {
    const env = this.env;
    if (env != "prod" && env != "test") {
      throw new Error("请设置开发模式 test 或 prod");
    }
    return new URL(url, this.baseUrls[env]);
  }

  async post(url: string, payload: any) {
    const authorizationStr = this.sign(url, payload);
    const fullUrl = this.getFullUrl(url);

    const resp = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationStr,
      },
      method: "post",
      body: JSON.stringify(payload),
    });

    return resp;
  }
}
