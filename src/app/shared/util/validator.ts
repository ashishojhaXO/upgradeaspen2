import { Injectable } from '@angular/core';

@Injectable()
export class Validator {

    public checkEmailsCommaDelim(emails: string) {

        if (emails.trim().length < 1) {
            return false;
        }
        const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        const emailsArr = emails.split(',');
        for (let i = 0; i < emailsArr.length; i += 1) {
            if (!re.test(emailsArr[i].trim())) {
                return false;
            }
        }
        return true;
    }
}
