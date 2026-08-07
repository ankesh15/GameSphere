import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { Types } from "mongoose";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User } from "../users/schemas/user.schema";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

describe("Auth Module Tests", () => {
  let service: AuthService;
  let controller: AuthController;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock-token"),
    signAsync: jest.fn().mockResolvedValue("mock-token"),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
      if (key === "JWT_EXPIRES_IN") return "1h";
      if (key === "RATE_LIMIT_TTL_SECONDS") return 60;
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  describe("Service - register", () => {
    it("should successfully register a new user", async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const mockCreatedUser = {
        _id: new Types.ObjectId(),
        email: "test@example.com",
        username: "tester",
        roles: ["user"],
      };
      mockUserModel.create.mockResolvedValue(mockCreatedUser);
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.register({
        email: "test@example.com",
        username: "tester",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe("mock-token");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw ConflictException if user already exists", async () => {
      mockUserModel.findOne.mockResolvedValue({ email: "test@example.com" });

      await expect(
        service.register({
          email: "test@example.com",
          username: "tester",
          password: "password123",
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("Service - login", () => {
    it("should login user successfully with valid credentials", async () => {
      const passwordHash = await bcrypt.hash("password123", 1);
      const mockUser = {
        _id: new Types.ObjectId(),
        email: "test@example.com",
        username: "tester",
        passwordHash,
        roles: ["user"],
        status: "active",
        save: jest.fn().mockResolvedValue(true),
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe("mock-token");
    });

    it("should throw UnauthorizedException for disabled account", async () => {
      const mockUser = {
        email: "test@example.com",
        status: "disabled",
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: "test@example.com",
        passwordHash: "incorrect_hash",
        status: "active",
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("Service - refresh", () => {
    it("should throw UnauthorizedException if refresh token fails verification (expired/invalid)", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error("invalid token"));

      await expect(
        service.refresh({ refreshToken: "invalid" })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if user not found or revoked", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1" });
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        service.refresh({ refreshToken: "valid" })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if user is disabled", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1" });
      mockUserModel.findById.mockResolvedValue({
        status: "disabled",
        refreshTokenHash: "somehash",
      });

      await expect(
        service.refresh({ refreshToken: "valid" })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if refresh token mismatches hash", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1" });
      const badHash = await bcrypt.hash("different-token", 1);
      mockUserModel.findById.mockResolvedValue({
        status: "active",
        refreshTokenHash: badHash,
      });

      await expect(
        service.refresh({ refreshToken: "valid" })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should refresh successfully with valid token", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: "user-1" });
      const goodHash = await bcrypt.hash("valid", 1);
      const mockUser = {
        _id: new Types.ObjectId(),
        status: "active",
        refreshTokenHash: goodHash,
        roles: ["user"],
      };
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.refresh({ refreshToken: "valid" });
      expect(result.success).toBe(true);
      expect(result.accessToken).toBe("mock-token");
    });
  });

  describe("Service - logout", () => {
    it("should clear the refresh token hash on logout (even if already logged out)", async () => {
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

      await expect(service.logout("user-1")).resolves.not.toThrow();
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: "user-1" },
        { $unset: { refreshTokenHash: "" } }
      );
    });
  });

  describe("Controller - endpoints", () => {
    it("logout returns success", async () => {
      mockUserModel.findOne.mockResolvedValue({ _id: new Types.ObjectId() });
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await controller.logout({ sub: "user-1", email: "tester@example.com", roles: [] });
      expect(result).toEqual({ success: true, message: "Logged out successfully." });
    });
  });

  describe("JwtAuthGuard", () => {
    it("should instantiate successfully", () => {
      const guard = new JwtAuthGuard();
      expect(guard).toBeDefined();
    });
  });
});
