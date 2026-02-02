import {
  ConflictException,
  Injectable,
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
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  refreshExpiresIn: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(payload: RegisterDto): Promise<AuthTokens> {
    const email = payload.email.toLowerCase().trim();
    const username = payload.username.trim();

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }]
    });
    if (existingUser) {
      throw new ConflictException("Email or username already in use.");
    }

    const passwordHash = await this.hashValue(payload.password);
    let createdUser: UserDocument;
    try {
      createdUser = await this.userModel.create({
        email,
        username,
        passwordHash,
        roles: ["user"]
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException("Email or username already in use.");
      }
      throw error;
    }

    const tokens = await this.issueTokens(createdUser);
    await this.storeRefreshToken(createdUser._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async login(payload: LoginDto): Promise<AuthTokens> {
    const email = payload.email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    if (user.status === "disabled") {
      throw new UnauthorizedException("Account is disabled.");
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async refresh(payload: RefreshTokenDto): Promise<AuthTokens> {
    const refreshSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET", { infer: true }) ??
      "";

    let decoded: JwtPayload;
    try {
      decoded = await this.jwtService.verifyAsync<JwtPayload>(
        payload.refreshToken,
        { secret: refreshSecret }
      );
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    const user = await this.userModel.findById(decoded.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Refresh token revoked.");
    }
    if (user.status === "disabled") {
      throw new UnauthorizedException("Account is disabled.");
    }

    const matches = await bcrypt.compare(
      payload.refreshToken,
      user.refreshTokenHash
    );
    if (!matches) {
      throw new UnauthorizedException("Refresh token revoked.");
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $unset: { refreshTokenHash: "" } }
    );
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

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn,
      refreshExpiresIn
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
  }

  private async hashValue(value: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
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
