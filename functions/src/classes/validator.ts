const joi = require('@hapi/joi');


export class Validate {


    public examSchema = joi.object().keys({
        id: joi.string().required(),
        schoolName: joi.string().required(),
        class: joi.string().required(),
        subject: joi.string().required(),
        year: joi.string().required(),
        answer: joi.required(),
        question: joi.required(),
    });


    validateExam(data: object): any {
        const result = joi.validate(data, this.examSchema);
        if (result.error)
            return result.error;
        else
            return true;
    }


}