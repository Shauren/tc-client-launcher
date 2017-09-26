export class FormInputValue {
    input_id: string;
    value: string;
}

export class LoginForm {
    platform_id: string;
    program_id: string;
    version: string;
    inputs: FormInputValue[];
}
