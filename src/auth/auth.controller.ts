import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';
import { Authorization } from './decorator/authorization.decorator';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiBasicAuth()
  @Post('register')
  registerUser(@Authorization() token: string) {
    return this.authService.register(token);
  }

  @Public()
  @ApiBasicAuth()
  @Post('login')
  loginUser(@Authorization() token: string) {
    return this.authService.login(token);
  }

  @Post('token/block')
  blockToken(@Body('token') token: string) {
    return this.authService.tokenBlock(token);
  }

  @Post('token/access')
  async rotateAccessToken(@Headers('authorization') token: string) {
    const payload = await this.authService.parseBearerToken(token, true);

    return {
      accessToken: await this.authService.issueToken(
        { id: payload.sub, role: payload.role },
        false,
      ),
    };
  }
}
