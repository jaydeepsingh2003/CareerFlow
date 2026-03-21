import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const existingUser = await this.userService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userService.create({ ...data, passwordHash });

    return this.generateToken(user);
  }

  async login(email: string, pass: string) {
    console.log(`[AUTH] Login attempt for: ${email}`);
    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log(`[AUTH] User not found: ${email}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    console.log(`[AUTH] User found, comparing password for: ${email}`);
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      console.log(`[AUTH] Password mismatch for: ${email}`);
      throw new UnauthorizedException("Invalid credentials");
    }
    console.log(`[AUTH] Login successful for: ${email}`);

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        role: user.role,
      },
    };
  }
}
