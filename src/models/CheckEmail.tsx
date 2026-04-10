export interface CheckMailUser {
  hash?: string;
  name?: string;
  email?: string;
}

export interface CheckMail {
  response: boolean;
  exists?: boolean;
  user?: CheckMailUser;
  redirect?: string;
  message?: string;
}
