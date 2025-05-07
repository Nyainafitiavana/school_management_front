export const formatDateString = (
    dateString: string,
    format: 'ENG' | 'FR',
    longFormat: boolean = false
): string => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        throw new Error("Invalid date string");
    }

    let formattedDate: string;

    if (longFormat) {
        // Long format with official formats
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        };
        formattedDate = format === 'ENG'
            ? date.toLocaleDateString('en-US', options) // e.g., "September 03, 2024"
            : date.toLocaleDateString('fr-FR', options); // e.g., "03 septembre 2024"
    } else {
        // Short format with official formats
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
        formattedDate = format === 'ENG'
            ? date.toLocaleDateString('en-US', options) // e.g., "09/03/2024"
            : date.toLocaleDateString('fr-FR', options); // e.g., "03/09/2024"
    }

    return formattedDate;
};

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}
