import type {Menu} from "~/composables/menu/menu.interface";

export interface IRole {
  uuid: string;
  designation: string;
  status: IStatus;
}

export interface FormRole {
  designation: string;
}

export interface FormMenuRole {
  menuId: number;
  privilege: number[];
}

export interface IRoleMenu {
  uuid: string;
  privilege: string;
  menu: Menu;
}