export interface IUserMenu {
  uuid: string;
  rules: {
    uuid: string;
    designation: string;
    MenuRules: IMenuRules[];
  }
}

interface IMenuRules {
  menu: Menu
}

export interface Menu {
  uuid: string;
  designation: string;
  path: string;
  code: string;
}