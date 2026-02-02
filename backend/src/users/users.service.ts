import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  getHealth() {
    return {
      status: "ok",
      module: "users",
      timestamp: new Date().toISOString()
    };
  }

  getAdminHealth() {
    return {
      status: "ok",
      module: "users",
      scope: "admin",
      timestamp: new Date().toISOString()
    };
  }
}
