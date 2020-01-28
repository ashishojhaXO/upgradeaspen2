// import { Injectable } from '@angular/core';

// @Injectable()
export class Validator {

    public checkEmailsCommaDelim(emails: string) {
    }
}

export class Rules {
    // Rules like, 
    // Show/Hide elements
    // Add an element in an Array/List on some condition
    // Update an element in an Array/List on some condition
    // Delete another element in an Array/List on some condition
    // Change the Position of an Element in an Array/List on some condition

    // Configuration Tables needed here
    //-


    // Data object which will be passed from some Controller file
    // Some `data` will come from somewhere
    data: Object;
    //-

    // Array of Funcs as `rules`
    arrayOfFuncs: Array<Function>;

    // Some `rule` will come from somewhere else
    //-

    // Constructor
    constructor(data, arrayOfFuncs ) {
        this.data = data;
        this.arrayOfFuncs = arrayOfFuncs;
    }

    runRule() {
        var li = [];
        let ret: boolean = true;
        // Run each passed function 1 after the other 
        // in a chained manner on the data supplied
        this.arrayOfFuncs.forEach(element => {
            if (ret) {
                // If function holds true then don't crash
                // else, crash & throw Error inside the function
                // So the next line `return true` never reaches in case of crash
                ret = element(this.data);
            } else {
                return ret;
            }
        });

        return ret;
    }

    // Rule: To Show or Hide Something


    // Rule: To check if a value exists
    static exists(data) {
        // If data is exists then return true else false
        return data ? true : false;
    }

}

// export class Navigation extends Rules {
//     constructor() {
//         super();
//     }
//     rules = {
//     }
// }

// let r = new Rules()
