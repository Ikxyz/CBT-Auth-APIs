import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Classes } from './classes/index.js';
const app = admin.initializeApp();
const db = app.firestore();

const cls = new Classes();







/**
 *  @login is a [post_request] request that authenticate a user and return  the user data
 *  @param  [email] of type [String]
 *  @param  [pwd] of type [String]
 * 
 */
export const login = functions.https.onRequest(async (req, res) => {
    const email = req.body.email;
    const pwd = req.body.pwd;

    try {
        const user = await db.collection('user').doc(email).get();
        if (user.exists) {
            const userData: any = user.data();
            const origin: string = userData.hash;
            const result: Boolean = cls.compare(pwd, origin);

            if (result) {
                res.send(200).send(true);
            } else {
                res.send(200).send(false);
            }

        } else {
            res.status(404).send({ message: 'user does not exist', status: 404 });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'server error', status: 500 });
    }

});





/**
 *  @register is a [post_request] request that create a new user record in the database
 *  @param  [email] of type [String]
 *          [pwd] of type [String]
 * 
 */
export const register = functions.https.onRequest(async (req, res) => {
    let email: string = req.body.email;
    const pwd: string = req.body.pwd;

    if (!email && !pwd)
        return res.status(400).send({ message: 'email and password can\'t be empty', status: 400 });


    email = email.trim().toLowerCase();

    try {
        const user = await db.collection('user').doc(email).get();
        if (user.exists) {
            return res.status(200).send({ message: 'user already exist', status: false });

        } else {

            try {
                const hash = cls.hash(pwd);
                const data = { email: email, hash: hash, timeStamp: admin.firestore.Timestamp };
                await db.collection('user').doc(email).create(data);

                return res.status(201).send({ message: 'error occurred while creating account', status: true });

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
 *  @postExamById is a [get_request] request that returns a json data
 * 
 *  @param  [id] of type [String]
 * 
 */
export const postExamById = functions.https.onRequest(async (req, res) => {
    const id: string = req.params().id;

    if (!id)
        return res.status(400).send({ message: 'request should contain Id', status: 400 });
    try {
        const data = await db.collection('examination').doc(id).get();
        if (data.exists) {
            return res.status(200).send(data);

        } else {
            return res.status(404).send({ message: 'exam record does not exist', status: 404 });

        }
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
    const year: number = req.params().year;

    if (!year)
        return res.status(400).send({ message: 'request should contain year', status: 400 });


    try {
        const exam = await db.collection('examination').where('year', "==", req).get();
        return res.status(200).send(exam.docs);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'server error', status: 500 });
    }

});



/**
 *  @getExam is a [get_request] request that returns an array of json data of all the exam record created 
 * 
 *  @param  [none]
 * 
 */
export const getAllExam = functions.https.onRequest(async (req, res) => {

    try {
        const exam = await db.collection('examination').get();
        return res.status(200).send(exam.docs);
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

    const data = req.body;

    if (!data) return res.status(400).send({ message: 'receive an empty data', status: 400 })

    if (!data.id) return res.status(400).send({ message: 'exam id not found', status: 400 })

    try {
        await db.collection("examination").doc(data.id).set(data);

        return res.status(201).send({ message: 'success', status: 200, data });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'error ocurred creating data', status: 500 })
    }



});







/**
 *  @postSchool is a [post_request] request that create a new school record in exam record in database 
 * 
 *  @param  [object]
 * 
 */
export const addSchool = functions.https.onRequest(async (req, res) => {

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