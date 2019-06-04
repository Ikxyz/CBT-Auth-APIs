import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Classes } from './classes/index.js';



admin.initializeApp({
    databaseURL: 'https://computerbasetesting.firebaseio.com'
});

const db = admin.firestore();

const cls = new Classes();







/**
 *  @login is a [post_request] request that authenticate a user and return  the user data
 *  @param  [username] of type [String]
 *  @param  [pwd] of type [String]
 * 
 */
export const login = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const username = req.body.username;
    const pwd = req.body.pwd;

    try {
        const user = await db.collection('user').doc(username).get();
        if (user.exists) {
            const userData: any = user.data();

            const result: Boolean = cls.compare(pwd, userData.pwd);

            if (result) {
                userData.pwd = null;
                return res.status(200).send({ status: 200, message: 'success', data: userData });
            } else {
                return res.status(401).send({ status: 401, message: 'incorrect username or password' });
            }

        } else {
            return res.status(404).send({ message: 'user does not exist', status: 404 });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'server error', status: 500 });
    }

});





/**
 *  @register is a [post_request] request that create a new user record in the database
 *  @param  [username] of type [String]
 *          [pwd] of type [String]
 *  [...other]
 * 
 */
export const register = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    let username: string = req.body.username;
    const pwd: string = req.body.pwd;

    if (!username || !pwd)
        return res.status(400).send({ message: 'username and password can\'t be empty', status: 400 });


    username = username.trim().toLowerCase();

    try {
        const user = await db.collection('user').doc(username).get();
        if (user.exists) {
            return res.status(200).send({ message: 'user already exist', status: false });

        } else {

            try {
                const hash = cls.hash(pwd);
                const data = req.body;
                data.pwd = hash;
                data.timeStamp = admin.firestore.Timestamp.now();
                await db.collection('user').doc(username).create(data);

                return res.status(201).send({ message: 'account created', status: true, data: data });

            } catch (err) {
                console.error(err);
                return res.status(500).send({ message: 'error occurred while creating account', status: 500 });
            }


        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'server error', status: 500 });
    }

});





/**
 *  @postExam is a [post_request] request that create a new record in exam record in database 
 * 
 *  @param  [object]
 * 
 */
export const postExam = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    const data = JSON.parse(req.body);
    console.info(data);
    //check for null data
    if (!data) return res.status(400).send({ message: 'receive an empty data', status: 400 })


    // //check for valid exam id and other data
    // const valid = cls.validateExam(data);
    // console.info(valid);
    // if (valid!== true) return res.status(400).send({ message: "received incomplete data", status: 400,data:valid.details})

    //secure answer
    data.question = cls.secureAnswer(data.question);


    try {
        const bat = db.batch();
        bat.set(db.collection("examination").doc(data.id), data);
        bat.set(db.collection("user").doc(data.author).collection('examination').doc(data.id), data);
        await bat.commit();

        return res.status(201).send({ message: 'success', status: 200, data });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'error ocurred creating data', status: 500 })
    }



});







/**
 *  @getExamById is a [get_request] request that returns a json data
 * 
 *  @param  [id] of type [String]
 * 
 */
export const getExamById = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    const id: string = req.query.id;

    if (!id)
        return res.status(400).send({ message: 'request should contain Id', status: 400 });
    try {
        const data = await db.collection('examination').doc(id).get();
        if (data.exists) {
            const output: any = data.data();
           
            output.question = output.question.map((ques: any) => {
                ques.answer = cls.reCalibrateAnswer(ques.options, ques.answer);
                return ques;
             });
            return res.status(200).send(output);

        } else {
            return res.status(404).send({ message: 'exam record does not exist', status: 404 });

        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'server error', status: 500 });
    }

});









/**
 *  @getCreateExamSession is a [get_request] request that returns a json data
 * 
 *  @param  [id] of type [String]
 * 
 */
export const getCreateExamSession = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    const id: string = req.query.id;
    const sessionId: string = req.query.sessionId;

    if (!id)
        return res.status(400).send({ message: 'request should contain Id', status: 400 });
    try {
        const data = await db.collection('examination').doc(id).get();
        const session = await db.collection('examinationSession').doc(sessionId).set({
            id: sessionId,
            //TODO: collect teacher info and validate
            overSite: 'not-set',
            

        });
        if (data.exists) {
            const output: any = data.data();
           
            output.question = output.question.map((ques: any) => {
                ques.answer = '';
                return ques;
             });
            return res.status(200).send({sessionId,data:output});

        } else {
            return res.status(404).send({ message: 'exam record does not exist', status: 404 });

        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'server error', status: 500 });
    }

});








/**
 *  @getExamByAuthor is a [get_request] request that returns an array of json data queried from database by [author] 
 * 
 *  @param  [author] of type [String]
 * 
 */
export const getExamByAuthor = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    const author: number = req.query.author;

    if (!author)
        return res.status(400).send({ message: 'request should contain author id', status: 400 });

    try {
        const examArray = await db.collection('examination').where('author', "==", author).get();
        const data = examArray.docs.map((examSheet_) => {
            const _examSheet = examSheet_.data();
            _examSheet.question = _examSheet.question.map((ques: any) => {
                ques.answer = cls.reCalibrateAnswer(ques.options, ques.answer);
                return ques;
             });
           // newExam.question = cls.reCalibrateAnswer(newExam.question);
            return _examSheet;
        });
        console.info(data);
        return res.status(200).send({data});
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'server error', status: 500 });
    }

});












/**
 *  @getExamByYear is a [get_request] request that returns an array of json data queried from database by [year] 
 * 
 *  @param  [year] of type [Number]
 * 
 */
export const getExamByYear = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    const year: number = req.query.year;

    if (!year)
        return res.status(400).send({ message: 'request should contain year', status: 400 });

    try {
        const examArray = await db.collection('examination').where('year', "==", req).get();
        const data = examArray.docs.map((exam) => {
            const newExam = exam.data();
           // newExam.question = cls.reCalibrateAnswer(newExam.question);
            return newExam;
        });
        console.info(data);
        return res.status(200).send(data);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'server error', status: 500 });
    }

});



/**
 *  @getAllExam is a [get_request] request that returns an array of json data of all the exam record created 
 * 
 *  @param  [none]
 * 
 */
export const getAllExam = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    try {
        const examList = await db.collection('examination').get();
        const data = examList.docs.map((exam) => {
            const newExam = exam.data();
          //  newExam.question = cls.reCalibrateAnswer(newExam.question);
            return newExam;
        });
        console.info(data);
        return res.status(200).send(data);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'server error', status: 500 });
    }

});










/**
 *  @postSchool is a [post_request] request that create a new school record in exam record in database 
 * 
 *  @param  [object]
 * 
 */
export const addSchool = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    const data = req.body;

    if (!data) return res.status(400).send({ message: 'receive an empty data', status: 400 })

    if (!data.id) return res.status(400).send({ message: 'school id not found', status: 400 })

    try {
        await db.collection("school").doc(data.id).set(data);

        return res.status(201).send({ message: 'success', status: 200, data });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'error ocurred creating data', status: 500 })
    }

});




