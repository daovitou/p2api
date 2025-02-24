import dotenv from "dotenv";
dotenv.config();
import express, { Application, NextFunction, Request, Response } from "express";
import { notfoundHandler } from "./middlewares/notfoun.handler";
import { serverHandler } from "./middlewares/server.handler";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import YAML from "yaml";
import passport from "passport";
import jwtStrategy from "./utils/jwtStrategy";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
import roleRoute from "./routes/role.route";
import bookRoute from "./routes/book.route";
import bookCategoryRoute from "./routes/book.category.route";
import languageRoute from "./routes/language.route";
import videoCategoryRoute from "./routes/video.category.route";
import videoRoute from "./routes/video.route";
import pageRoute from "./routes/page.route";
import cookieParser from "cookie-parser";
import minioRoute from "./routes/minio.route";
import dashboardRoute from "./routes/dashboard.route";
import mobileBookcategoryRoute from "./routes/mobile/mobile.bookcategory.route";
import mobileBookRoute from "./routes/mobile/mobile.book.route";
import mobileVideoCategoryRoute from "./routes/mobile/mobile.video.category.route";
import mobileVideoRoute from "./routes/mobile/mobile.video.route";
import { errorResponse, successResponse } from "./utils/responses";
import { RoleModel, UserModel } from "./models/sequelize.db";
import Redis from "ioredis";
import { Server } from "socket.io";
import { createServer } from "node:http";
import RedisStore from "rate-limit-redis";
import { redisClient } from "./db/redis.db";
import { catchRedisHandler, catchRedisInterceptor, invalidRedisInterceptor } from "./middlewares/interceptor.handler";
import {createAdapter } from "@socket.io/redis-adapter"
import { AppPort } from "./utils/helpers";
import mobilePageRoute from "./routes/mobile/mobile.page.route";
const style = fs.readFileSync("./src/assets/css/theme-flattop.css", "utf8");
const swaggerFile = fs.readFileSync("./swagger.yaml", "utf8");
const swaggerYAML = YAML.parse(swaggerFile);

interface ISetLimiter {
  ttl?: number,
  max?: number
}

class App {
  private readonly app:Application
  private readonly port: string;
  // private readonly limiter: RateLimitRequestHandler;
  private setLimiter = (opts?: ISetLimiter) => rateLimit({

    // windowMs: 1 * 60 * 1000,
    windowMs: opts?.ttl ?? 1 * 60 * 1000, // default 1 min
    max: opts?.max ?? 120, // default 60 times
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
  })
  // private readonly publicRedis: Redis
  // private readonly subRedis: Redis
  // private readonly io
  // private readonly server
  constructor() {
    this.app = express();
    this.port = AppPort;
    // this.limiter = rateLimit({
    //   windowMs: 1 * 60 * 1000,
    //   max: 200,
    //   message: "Too many requests from this IP, please try again later.",
    //   //legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // })
    // this.publicRedis = new Redis({
    //   port: Number(process.env.REDIS_PORT) || 6379, // Redis port
    //   host: process.env.REDIS_HOST || "localhost", // Redis host
    // })
    // this.subRedis = this.publicRedis.duplicate()
    // this.server = createServer(this.app, (req:any, res:any) => {
    //   const headers = {
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    //     'Access-Control-Max-Age': 2592000, // 30 days
    //     /** add other headers as per requirement */
    //   };
    
    //   if (req.method === 'OPTIONS') {
    //     res.writeHead(204, headers);
    //     res.end();
    //     return;
    //   }
    
    //   if (['GET', 'POST'].indexOf(req.method) > -1) {
    //     res.writeHead(200, headers);
    //     // console.log("Hello World")
    //     res.end('Hello World');
    //     return;
    //   }
    
    //   res.writeHead(405, headers);
    //   res.end(`${req.method} is not allowed for the request.`);
    // });
    // this.io = new Server(this.server, {
    //   cors: {
    //     origin: '*',
    //   },
    //   adapter: createAdapter(this.publicRedis, this.subRedis),
    // });
    // this.io.on("connection",(socket)=>{
    //   console.log(socket.id," connected")
    // })
    this.init();
  }

