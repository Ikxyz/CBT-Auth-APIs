const bcrypt = require('bcrypt');

/** 
 * @Classes contains help functions for easy development
 *  
 * @hash take [password] of type [String] and returns a new #hashed String
 * 
 */

export class Classes {

   public saltRound:number = 10;


      hash(pwd: string):String {
      
        return bcrypt.hashSync(pwd, this.saltRound); 
    }

      compare(pwd: string, hash: string):  Boolean{
     
        return bcrypt.compareSync(pwd, hash);
    } 

}
