export interface IPresentCashSummary {
    presentSalesAmount: number;
    presentPurchaseAmount: number;
    presentExpensesAmount: number;
}

export interface IAllCashSummary {
    total_purchase_amount: number;
    total_sales_amount: number;
    total_expenses_amount: number;
    initial_cash: number;
    real_cash: number;
}

export interface IProfitLoss {
    x_series: string;
    total_profit_amount: number;
    total_loss_amount: number;
}

export interface ISalesPurchase {
    x_series: string;
    total_purchase_amount: number;
    total_sales_amount: number;
}

export interface IExpensesCash {
    x_series: string;
    total_expenses_amount: number;
}

export interface IRevenueCash {
    x_series: string;
    revenue: number;
}