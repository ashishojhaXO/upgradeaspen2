import { Observable } from 'rxjs';

export { TestClass };

class TestClass {

    j1:any = {
    }


    json:any = {
    }

    constructor(){
    }

    someHttpEP() {
        // Some Http end point
        return Observable.of( this.json );
    }


}
