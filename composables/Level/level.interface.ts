import type {IStatus} from "~/composables/Status.interface";
import type {IUser} from "~/composables/User/User.interface";
import type {FormSubject, ISubject} from "~/composables/Subject/Subject.interface";

export interface ILevel {
    uuid: string;
    designation: string;
    user: IUser;
    status: IStatus;
}

export interface FormLevel {
    designation: string;
    teacherInChargeId?: string;
}

export interface ISubjectLevel {
    uuid: string;
    subjects: ISubject;
    users: IUser;
    coefficient: number;
    status: IStatus;
}

export interface FormSubjectLevel {
    subjectId: string;
    teacherId?: string;
    coefficient: number;
}