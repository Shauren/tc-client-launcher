export enum FormType {
    LOGIN_FORM = <any>'LOGIN_FORM'
}

export class FormInput {
    input_id: string;
    type: string;
    label: string;
    max_length: number;
}

export class FormInputs {
    type: FormType;
    inputs: FormInput[];
}
