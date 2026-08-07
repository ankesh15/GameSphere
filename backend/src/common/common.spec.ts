import { Test, TestingModule } from "@nestjs/testing";
import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { GlobalExceptionFilter } from "./filters/http-exception.filter";
import { LoggingMiddleware } from "./middleware/logging.middleware";
import { SanitizationPipe } from "./pipes/sanitize.pipe";

describe("Common Cross-cutting Modules Tests", () => {
  describe("SanitizationPipe", () => {
    let pipe: SanitizationPipe;

    beforeEach(() => {
      pipe = new SanitizationPipe();
    });

    it("should strip malicious script tags from strings", () => {
      const dirty = {
        name: "  <script>alert('hack')</script>Tester  ",
        nested: {
          bio: "<p>Hello</p><script>evil()</script>",
        },
      };

      const clean = pipe.transform(dirty) as any;
      expect(clean.name).toBe("Tester");
      expect(clean.nested.bio).toBe("Hello");
    });

    it("should preserve numbers and booleans", () => {
      const input = { age: 25, isCool: true };
      const output = pipe.transform(input);
      expect(output).toEqual(input);
    });
  });

  describe("LoggingMiddleware", () => {
    let middleware: LoggingMiddleware;

    beforeEach(() => {
      middleware = new LoggingMiddleware();
    });

    it("should append x-request-id and call next", () => {
      const req = {
        method: "GET",
        originalUrl: "/test",
        get: jest.fn().mockReturnValue("Mozilla"),
        socket: {},
      } as any;

      const res = {
        setHeader: jest.fn(),
        on: jest.fn(),
      } as any;

      const next = jest.fn();

      middleware.use(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("x-request-id", expect.any(String));
      expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
      expect(next).toHaveBeenCalled();
    });

    it("should log request details on finish (including fallback ip/ua and error status codes)", () => {
      const req = {
        method: "POST",
        originalUrl: "/auth/login",
        get: jest.fn().mockReturnValue(undefined), // covers missing User Agent branch
        ip: undefined, // covers missing request.ip branch
        socket: { remoteAddress: undefined }, // covers missing socket address branch
      } as any;

      let finishCallback: () => void = () => {};
      const res = {
        statusCode: 400, // covers error status code logging branch
        setHeader: jest.fn(),
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === "finish") finishCallback = callback;
        }),
      } as any;

      const next = jest.fn();

      const loggerSpy = jest.spyOn((middleware as any).logger, "log").mockImplementation(() => {});

      middleware.use(req, res, next);
      finishCallback(); // simulate finish event

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("POST /auth/login 400")
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("ip=unknown ua=\"unknown\"")
      );

      loggerSpy.mockRestore();
    });
  });

  describe("GlobalExceptionFilter", () => {
    let filter: GlobalExceptionFilter;
    const mockHttpAdapter = {
      reply: jest.fn(),
    };
    const mockHttpAdapterHost = {
      httpAdapter: mockHttpAdapter,
    };

    beforeEach(() => {
      filter = new GlobalExceptionFilter(mockHttpAdapterHost as any);
      jest.clearAllMocks();
    });

    it("should handle HttpException correctly", () => {
      const mockException = new HttpException("Bad request details", HttpStatus.BAD_REQUEST);
      const mockRequest = { method: "POST", url: "/auth/login", body: {} };
      const mockResponse = {};

      const mockArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as any;

      filter.catch(mockException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Bad request details",
        }),
        HttpStatus.BAD_REQUEST
      );
    });

    it("should fallback to internal server error for generic errors", () => {
      const mockException = new Error("db crashed");
      const mockRequest = { method: "GET", url: "/users/1" };
      const mockResponse = {};

      const mockArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as any;

      filter.catch(mockException, mockArgumentsHost);

      expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "db crashed",
        }),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    });
  });
});
