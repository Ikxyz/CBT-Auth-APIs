import * as bcrypt from 'bcrypt';


/** 
 * @Classes contains help functions for easy development
 *  
 * @hash take [password] of type [String] and returns a new #hashed String
 * 
 */

export class Classes {

   public saltRound:number = 10;

    constructor() {
    }


    hash(pwd: string) {
        let _hash = null;
        bcrypt.hash(pwd, this.saltRound, (err: any, hash: string) => {
            if (err) return console.log(err);
            _hash = hash;
        });
        return _hash;
    }

    compare(pwd: string,hash:string):Boolean{
       return bcrypt.compare(pwd, hash, (err: any, res: boolean) => { 
            return res;
        });
    }

}
