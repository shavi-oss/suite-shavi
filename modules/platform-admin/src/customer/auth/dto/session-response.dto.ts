export class SessionResponseDto {
  accessToken: string = '';
  tokenType: 'Bearer' = 'Bearer';
  expiresIn: number = 0;
}
