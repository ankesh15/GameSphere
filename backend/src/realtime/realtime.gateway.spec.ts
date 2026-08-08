import { Test, TestingModule } from "@nestjs/testing";
import { RealtimeGateway } from "./realtime.gateway";
import { RealtimeService } from "./realtime.service";
import { PresenceService } from "./presence.service";
import { ChatService } from "../chat/chat.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { MatchmakingService } from "../matchmaking/matchmaking.service";
import { WsException } from "@nestjs/websockets";

describe("RealtimeGateway Chat Handler", () => {
  let gateway: RealtimeGateway;
  let chatService: jest.Mocked<ChatService>;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  };

  const mockClient = {
    data: {
      user: { sub: "user-123", email: "user@test.com", roles: [] }
    },
    join: jest.fn(),
    emit: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        {
          provide: RealtimeService,
          useValue: { setServer: jest.fn(), userRoom: (id: string) => `user:${id}` }
        },
        {
          provide: PresenceService,
          useValue: {}
        },
        {
          provide: ChatService,
          useValue: {
            canJoinRoom: jest.fn(),
            createMessage: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {}
        },
        {
          provide: ConfigService,
          useValue: {}
        },
        {
          provide: MatchmakingService,
          useValue: {}
        }
      ]
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    chatService = module.get(ChatService);
    gateway.server = mockServer as any;

    jest.clearAllMocks();
  });

  it("should allow chat.join if user has room access", async () => {
    chatService.canJoinRoom.mockResolvedValue(true);

    await gateway.handleChatJoin(mockClient as any, { roomId: "clan:123" });

    expect(chatService.canJoinRoom).toHaveBeenCalledWith("user-123", "clan:123");
    expect(mockClient.join).toHaveBeenCalledWith("clan:123");
    expect(mockClient.emit).toHaveBeenCalledWith("chat.joined", { roomId: "clan:123" });
  });

  it("should throw WsException on chat.join if access is denied", async () => {
    chatService.canJoinRoom.mockResolvedValue(false);

    await expect(
      gateway.handleChatJoin(mockClient as any, { roomId: "clan:123" })
    ).rejects.toThrow(WsException);
  });

  it("should persist message and broadcast chat.message to room on chat.send", async () => {
    chatService.canJoinRoom.mockResolvedValue(true);
    const mockMessage = {
      id: "msg-1",
      roomId: "clan:123",
      senderId: "user-123",
      content: "Hello real-time!",
      messageType: "text" as const,
      createdAt: new Date().toISOString(),
      editedAt: null
    };
    chatService.createMessage.mockResolvedValue(mockMessage);

    await gateway.handleChatSend(mockClient as any, {
      roomId: "clan:123",
      content: "Hello real-time!"
    });

    expect(chatService.canJoinRoom).toHaveBeenCalledWith("user-123", "clan:123");
    expect(chatService.createMessage).toHaveBeenCalledWith("user-123", {
      roomId: "clan:123",
      content: "Hello real-time!"
    });
    expect(mockServer.to).toHaveBeenCalledWith("clan:123");
    expect(mockServer.emit).toHaveBeenCalledWith("chat.message", mockMessage);
  });

  it("should reject chat.send if user is not in room", async () => {
    chatService.canJoinRoom.mockResolvedValue(false);

    await expect(
      gateway.handleChatSend(mockClient as any, {
        roomId: "clan:123",
        content: "Hello real-time!"
      })
    ).rejects.toThrow(WsException);
  });
});
