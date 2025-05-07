export interface ISettings {
    uuid?: string;
    currencyType: string;
    companyName: string;
    companyEmail: string;
    companyAddress: string;
    companyPhoneNumber: string;
    initialCash: number;
}

export interface ICurrency {
    currencyType: string;
}