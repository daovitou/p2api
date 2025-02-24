import { Strategy, ExtractJwt } from "passport-jwt";
import { UserModel } from "../models/sequelize.db";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.APP_SECRET as string,
};

const jwtStrategy = new Strategy(opts, async (payload, done) => {
  const user = await UserModel.findOne({ where: { id: payload.id} });
  if (!user) {
    done(null, false);
  }
  done(null, user);
});

export default jwtStrategy;