  private initMiddlewares() {
    this.app.set("trust proxy", 1)
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      })
    );
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    passport.use(jwtStrategy);
    // this.app.use(this.limiter);
  }

  private initHandlers() {
    this.app.use("/*", notfoundHandler);
    this.app.use(serverHandler);
  }

  private initRoutes() {
    this.app.get('/ip', this.setLimiter(), (request: Request, response: Response, next: NextFunction): Promise<any> => successResponse(response, { ip: request.ip }))
    this.app.get("/health-check", this.setLimiter(), (req:Request, res:Response, next:NextFunction) => {
      try {
        const healthCheck = {
          uptime: process.uptime(),
          localtime: new Date().toString(),
          // timestamp: moment(new Date()).format("DD-MM-YYYY hh:mm:ss"),
        };
        return successResponse(res, healthCheck);
      } catch (error) {
        next(error);
      }
    });
    // ======= Mobile Router

    this.app.use("/mobile/v1/book-categories", this.setLimiter(), mobileBookcategoryRoute)
    this.app.use("/mobile/v1/books", this.setLimiter(), mobileBookRoute)
    this.app.use("/mobile/v1/video-categories", this.setLimiter(), mobileVideoCategoryRoute)
    this.app.use("/mobile/v1/videos", this.setLimiter(), mobileVideoRoute)
    this.app.use("/mobile/v1/page", this.setLimiter(), mobilePageRoute)

    // ======= END Mobile Router
    this.app.use(
      "/v1/inituser",
      async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): Promise<any> => {
        try {
          const roles = await RoleModel.findAll();
          if (!roles) {
            return errorResponse(res, 404, "Resource not found");
          }
          const adminRole = (await RoleModel.create({
            name: "Administrator",
          })) as any;
          const editorRole = await RoleModel.create({ name: "Editor" });
          const entryRole = await RoleModel.create({ name: "Entry" });
          await UserModel.create({
            firstname: "vitou",
            lastname: "dao",
            email: "vitoudao@gmail.com",
            username: "vitoudao",
            password:
              "$2a$12$A0xT10.b/eP2FyLA61PxhOTA3GUhqBWhtRGQGi9kHsju5SVAusUWG",
            roleId: adminRole.id,
            profile:
              "https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png",
          });
          return successResponse(res, null, "Initialize data successful")
        } catch (error) {
          next(error);
        }
      }
    );
    this.app.use("/v1/auth", authRoute);
    this.app.use(
      "/v1/books",
      this.setLimiter(),
      passport.authenticate("jwt", { session: false }),
      bookRoute
    );
    this.app.use(
      "/v1/book-categories",
      this.setLimiter(),
      passport.authenticate("jwt", { session: false }),
      // catchRedisHandler,
      // catchRedisInterceptor(3 * 60),
      // invalidRedisInterceptor,
      bookCategoryRoute
    );
    this.app.use(
      "/v1/dashboard",
      this.setLimiter(),
      dashboardRoute
    )
    this.app.use(
      "/v1/languages",
      this.setLimiter(),
      passport.authenticate("jwt", { session: false }),
      languageRoute
    );
    this.app.use("/v1/minio", minioRoute)
    this.app.use(
      "/v1/pages",
      this.setLimiter(),
      passport.authenticate("jwt", { session: false }),
      pageRoute
    );
    this.app.use(
      "/v1/roles",
      this.setLimiter(),
      passport.authenticate("jwt", { session: false }),
      roleRoute
    );
    this.app.use(
      "/v1/users",
      this.setLimiter(),
      passport.authenticate("jwt", { session: false }),
      userRoute
    );
    this.app.use(
      "/v1/video-categories",
      this.setLimiter(),
      passport.authenticate("jwt", { session: false }),
      videoCategoryRoute
    );
    this.app.use(
      "/v1/videos",
      this.setLimiter(),
      passport.authenticate("jwt", { session: false }),
      videoRoute
    );
    this.app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(
        swaggerYAML
        // , { customCss: style }
      )
    );
  }

  private init() {
    this.initMiddlewares();
    this.initRoutes();
    this.initHandlers();
  }

  run() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
      console.log(
        `API Docs is running on http://localhost:${this.port}/api/docs`
      );
    });
  }
}

export default App;
