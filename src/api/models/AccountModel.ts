export interface Account {
  id: number;
  username: string;
  account_id: number;
  email: string;
  realm: string;
  server_id: number;
  expansion: string;
  expansion_id: number;
  avatar: string;
  web_site: string;
  status: boolean;
  realmlist: string;
}

export interface AccountsDto {
  accounts: Account[];
  size: number;
}

