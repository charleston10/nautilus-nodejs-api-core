class ValidateException extends Error {

    code: Number = 0;
    errors: String[] | null = [];
    details: any = null;

    constructor(message: any, details: any = null) {
        super(message);
        this.details = details;
    }
}

export default ValidateException