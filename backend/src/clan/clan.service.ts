import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateClanDto } from "./dto/create-clan.dto";
import { CreateClanEventDto } from "./dto/create-clan-event.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { UpdateClanRoleDto } from "./dto/update-clan-role.dto";
import { Clan, ClanDocument } from "./schemas/clan.schema";

type Role = "owner" | "admin" | "moderator" | "member";

@Injectable()
export class ClanService {
  constructor(
    @InjectModel(Clan.name) private readonly clanModel: Model<ClanDocument>
  ) {}

  getHealth() {
    return {
      status: "ok",
      module: "clan",
      timestamp: new Date().toISOString()
    };
  }

  async createClan(userId: string, payload: CreateClanDto) {
    try {
      const clan = await this.clanModel.create({
        ...payload,
        ownerId: new Types.ObjectId(userId),
        memberIds: [new Types.ObjectId(userId)],
        members: [
          {
            userId: new Types.ObjectId(userId),
            role: "owner",
            joinedAt: new Date()
          }
        ],
        invites: [],
        events: []
      });
      return clan;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException("Clan name or tag already exists.");
      }
      throw error;
    }
  }

  async inviteMember(clanId: string, inviterId: string, payload: InviteMemberDto) {
    const clan = await this.getClanOrThrow(clanId);
    this.assertCanManageMembers(clan, inviterId);

    const targetId = new Types.ObjectId(payload.userId);
    if (clan.memberIds.some((id) => id.toString() === payload.userId)) {
      throw new ConflictException("User is already a member.");
    }

    const alreadyInvited = clan.invites.some(
      (invite) => invite.userId.toString() === payload.userId
    );
    if (alreadyInvited) {
      return clan;
    }

    clan.invites.push({
      userId: targetId,
      invitedBy: new Types.ObjectId(inviterId),
      createdAt: new Date()
    });
    await clan.save();
    return clan;
  }

  async joinClan(clanId: string, userId: string) {
    const clan = await this.getClanOrThrow(clanId);
    const isMember = clan.memberIds.some((id) => id.toString() === userId);
    if (isMember) {
      return clan;
    }

    const isInvited = clan.invites.some(
      (invite) => invite.userId.toString() === userId
    );
    if (!clan.isPublic && !isInvited) {
      throw new UnauthorizedException("Clan is private.");
    }

    clan.memberIds.push(new Types.ObjectId(userId));
    clan.members.push({
      userId: new Types.ObjectId(userId),
      role: "member",
      joinedAt: new Date()
    });
    clan.invites = clan.invites.filter(
      (invite) => invite.userId.toString() !== userId
    );

    await clan.save();
    return clan;
  }

  async leaveClan(clanId: string, userId: string) {
    const clan = await this.getClanOrThrow(clanId);
    if (clan.ownerId.toString() === userId) {
      throw new BadRequestException("Owner cannot leave the clan.");
    }

    clan.memberIds = clan.memberIds.filter((id) => id.toString() !== userId);
    clan.members = clan.members.filter((member) => member.userId.toString() !== userId);
    await clan.save();
    return clan;
  }

  async kickMember(clanId: string, requesterId: string, targetUserId: string) {
    const clan = await this.getClanOrThrow(clanId);
    this.assertCanManageMembers(clan, requesterId);

    if (clan.ownerId.toString() === targetUserId) {
      throw new BadRequestException("Cannot remove clan owner.");
    }

    clan.memberIds = clan.memberIds.filter((id) => id.toString() !== targetUserId);
    clan.members = clan.members.filter(
      (member) => member.userId.toString() !== targetUserId
    );
    await clan.save();
    return clan;
  }

  async updateMemberRole(
    clanId: string,
    requesterId: string,
    payload: UpdateClanRoleDto
  ) {
    const clan = await this.getClanOrThrow(clanId);
    this.assertCanManageMembers(clan, requesterId);

    if (clan.ownerId.toString() === payload.userId) {
      throw new BadRequestException("Cannot change owner role.");
    }

    const member = clan.members.find(
      (entry) => entry.userId.toString() === payload.userId
    );
    if (!member) {
      throw new NotFoundException("Member not found.");
    }

    member.role = payload.role as Role;
    await clan.save();
    return clan;
  }

  async createEvent(
    clanId: string,
    requesterId: string,
    payload: CreateClanEventDto
  ) {
    const clan = await this.getClanOrThrow(clanId);
    this.assertCanManageMembers(clan, requesterId);

    clan.events.push({
      title: payload.title.trim(),
      description: payload.description?.trim(),
      startsAt: new Date(payload.startsAt),
      endsAt: payload.endsAt ? new Date(payload.endsAt) : undefined,
      createdBy: new Types.ObjectId(requesterId)
    });
    await clan.save();
    return clan.events[clan.events.length - 1];
  }

  async listEvents(clanId: string, userId: string) {
    const clan = await this.getClanOrThrow(clanId);
    const isMember =
      clan.ownerId.toString() === userId ||
      clan.memberIds.some((id) => id.toString() === userId) ||
      Boolean(clan.members?.some((member) => member.userId.toString() === userId));
    if (!clan.isPublic && !isMember) {
      throw new UnauthorizedException("Not allowed to view clan events.");
    }
    return clan.events;
  }

  private assertCanManageMembers(clan: ClanDocument, userId: string) {
    const role = this.getMemberRole(clan, userId);
    if (!role || !["owner", "admin", "moderator"].includes(role)) {
      throw new UnauthorizedException("Insufficient clan permissions.");
    }
  }

  private getMemberRole(clan: ClanDocument, userId: string): Role | null {
    if (clan.ownerId.toString() === userId) {
      return "owner";
    }

    const member = clan.members?.find((entry) => entry.userId.toString() === userId);
    return member?.role ?? null;
  }

  private async getClanOrThrow(clanId: string): Promise<ClanDocument> {
    const clan = await this.clanModel.findById(clanId);
    if (!clan) {
      throw new NotFoundException("Clan not found.");
    }
    return clan;
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
