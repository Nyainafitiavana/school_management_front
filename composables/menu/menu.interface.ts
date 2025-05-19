export interface IUserMenu {
  uuid: string;
  roles: {
    uuid: string;
    designation: string;
    MenuRoles: IMenuRoles[];
  }
}

interface IMenuRoles {
  menu: Menu
}

export interface Menu {
  uuid: string;
  designation: string;
  path: string;
  code: string;
}