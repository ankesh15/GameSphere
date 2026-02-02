import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateGamerProfileDto } from "./dto/create-gamer-profile.dto";
import { LinkGamingAccountDto } from "./dto/link-gaming-account.dto";
import { UpdateGamerProfileDto } from "./dto/update-gamer-profile.dto";
import {
  GamerProfile,
  GamerProfileDocument
} from "./schemas/gamer-profile.schema";
import { User, UserDocument } from "./schemas/user.schema";

@Injectable()
export class GamerProfilesService {
  constructor(
    @InjectModel(GamerProfile.name)
    private readonly profileModel: Model<GamerProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async createProfile(
    userId: string,
    payload: CreateGamerProfileDto
  ): Promise<GamerProfileDocument> {
    const existingProfile = await this.profileModel.findOne({ userId });
    if (existingProfile) {
      throw new ConflictException("Profile already exists.");
    }

    const profile = await this.profileModel.create({
      userId,
      ...payload
    });

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { profileId: profile._id } }
    );

    return profile;
  }

  async getProfileByUserId(userId: string): Promise<GamerProfileDocument> {
    const profile = await this.profileModel.findOne({ userId });
    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    payload: UpdateGamerProfileDto
  ): Promise<GamerProfileDocument> {
    const profile = await this.profileModel.findOneAndUpdate(
      { userId },
      { $set: payload },
      { new: true }
    );

    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }

    return profile;
  }

  async removeProfile(userId: string): Promise<void> {
    const profile = await this.profileModel.findOneAndDelete({ userId });
    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $unset: { profileId: "" } }
    );
  }

  async linkGamingAccount(
    userId: string,
    payload: LinkGamingAccountDto
  ): Promise<GamerProfileDocument> {
    const isVerified = await this.mockVerifyGamingAccount(
      payload.provider,
      payload.handle
    );
    if (!isVerified) {
      throw new BadRequestException(
        `Unable to verify ${payload.provider} account.`
      );
    }

    const profile = await this.getProfileByUserId(userId);
    const updatedAccount = {
      provider: payload.provider,
      handle: payload.handle.trim(),
      externalId: payload.externalId,
      linkedAt: new Date()
    };

    const existingIndex = profile.gamingAccounts.findIndex(
      (account) => account.provider === payload.provider
    );

    if (existingIndex >= 0) {
      profile.gamingAccounts[existingIndex] = updatedAccount;
    } else {
      profile.gamingAccounts.push(updatedAccount);
    }

    await profile.save();
    return profile;
  }

  async unlinkGamingAccount(
    userId: string,
    provider: LinkGamingAccountDto["provider"]
  ): Promise<GamerProfileDocument> {
    if (!this.isSupportedProvider(provider)) {
      throw new BadRequestException("Unsupported provider.");
    }

    const profile = await this.getProfileByUserId(userId);
    profile.gamingAccounts = profile.gamingAccounts.filter(
      (account) => account.provider !== provider
    );
    await profile.save();
    return profile;
  }

  async awardBadge(
    userId: string,
    badge: { code: string; label: string; source?: string }
  ): Promise<GamerProfileDocument> {
    const profile = await this.getProfileByUserId(userId);
    const existingBadges = profile.badges ?? [];
    const alreadyAwarded = existingBadges.some((item) => item.code === badge.code);
    if (!alreadyAwarded) {
      profile.badges = existingBadges;
      profile.badges.push({
        code: badge.code,
        label: badge.label,
        source: badge.source,
        awardedAt: new Date()
      });
      await profile.save();
    }
    return profile;
  }

  private async mockVerifyGamingAccount(
    provider: LinkGamingAccountDto["provider"],
    handle: string
  ): Promise<boolean> {
    const normalizedHandle = handle.trim();
    if (normalizedHandle.length < 2) {
      return false;
    }

    // Mock verification rules for now (replace with provider APIs).
    if (provider === "steam") {
      return normalizedHandle.startsWith("steam_") || normalizedHandle.length >= 3;
    }
    if (provider === "riot") {
      return normalizedHandle.includes("#") || normalizedHandle.length >= 3;
    }
    return normalizedHandle.length >= 3;
  }

  private isSupportedProvider(
    provider: LinkGamingAccountDto["provider"] | string
  ): boolean {
    return ["steam", "riot", "epic"].includes(provider);
  }
}
