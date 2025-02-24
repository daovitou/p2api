import { responseHandler } from "express-intercept"
import { redisClient } from "../db/redis.db";
import { NextFunction, Request, Response } from "express";

export const catchRedisInterceptor = (ttl?: number) =>
    responseHandler()
        .for((req) => req.method == "GET")
        .if((res) => {
            const codes = [200, 201, 202, 203, 204];
            return codes.includes(res.statusCode);
        }).getString(async (body, req, res) => {
            console.log(JSON.parse(body))
            if (res) {
                const { originalUrl } = res.req;
                redisClient.set(originalUrl, body, {
                    EX: ttl,
                });
            }
        });
export const invalidRedisInterceptor = responseHandler()
    .for((req) => {
        const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        return methods.includes(req.method);
    })
    .if((res) => {
        const codes = [200, 201, 202, 203, 204];
        return codes.includes(res.statusCode);
    })
    .getString(async (body, req, res) => {
        if (req) {
            const { baseUrl } = req;
            const keys = await redisClient.keys(`${baseUrl}*`);
            // console.log(keys)
            for (let i = 0; i < keys.length; i++) {
                await redisClient.del(keys[i]);
            }
        }

    })

export const catchRedisHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { originalUrl, method } = req;
        if (method == 'GET') {
            const data = await redisClient.get(originalUrl);
            if (data !== null) {
                return res.json(JSON.parse(data));
            }
        }
        next();
    } catch (error) {
        next(error)
    }
}