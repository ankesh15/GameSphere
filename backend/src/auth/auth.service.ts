import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcryptjs";
import type { StringValue } from "ms";
import { Model } from "mongoose";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload } from "./types/jwt-payload";
import { User, UserDocument } from "../users/schemas/user.schema";

export type AuthTokens = {
  success: true;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  refreshExpiresIn: string;
  user: {
    id: string;
    email: string;
    username: string;
    roles: string[];
  };
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(payload: RegisterDto): Promise<AuthTokens> {
    const email = payload.email.toLowerCase().trim();
    const username = payload.username.trim();

    this.logger.log(`Registration attempt for email=${email}, username=${username}`);

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }]
    });
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      this.logger.warn(`Registration blocked: ${field} already in use (${email})`);
      throw new ConflictException(`This ${field} is already in use.`);
    }

    this.logger.debug("Hashing password...");
    const passwordHash = await this.hashValue(payload.password);

    let createdUser: UserDocument;
    try {
      createdUser = await this.userModel.create({
        email,
        username,
        passwordHash,
        roles: ["user"]
      });
      this.logger.log(`User created successfully: id=${createdUser._id}, email=${email}`);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        this.logger.warn(`Duplicate key error during registration for ${email}`);
        throw new ConflictException("Email or username already in use.");
      }
      this.logger.error("Unexpected database error during registration", error);
      throw error;
    }

    this.logger.debug("Issuing tokens...");
    const tokens = await this.issueTokens(createdUser);
    await this.storeRefreshToken(createdUser._id.toString(), tokens.refreshToken);

    this.logger.log(`Registration successful for ${email}`);
    return tokens;
  }

  async login(payload: LoginDto): Promise<AuthTokens> {
    const email = payload.email.toLowerCase().trim();

    this.logger.log(`Login attempt for email=${email}`);

    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.warn(`Login failed: no user found with email=${email}`);
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (user.status === "disabled") {
      this.logger.warn(`Login failed: account disabled for email=${email}`);
      throw new UnauthorizedException("Your account has been disabled. Please contact support.");
    }

    this.logger.debug(`Comparing password for user id=${user._id}...`);
    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      this.logger.warn(`Login failed: invalid password for email=${email}`);
      throw new UnauthorizedException("Invalid email or password.");
    }

    user.lastLoginAt = new Date();
    await user.save();

    this.logger.debug("Issuing tokens...");
    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    this.logger.log(`Login successful for email=${email}, userId=${user._id}`);
    return tokens;
  }

  async refresh(payload: RefreshTokenDto): Promise<AuthTokens> {
    this.logger.log("Token refresh attempt");

    const refreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET", { infer: true }) ??
      "";

    let decoded: JwtPayload;
    try {
      decoded = await this.jwtService.verifyAsync<JwtPayload>(
        payload.refreshToken,
        { secret: refreshSecret }
      );
    } catch {
      this.logger.warn("Token refresh failed: invalid/expired refresh token");
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    const user = await this.userModel.findById(decoded.sub);
    if (!user || !user.refreshTokenHash) {
      this.logger.warn(`Token refresh failed: user not found or token revoked (sub=${decoded.sub})`);
      throw new UnauthorizedException("Refresh token has been revoked.");
    }
    if (user.status === "disabled") {
      this.logger.warn(`Token refresh failed: account disabled (sub=${decoded.sub})`);
      throw new UnauthorizedException("Your account has been disabled.");
    }

    const matches = await bcrypt.compare(
      payload.refreshToken,
      user.refreshTokenHash
    );
    if (!matches) {
      this.logger.warn(`Token refresh failed: refresh token mismatch (sub=${decoded.sub})`);
      throw new UnauthorizedException("Refresh token has been revoked.");
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);

    this.logger.log(`Token refresh successful for userId=${user._id}`);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`Logout for userId=${userId}`);
    await this.userModel.updateOne(
      { _id: userId },
      { $unset: { refreshTokenHash: "" } }
    );
    this.logger.log(`Logout successful — refresh token cleared for userId=${userId}`);
  }

  async getMe(userId: string) {
    this.logger.debug(`getMe for userId=${userId}`);
    const user = await this.userModel
      .findById(userId)
      .select("-passwordHash -refreshTokenHash -__v");

    if (!user) {
      throw new UnauthorizedException("User not found.");
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        roles: user.roles,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt
      }
    };
  }

  private async issueTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      roles: user.roles ?? ["user"]
    };

    const expiresIn =
      this.configService.get<string>("JWT_EXPIRES_IN", { infer: true }) ?? "1h";
    const refreshExpiresIn =
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", { infer: true }) ??
      "7d";

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn as StringValue
    });
    const refreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET", { infer: true }) ??
      "dev_only_change_me_refresh";
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshExpiresIn as StringValue,
      secret: refreshSecret
    });

    this.logger.debug(`Tokens issued for userId=${user._id}`);

    return {
      success: true,
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn,
      refreshExpiresIn,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        roles: user.roles ?? ["user"]
      }
    };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const refreshTokenHash = await this.hashValue(refreshToken);
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshTokenHash } }
    );
    this.logger.debug(`Refresh token stored for userId=${userId}`);
  }

  private async hashValue(value: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(value, salt);
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return Boolean(
      typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000
    );
  }
}
