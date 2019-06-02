const bcrypt = require('bcrypt');
import {Validate}  from "./validator";
/** 
 * @Classes contains help functions for easy development
 *  
 * @hash take [password] of type [String] and returns a new #hashed String
 * 
 */
const  validate = new Validate();
export class Classes {

   public saltRound:number = 10;


      hash(pwd: string):string {
      
        return bcrypt.hashSync(pwd, this.saltRound); 
    }

      compare(pwd: string, origin: string):  Boolean{
     
        return bcrypt.compareSync(pwd, origin);
  } 
  
  validateExam(data:object) {
   return validate.validateExam(data);
  }
  
  secureAnswer(data:Array<string>):Array<any> {
    const newData = data.map((e:any) => {
      const x = e.toString().trim().toLocaleLowerCase();
      if (x) {
        return this.hash(x);
      }
      return
    });
    return newData;
  }

}
